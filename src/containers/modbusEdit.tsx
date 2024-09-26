import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { io, Socket } from "socket.io-client";
import { SOCKET_IP } from "../utils/static";

const ModbusEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    unregister,
    handleSubmit,
    control,
    reset,
    watch,
    getValues,
  } = useForm();
  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "groups", // unique name for your Field Array
    keyName: "key",
  });
  const [viewType, setViewType] = useState<"device" | "group" | "target">(
    "device"
  );
  const [originDevice, setOriginDevice] = useState<IModbusDevice>();
  const [isModify, setIsModify] = useState<boolean>(false);
  const [ports, setPorts] = useState<{ path: string }[]>([]);
  const wDeviceType = watch("deviceType", 1);
  const wComPort = watch("comPort");
  const [socket, setSocket] = useState<Socket>();
  const connectSocket = async () => {
    return await new Promise<Socket | undefined>((res) => {
      console.log("create socket");
      const newSocket = io(SOCKET_IP, { transports: ["websocket"] });
      newSocket.on("connect", () => {
        console.log("connect socket");
      });
      newSocket.on("back", () => {
        navigate(-1);
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
    console.log(data);
    if (socket) {
      console.log("socket");
      socket.emit(channel, data);
    }
  };

  const getSerialPort = (socket?: Socket) => {
    createOnFunction(
      "serialPort",
      (data: any) => {
        setPorts(data);
      },
      socket
    );
  };
  // const modbusSetting = (socket?: Socket) => {
  //   createOnFunction("modbusSetting", (data: any) => {
  //     setViewType(data.viewType);
  //     reset(data);
  //     if (data.viewType === "device") {
  //       console.log(data);
  //       setIsModify(true);
  //       setOriginDevice(data);
  //     }
  //   }, socket)
  // }

  useEffect(() => {
    connectSocket().then((socket) => {
      getSerialPort(socket);
      const data = location.state;
      console.log(data);
      if (data) {
        setViewType(data.viewType);
        reset(data);
        if (data.viewType === "device") {
          console.log(data);
          setIsModify(true);
          setOriginDevice(data);
        }
      }
    });
    // const getSerialPort = window.electron.ipcRenderer.on("serialPort", data => {
    //   setPorts(data);
    // });

    // }

    // return () => {
    //   if (getSerialPort) getSerialPort();
    //   if(modbusSetting) modbusSetting();
    // };
  }, []);
  useEffect(() => {
    if (wComPort === "edit") {
      register("comPortEdit");
    } else {
      unregister("comPortEdit");
    }
  }, [wComPort]);
  useEffect(() => {
    if (wDeviceType === 1) {
      unregister("comPort");
      unregister("baudRate");
      unregister("parity");
      unregister("dataBit");
      unregister("stopBit");
      register("ipAddress");
      register("port");
    } else if (wDeviceType === 2) {
      getSerialPort(socket);
      unregister("ipAddress");
      unregister("port");
      register("comPort");
      register("baudRate");
      register("parity");
      register("dataBit");
      register("stopBit");
    }
  }, [wDeviceType]);

  const submit = handleSubmit((sendData) => {
    if (sendData.comPort === "edit") {
      sendData.comPort = sendData.comPortEdit;
    }
    if (viewType === "device") {
      if (isModify) {
        console.log("isModify", sendData);
        createEmitFunction("updateModbusDevice", sendData, socket);
      } else {
        createEmitFunction("addModbusDevice", sendData, socket);
      }
    }
  });

  const targetSubmit = handleSubmit((sendData) => {
    console.log(sendData);
    createEmitFunction("updateModbusTarget", sendData, socket);
  });

  const deleteFn = () => {
    if (originDevice) {
      createEmitFunction(
        "deleteModbus",
        {
          ipAddress: originDevice.ipAddress,
          port: originDevice.port,
          id: originDevice.id,
        },
        socket
      );
      // window.electron.ipcRenderer.sendMessage("deleteModbus", { ipAddress: originDevice.ipAddress, port: originDevice.port, id: originDevice.id });
    }
  };

  return (
    <div>
      <div>ModbusEdit</div>
      <div
        onClick={() => {
          navigate(-1);
        }}
      >
        back
      </div>
      {viewType === "device" ? (
        <form onSubmit={submit}>
          <div>
            <div>name</div>
            <input {...register("name")}></input>
          </div>
          <div>
            <div>deviceType</div>
            <select
              defaultValue={1}
              {...register("deviceType", {
                valueAsNumber: true,
                required: true,
              })}
            >
              <option value="1">TCP</option>
              <option value="2">RTU</option>
            </select>
          </div>
          {wDeviceType === 1 && (
            <>
              <div>
                <div>ipAddress</div>
                <input {...register("ipAddress", { required: true })}></input>
              </div>
              <div>
                <div>port</div>
                <input
                  {...register("port", { valueAsNumber: true, required: true })}
                  type="number"
                ></input>
              </div>
            </>
          )}
          {wDeviceType === 2 && (
            <>
              <div>
                <div>comPort</div>
                <select {...register("comPort", { required: true })}>
                  {ports.map((port) => {
                    return <option value={port.path}>{port.path}</option>;
                  })}
                  <option value={"edit"}>직접입력</option>
                </select>
                {wComPort === "edit" && (
                  <input {...register("comPortEdit")}></input>
                )}
              </div>
              <div>
                <div>baudRate</div>
                <input
                  {...register("baudRate", {
                    valueAsNumber: true,
                    required: true,
                  })}
                  type="number"
                ></input>
              </div>
              <div>
                <div>parity</div>
                <select
                  defaultValue={"none"}
                  {...register("parity", { required: true })}
                >
                  <option value="none">none</option>
                  <option value="space">space</option>
                  <option value="even">even</option>
                  <option value="odd">odd</option>
                  <option value="mark">mark</option>
                </select>
              </div>
              <div>
                <div>dataBit</div>
                <select
                  defaultValue={8}
                  {...register("dataBit", {
                    valueAsNumber: true,
                    required: true,
                  })}
                >
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                </select>
              </div>
              <div>
                <div>stopBit</div>
                <select
                  defaultValue={1}
                  {...register("stopBit", {
                    valueAsNumber: true,
                    required: true,
                  })}
                >
                  <option value="1">1</option>
                  <option value="1.5">1.5</option>
                  <option value="2">2</option>
                </select>
              </div>
              <div>
                <div>slaveId</div>
                <input
                  {...register("slaveId", {
                    valueAsNumber: true,
                    required: true,
                  })}
                  type="number"
                ></input>
              </div>
            </>
          )}
          <div>
            <button
              type="button"
              onClick={() => {
                append({
                  name: "",
                  start: "",
                  length: "",
                  delay: "",
                  type: "",
                  id: undefined,
                  targetName: "",
                });
              }}
            >
              그룹추가
            </button>
          </div>
          <div>
            {fields.map((field, index) => {
              console.log(getValues(`groups.${index}`));
              return (
                <div style={{ padding: 20 }} key={field.key}>
                  <div>
                    <div>name</div>
                    <input {...register(`groups.${index}.name`)} />
                  </div>
                  <div>
                    <div>start</div>
                    <input
                      {...register(`groups.${index}.start`, {
                        valueAsNumber: true,
                        required: true,
                      })}
                    />
                  </div>
                  <div>
                    <div>length</div>
                    <input
                      {...register(`groups.${index}.length`, {
                        valueAsNumber: true,
                        required: true,
                      })}
                    />
                  </div>
                  <div>
                    <div>delay</div>
                    <input
                      {...register(`groups.${index}.delay`, {
                        valueAsNumber: true,
                        required: true,
                      })}
                    />
                  </div>
                  <div>
                    <div>type</div>
                    <select
                      defaultValue={3}
                      {...register(`groups.${index}.type`, {
                        valueAsNumber: true,
                        required: true,
                      })}
                    >
                      <option value="0">Coils</option>
                      <option value="1">DiscreteInputs</option>
                      <option value="2">InputRegisters</option>
                      <option value="3">HoldingRegisters</option>
                    </select>
                  </div>
                  <div>
                    <div>targetName</div>
                    <input
                      disabled={getValues(`groups.${index}.id`)}
                      {...register(`groups.${index}.targetName`)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
          {isModify ? (
            <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
              <button type="submit">수정</button>
              <button type="button" onClick={() => deleteFn()}>
                삭제
              </button>
            </div>
          ) : (
            <>
              <button type="submit">추가</button>
            </>
          )}
        </form>
      ) : (
        <div>
          <form onSubmit={targetSubmit}>
            <div>
              <div>name</div>
              <input {...register("name")}></input>
            </div>
            <div>
              <div>position</div>
              <input
                {...register("position", { valueAsNumber: true })}
                type="number"
              ></input>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
              <button type="submit">수정</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ModbusEdit;
