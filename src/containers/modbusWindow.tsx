import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { SOCKET_IP } from "../utils/static";

const ModbusWindow = () => {
  const [appModbusDevices, setAppModbusDevices] = useState<IModbusDevice[]>([]);

  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket>();
  const connectSocket = async () => {
    return await new Promise<Socket | undefined>((res) => {
      console.log("create socket");
      const newSocket = io(SOCKET_IP, { transports: ["websocket"] });
      newSocket.on("connect", () => {
        console.log("connect socket");
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
    socket?: Socket
  ) => {
    if (socket) {
      socket.emit(channel, data);
    }
  };
  const createModbusDevicesFn = (socket?: Socket) => {
    return createOnFunction(
      "modbusDevice",
      async (modbusDevices: string) => {
        const newAppModbusDevice: IModbusDevice[] = JSON.parse(modbusDevices);
        setAppModbusDevices(newAppModbusDevice);
        createEmitFunction("readData", "", socket);
      },
      socket
    );
  };
  const createUpdateModbusValue = (socket?: Socket) => {
    return createOnFunction(
      "updateModbusValue",
      (data: any) => {
        setAppModbusDevices((props) => {
          return props.map((device) => {
            if (
              device.ipAddress === data.ipAddress &&
              device.port === data.port
            ) {
              return {
                ...device,
                groups: device.groups
                  ? device.groups.map((group) => {
                      if (
                        data.address >= group.start &&
                        data.address < group.start + group.length
                      ) {
                        return {
                          ...group,
                          targets: group.targets.map((target) => {
                            if (data.address === target.position) {
                              return {
                                ...target,
                                value: data.value,
                              };
                            } else {
                              return target;
                            }
                          }),
                        };
                      } else {
                        return group;
                      }
                    })
                  : [],
              };
            } else {
              return device;
            }
          });
        });
      },
      socket
    );
  };

  const getModbusDevice = (socket?: Socket) => {
    createEmitFunction("getModbusDevice", "", socket);
    // if (window.electron) {
    //   window.electron.ipcRenderer.sendMessage("getModbusDevice", "");
    // } else if (socket) {
    //   socket.emit("getModbusDevice", "");
    // }
  };

  useEffect(() => {
    // const unsubscribe =
    connectSocket().then((socket) => {
      const getModbusDevices = createModbusDevicesFn(socket);
      const updateModbusValue = createUpdateModbusValue(socket);

      getModbusDevice(socket);
      return () => {
        if (getModbusDevices) getModbusDevices();
        if (updateModbusValue) updateModbusValue();
      };
    });

    return () => {
      // if (unsubscribe) unsubscribe();
    };
  }, []);

  const modbusDataUpdate = (device: IModbusDevice, target: IModbusTarget) => {
    const value = Math.floor(Math.random() * 10000);
    if (socket) {
      socket.emit("writeModbusData", {
        ipAddress: device.ipAddress,
        port: device.port,
        address: target.position,
        value,
      });
    }
  };

  return (
    <div className="page-container">
      <section
        style={{ background: "#FFF", color: "black", overflow: "scroll" }}
      >
        <div>Modbus</div>
        <div
          onClick={() => {
            navigate(-1);
          }}
        >
          back
        </div>
        <div
          onClick={() => {
            navigate("/modbusEdit");
          }}
        >
          edit
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <colgroup>
            <col width={100} span={2} />
            <col width={300} span={2} />
            <col width={100} span={2} />
          </colgroup>
          <tbody>
            {appModbusDevices.map((device) => {
              return (
                <>
                  {device.deviceType === 1 ? (
                    <>
                      <tr style={{ fontWeight: "bold" }}>
                        <th colSpan={2}>IP</th>
                        <th colSpan={2}>포트</th>
                        <th colSpan={2}>디바이스 이름</th>
                      </tr>
                      <tr
                        onClick={() => {
                          navigate("/modbusEdit", {
                            state: {
                              viewType: "device",
                              ...device,
                            },
                          });
                        }}
                      >
                        <td colSpan={2}>{device.ipAddress}</td>
                        <td colSpan={2}>{device.port}</td>
                        <td colSpan={2}>{device.name}</td>
                      </tr>
                    </>
                  ) : device.deviceType === 2 ? (
                    <>
                      <tr style={{ fontWeight: "bold" }}>
                        <th>ComPort</th>
                        <th>BaudRate</th>
                        <th>Parity</th>
                        <th>DataBit</th>
                        <th>StopBit</th>
                        <th>SlaveID</th>
                      </tr>
                      <tr
                        onClick={() => {
                          navigate("/modbusEdit", {
                            state: {
                              viewType: "device",
                              ...device,
                            },
                          });
                        }}
                      >
                        <td>{device.comPort}</td>
                        <td>{device.baudRate}</td>
                        <td>{device.parity}</td>
                        <td>{device.dataBit}</td>
                        <td>{device.stopBit}</td>
                        <td>{device.slaveId}</td>
                      </tr>
                    </>
                  ) : undefined}
                  {device.groups &&
                    device.groups.map((group) => {
                      return (
                        <>
                          <tr>
                            <th colSpan={2} style={{ border: "none" }}></th>
                            <th>그룹명</th>
                            <th>시작주소</th>
                            <th>길이</th>
                            <th>갱신주기(ms)</th>
                          </tr>
                          <tr
                            onClick={() => {
                              navigate("/modbusEdit", {
                                state: {
                                  viewType: "device",
                                  ...device,
                                },
                              });
                            }}
                          >
                            <td colSpan={2} style={{ border: "none" }}></td>
                            <td>{group.name}</td>
                            <td>{group.start}</td>
                            <td>{group.length}</td>
                            <td>{group.delay}</td>
                          </tr>
                          <tr>
                            <th colSpan={3} style={{ border: "none" }}></th>
                            <th>타겟명</th>
                            <th>주소</th>
                            <th>값</th>
                          </tr>
                          {group.targets.map((target) => {
                            return (
                              <>
                                <tr
                                  onClick={() => {
                                    navigate("/modbusEdit", {
                                      state: {
                                        viewType: "target",
                                        ...target,
                                      },
                                    });
                                  }}
                                >
                                  <td
                                    colSpan={3}
                                    style={{ border: "none" }}
                                  ></td>
                                  <td>{target.name}</td>
                                  <td>{target.position}</td>
                                  <td
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      modbusDataUpdate(device, target);
                                    }}
                                  >
                                    {target.value}
                                  </td>
                                </tr>
                              </>
                            );
                          })}
                        </>
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

export default ModbusWindow;
