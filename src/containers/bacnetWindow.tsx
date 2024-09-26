import { useEffect, useState } from 'react';
import { map, orderBy } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { SOCKET_IP } from "../utils/static";

const BacnetWindow = () => {
  const [appBacnetDevices, setAppBacnetDevices] = useState<IBacnetDevice[]>([]);
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket>();
  const connectSocket = async () => {
    return await new Promise<Socket | undefined>((res) => {
      console.log('create socket');
      const newSocket = io(SOCKET_IP, { transports: ['websocket'] });
      newSocket.on('connect', () => {
        console.log('connect socket');
      });
      setSocket(newSocket);
      res(newSocket);
    });
  };
  const createOnFunction = (channel: Channels, func: any, socket?: Socket) => {
    if (socket) {
      socket.on(channel, func);
      return () => {
        socket.off(channel, func);
      };
    }
  };

  const createEmitFunction = (
    channel: Channels,
    data: any,
    socket?: Socket,
  ) => {
    if (socket) {
      socket.emit(channel, data);
    }
  };
  const updateBacnetDevices = (data: any) => {
    setAppBacnetDevices((props) => {
      return props.map((device) => {
        if (device.sender.address === data.sender.address) {
          return {
            ...device,
            object_list: device.object_list.map((object: any) => {
              if (
                JSON.stringify(object.object_identifier) ===
                JSON.stringify(data.object)
              ) {
                return { ...object, ...data.updateData };
              }
              return object;
            }),
          };
        }
        return device;
      });
    });
  };
  const getBacnetDevices = (socket?: Socket) => {
    createOnFunction(
      'bacnetDevices',
      (data: IBacnetDevice[]) => {
        console.log('on bacnetDevices');
        const newBacnetDevice: IBacnetDevice[] = map(data, (device) => {
          return {
            ...device,
            object_list: orderBy(device.object_list, ['id'], ['asc']),
          };
        });
        setAppBacnetDevices(newBacnetDevice);
      },
      socket,
    );
  };
  const updateBacnet = (socket?: Socket) => {
    createOnFunction(
      'updateBacnet',
      (data: any) => {
        updateBacnetDevices(data);
      },
      socket,
    );
  };

  useEffect(() => {
    connectSocket().then((socket) => {
      getBacnetDevices(socket);
      updateBacnet(socket);
      createEmitFunction('getBacnetDevices', '', socket);
    });
  }, []);

  const subscibeBacnetObject = (
    sender: IBacnetSender,
    object: IBacnetIdentifier,
    enabled: boolean,
  ) => {
    createEmitFunction('getUpdateBacnet', { sender, object, enabled }, socket);
    // window.electron.ipcRenderer.sendMessage("getUpdateBacnet", { sender, object, enabled });
  };

  const onContextMenu = (type: string, device: IBacnetDevice) => {
    createEmitFunction('show-context-menu', { type, device }, socket);
    // window.electron.ipcRenderer.sendMessage("show-context-menu", { type, device });
  };

  return (
    <div className="page-container">
      <section
        style={{ background: '#FFF', color: 'black', overflow: 'scroll' }}
      >
        <div>Bacnet</div>
          <>
            <div
              onClick={() => {
                navigate(-1);
              }}
            >
              back
            </div>
            <div
              onClick={() => {
                createEmitFunction('bacnetSacn', '', socket);
              }}
            >
              bacnet scan
            </div>
          </>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ fontWeight: 'bold' }}>
              <td>DeviceId</td>
              <td>DeviceAddress</td>
              <td>DeviceName</td>
              <td>DeviceVendor</td>
              <td>ObjectId</td>
              <td>ObjectName</td>
              <td>ObjectDescription</td>
              <td>ObjectType</td>
              <td>enabled</td>
              <td>ObjectValue</td>
            </tr>
            {appBacnetDevices.map((device) => {
              return (
                <>
                  {device.object_list.map((object: any) => {
                    return (
                      <tr
                        key={object.id}
                        onContextMenu={() => {
                          onContextMenu('bacnet', device);
                        }}
                        onClick={() => {
                          subscibeBacnetObject(
                            device.sender,
                            object.object_identifier,
                            !object.enabled,
                          );
                        }}
                      >
                        <td>{device.name}</td>
                        <td>{device.sender.address}</td>
                        <td>{device.object_name}</td>
                        <td>{device.vendor_name}</td>
                        <td>{object.id}</td>
                        <td>{object.object_name}</td>
                        <td>{object.description}</td>
                        <td>{object.object_type}</td>
                        <td>{object.enabled ? '1' : '0'}</td>
                        <td>{object.present_value}</td>
                      </tr>
                    );
                  })}
                </>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default BacnetWindow;
