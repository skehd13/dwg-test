import { ModbusTCPClient, ModbusRTUClient } from "jsmodbus";
import { find } from "lodash";
// import { SerialPort } from "serialport";
import { SerialPort } from "serialport";
import net from "net";
import socketServer from "./socket";

interface IInterval {
  ipAddress: string;
  port: number;
  interval: NodeJS.Timeout;
}
let intervals: IInterval[] = [];
// let webContents: Electron.WebContents | undefined;
/**
 * 받아온 디바이스 값을 이용하여 modbus-TCP 연결
 * @param device IModbusDevice
 * @returns IModbusDevice
 */
export const createModbus = (device: IModbusDevice) => {
  if (device.deviceType === 1) {
    return connectTCPModbus(device);
  } else if (device.deviceType === 2) {
    return connectRTUModbus(device);
  }
};

const connectTCPModbus = (device: IModbusDevice) => {
  const socket = new net.Socket();
  const options: net.SocketConnectOpts = {
    host: device.ipAddress,
    port: device.port,
  };
  socket.on("connect", () => {
    console.log("socket connect", device.ipAddress, device.port);
    readData(device);
  });
  socket.on("close", () => {
    console.log("socket close", device.ipAddress, device.port);
    clearDeviceInterval(device);
    socket.connect(options);
  });
  socket.on("error", (err) => {
    console.log("socket error", err);
  });
  socket.connect(options);
  const client = new ModbusTCPClient(socket, 1, 60000);
  device.socket = socket;
  device.client = client;
  return device;
};

export const listSerialPorts = async () => {
  console.log("get list");
  const ports = await SerialPort.list().then(async (info) => {
    console.log("!!!!!!!");
    console.log(info);
    const ports: { port: string }[] = [];
    await Promise.all(
      info.map((serial) => {
        if (serial.productId) {
          ports.push({ port: serial.path });
        }
      })
    );
    return ports;
  });
  console.log("ports: ", ports);
  return ports;
};

const connectRTUModbus = (device: IModbusDevice) => {
  const socket = new SerialPort(
    {
      path: device.comPort,
      baudRate: device.baudRate,
      stopBits: device.stopBit,
      dataBits: device.dataBit,
      parity: device.parity,
    },
    (err) => {
      console.log(err);
    }
  );
  // const options: net.SocketConnectOpts = {
  //   host: device.ipAddress,
  //   port: device.port
  // };
  socket.on("connect", () => {
    console.log("socket connect", device.ipAddress, device.port);
    readData(device);
  });
  socket.on("close", () => {
    console.log("socket close", device.ipAddress, device.port);
    clearDeviceInterval(device);
    socket.open();
  });
  socket.on("error", (err) => {
    console.log("socket error", err);
  });
  socket.open();

  const client = new ModbusRTUClient(socket, 1, 60000);
  device.socket = socket;
  device.client = client;
  return device;
};

// export const setWebContents = (newWebContents?: Electron.WebContents) => {
//   webContents = newWebContents;
// };

/**
 * 각 디바이스의 값을 받아와서 주기적으로 업데이트하는 함수
 * 업데이트 함수는 intervals로 등록됨
 * @param device IModbusDevice
 * @param webContents Electron.WebContents
 * @returns
 */
const readData = async (device: IModbusDevice) => {
  // if (intervals.length > 0) {
  await clearDeviceInterval(device);
  // }
  const newDevice = device;
  if (!newDevice.groups) {
    return;
  }
  return await Promise.all(
    newDevice.groups.map(async (group) => {
      const client = device.client;
      if (!client) {
        console.log("client not found!!!!!");
      }
      if (client) {
        // await Promise.all(
        //   groups.map(group => {
        const interval = setInterval(() => {
          const readFn = (type: number, start: number, length: number) => {
            if (type === 0) {
              return client.readCoils(start, length);
            } else if (type === 1) {
              return client.readDiscreteInputs(start, length);
            } else if (type === 2) {
              return client.readInputRegisters(start, length);
            } else {
              return client.readHoldingRegisters(start, length);
            }
          };
          readFn(group.type, group.start, group.length)
            .then((data) => {
              const values = data.response.body.valuesAsArray;
              values.map((value: any, index) => {
                const target = find(group.targets, {
                  position: group.start + index,
                });
                if (target) {
                  let newValue = value;
                  if (target.parsing) {
                    if (target.parsing.match(/^\//)) {
                      const parse = parseInt(
                        target.parsing.replaceAll(/^\//g, "")
                      );
                      newValue = value / parse;
                    } else if (target.parsing.match(/^\*/)) {
                      const parse = parseInt(
                        target.parsing.replaceAll(/^\*/g, "")
                      );
                      newValue = value * parse;
                    } else if (target.parsing.match(/^\+/)) {
                      const parse = parseInt(
                        target.parsing.replaceAll(/^\+/g, "")
                      );
                      newValue = value + parse;
                    } else if (target.parsing.match(/^\-/)) {
                      const parse = parseInt(
                        target.parsing.replaceAll(/^\-/g, "")
                      );
                      newValue = value - parse;
                    }
                  }
                  target.value = newValue;
                  if (socketServer) {
                    socketServer.emit("updateModbusValue", {
                      ipAddress: device.ipAddress,
                      port: device.port,
                      address: target.position,
                      value: newValue,
                    });
                  }
                } else {
                  console.log(group.name, "unkown", value);
                }
                return value;
              });
            })
            .catch((err) => console.log(err));
        }, group.delay);
        intervals.push({
          ipAddress: device.ipAddress,
          port: device.port,
          interval,
        });
        return group;
        //   })
        // );
      }
    })
  );
};

/**
 * 받아온 주소에 value값을 넣어주는 함수
 * @param device IModbusDevice
 * @param address number
 * @param value number
 */
export const writeModbusData = (
  device: IModbusDevice,
  address: number,
  value: number
) => {
  const client = device.client;
  if (client) {
    client.writeSingleRegister(address, value);
  }
};

/**
 * 연결된 modbus 소켓을 제거하는 함수
 * @param devices IModbusDevice[]
 */
export const closeSocket = async (devices: IModbusDevice[]) => {
  console.log("socket close start");
  await Promise.all(
    devices.map((device) => {
      console.log("socket close", device.id);
      device.socket?.destroy();
    })
  );
  console.log("socket close end");
};

/**
 * 데이터를 갱신하는 intervals에 등록된 함수를 해제하는 함수
 */
export const clearAllInterval = async () => {
  await Promise.all(
    intervals.map((interval) => {
      clearInterval(interval.interval);
    })
  );
  intervals = [];
};
/**
 * 디바이스에서 데이터를 갱신하는 intervals에 등록된 함수를 해제하는 함수
 * @param device IModbusDevice
 */
export const clearDeviceInterval = async (device: IModbusDevice) => {
  const newInterval: IInterval[] = [];
  console.log("clearDeviceInterval start", intervals);
  await Promise.all(
    intervals.map((interval) => {
      if (
        interval.ipAddress === device.ipAddress &&
        interval.port === device.port
      ) {
        clearInterval(interval.interval);
      } else {
        newInterval.push(interval);
      }
    })
  );
  console.log("clearDeviceInterval end", newInterval);
  intervals = newInterval;
};
