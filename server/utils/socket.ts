import { Server } from "socket.io";
import { generateDevice } from "./deviceValue";
import { addModbusDevice, getModbusDevice } from "../routes/modbus";

const socketServer = new Server({ transports: ["websocket"] });
socketServer.on("connection_error", (err) => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});
socketServer.on("connection", (socket) => {
  console.log("socketIOConnect");
  // console.log(socketServer.sockets.sockets);
  socket.on('getModbusDevice', async () => {
    console.log('getModbusDevice');
    const modbusDevices = await getModbusDevice();
    socket.emit('modbusDevice', JSON.stringify(modbusDevices));
  });
  // socket.on('writeModbusData', (data) => {
  //   const modbusDevice = modbusDevices.find(
  //     (device) =>
  //       device.ipAddress === data.ipAddress && device.port === data.port,
  //   );
  //   if (modbusDevice) {
  //     writeModbusData(modbusDevice, data.address, data.value);
  //   }
  // });
  socket.on('addModbusDevice', async (data) => {
    const newModbusDevice = generateDevice(data);
    await addModbusDevice(newModbusDevice);
    
    socket.emit('back');
  });
  // socket.on('deleteModbus', async (data) => {
  //   const modbusDevice = modbusDevices.find(
  //     (device) =>
  //       device.ipAddress === data.ipAddress && device.port === data.port,
  //   );
  //   if (modbusDevice) {
  //     await deleteModbusDevice(modbusDevice);
  //     await getModbus();
  //     socket.emit('back');
  //   }
  // });
  // socket.on('updateModbusDevice', async (data) => {
  //   const newModbusDevice = generateDevice(data);
  //   await updateModbusDevice({ ...newModbusDevice[0], id: data.id });
  //   await getModbus();
  //   socket.emit('back');
  // });
  // socket.on('updateModbusTarget', async (data) => {
  //   await updateModbusTarget(data);
  //   await getModbus();
  //   socket.emit('back');
  // });
  // socket.on('getBacnetDevices', async () => {
  //   console.log('getBacnetDevices');
  //   bacnetDevice = await getBacnetDevice();
  //   socket.emit('bacnetDevices', bacnetDevice);
  // });
  // socket.on('getUpdateBacnet', (data) => {
  //   updateBacnetSubscribe(data.sender, data.object, data.enabled);
  // });
  // socket.on('bacnetSacn', async () => {
  //   await getDevices();
  //   setTimeout(async () => {
  //     bacnetDevice = await getBacnetDevice();

  //     socket.emit('bacnetDevices', bacnetDevice);
  //     socket.emit('');
  //   }, 5000);
  // });
});

export const createSocket = () => {
  console.log("createSocket");
  socketServer.listen(9001);
};

export default socketServer;
