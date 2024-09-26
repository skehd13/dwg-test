// import Bacnet, { enums } from '@vertics/ts-bacnet';
// import { map } from 'lodash';
// import {
//   parseDeviceObject,
//   getObjectType,
//   devicePropSubSet,
//   subscribeObjectParser,
// } from './bacnetFn';
// // import { sendBacnetData, updateBacnet } from './main';
// // import { addBacnetDeice, getBacnetDevice } from './sqlite';

// // create instance of Bacnet
// const bacnetClient = new Bacnet({
//   apduTimeout: 4000,
//   interface: '0.0.0.0',
// });
// let subscribeCOVId = 0;
// const subscribeCOVObjects: {
//   subscribeCOVId?: number;
//   device_id: string;
//   sender: IBacnetSender;
//   object: IBacnetIdentifier;
// }[] = [];
// /**
//  * 255.255.255.255 (broadcast)로 bacnet whois함수를 호출
//  */
// export const getDevices = () => {
//   bacnetClient.whoIs('255.255.255.255');
// };

// /**
//  * BACnet Object의 Property가 변경될때 변경된 값을 subscribe하는 함수
//  * @param sender IBacnetSender
//  * @param object IBacnetIdentifier
//  * @param device_id string
//  * @returns void
//  */
// export const subscribeCOV = (
//   sender: IBacnetSender,
//   object: IBacnetIdentifier,
//   device_id: string,
// ) => {
//   const newObject = { sender, object, device_id };
//   const checkObject = subscribeCOVObjects.find(
//     ({ object, sender, device_id }) =>
//       sender.address === newObject.sender.address &&
//       sender.forwardedFrom === newObject.sender.forwardedFrom &&
//       object.instance === newObject.object.instance &&
//       object.type === newObject.object.type &&
//       device_id === newObject.device_id,
//   );
//   if (checkObject) {
//     return;
//   }
//   subscribeCOVId = subscribeCOVId + 1;
//   subscribeCOVObjects.push({ ...newObject, subscribeCOVId });
//   bacnetClient.subscribeCov(
//     sender,
//     object,
//     subscribeCOVId,
//     false,
//     false,
//     0,
//     {},
//     (err) => {
//       if (err) {
//         console.log('subscribeCOV Err ' + err);
//       }
//     },
//   );
// };

// /**
//  * subscribeCOV함수로 등록한 subscribe를 해제하는 함수
//  * @param sender IBacnetSender
//  * @param object IBacnetIdentifier
//  * @param device_id string
//  * @param subscribeCOVId number
//  */
// export const unsubscribeCOV = (
//   sender: IBacnetSender,
//   object: IBacnetIdentifier,
//   device_id: string,
//   subscribeCOVId?: number,
// ) => {
//   if (subscribeCOVId !== undefined) {
//     bacnetClient.subscribeCov(
//       sender,
//       object,
//       subscribeCOVId,
//       false,
//       false,
//       1,
//       {},
//       (err) => {
//         if (err) {
//           console.log('unsubscribeCOV Err ' + err);
//         }
//       },
//     );
//   } else {
//     const findSubIndex = subscribeCOVObjects.findIndex(
//       (subObject) =>
//         subObject.sender.address === sender.address &&
//         subObject.sender.forwardedFrom === sender.forwardedFrom &&
//         subObject.object.instance === object.instance &&
//         subObject.object.type === object.type &&
//         subObject.device_id === device_id,
//     );
//     if (findSubIndex >= 0) {
//       const findSub = subscribeCOVObjects[findSubIndex];
//       if (findSub && findSub.subscribeCOVId) {
//         bacnetClient.subscribeCov(
//           sender,
//           object,
//           findSub.subscribeCOVId,
//           false,
//           false,
//           1,
//           {},
//           (err) => {
//             console.log('unsubscribeCOV' + err);
//           },
//         );
//         subscribeCOVObjects.splice(findSubIndex, 1);
//       }
//     }
//   }
// };

// /**
//  * subscribeCOV함수로 등록한 전체 subscribe를 해제하는 함수
//  * @param device_id string
//  */
// export const unsubscribeCOVAll = async (device_id?: string) => {
//   await Promise.all(
//     subscribeCOVObjects.map((device) => {
//       if (device_id) {
//         if (device.device_id === device_id) {
//           unsubscribeCOV(
//             device.sender,
//             device.object,
//             device_id,
//             device.subscribeCOVId || 0,
//           );
//         }
//       } else {
//         unsubscribeCOV(
//           device.sender,
//           device.object,
//           device.device_id,
//           device.subscribeCOVId || 0,
//         );
//       }
//     }),
//   );
//   subscribeCOVObjects.length = 0;
// };

// // emitted on errors
// bacnetClient.on('error', (err) => {
//   console.error(err);
//   bacnetClient.close();
// });

// /**
//  * subscribeCOV로 등록된 Object가 변경될떄 변경된 값을 받는 함수
//  * updateBacnet함수를 통해 renderer프로세스로 해당 값을 전송
//  */
// bacnetClient.on('covNotifyUnconfirmed', (data) => {
//   const value = subscribeObjectParser(data.payload);
//   updateBacnet(data.header.sender, data.payload.monitoredObjectId, value);
// });

// // emmitted when Bacnet server listens for incoming UDP packages
// bacnetClient.on('listening', () => {
//   console.log('connect bacnet: ' + Date.now());
// });

// const bacnetDevice: IBacnetDevice[] = [];

// /**
//  * whoid함수를 호출했을때 각 디바이스에서 디바이스 정보를 받아오는 함수
//  */
// bacnetClient.on('iAm', (device) => {
//   const deviceName = 'BAC_' + device.payload.deviceId;
//   const changeDevice = {
//     id: deviceName,
//     name: deviceName,
//     sender: device.header.sender,
//     deviceId: device.payload.deviceId,
//   };

//   const propertyList: { id: enums.PropertyIdentifier }[] = [];
//   devicePropSubSet.forEach((item) => {
//     propertyList.push({ id: item });
//   });

//   const requestArray = [
//     {
//       objectId: {
//         type: enums.ObjectType.DEVICE,
//         instance: changeDevice.deviceId,
//       },
//       properties: propertyList,
//     },
//   ];
//   bacnetClient.readPropertyMultiple(
//     changeDevice.sender,
//     requestArray,
//     {},
//     (err, res) => {
//       if (err) console.log('err', err);
//       parseDeviceObject(
//         changeDevice.sender,
//         res,
//         { type: 8, instance: changeDevice.deviceId },
//         true,
//         bacnetClient,
//         async (res: IBacnetDevice) => {
//           if (res.object_list) {
//             const filterObject = res.object_list.filter(
//               (object) => object.object_identifier,
//             );
//             res.object_list = map(filterObject, (object) => {
//               const object_identifier: IBacnetIdentifier =
//                 typeof object.object_identifier === 'string'
//                   ? JSON.parse(object.object_identifier)
//                   : object.object_identifier;
//               return {
//                 ...object,
//                 id: `${deviceName}_${getObjectType(object_identifier.type)}_${object_identifier.instance}`,
//               };
//             });
//           }
//           const device: IBacnetDevice = { ...changeDevice, ...res };
//           bacnetDevice.push(device);
//           await addBacnetDeice(device);
//           const bacnetDeivce2 = await getBacnetDevice();
//           sendBacnetData(bacnetDeivce2);
//         },
//       );
//     },
//   );
// });
