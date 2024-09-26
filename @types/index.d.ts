import { SerialPort as mSerialPort } from "serialport";

export {};

declare global {
  type SerialPort = mSerialPort;
  type SerialSocket = mSerialPort;
  type MODBUS_CHANNELS =
    | "readData"
    | "getModbusDevice"
    | "modbusDevice"
    | "updateModbusValue"
    | "writeModbusData"
    | "addModbusDevice"
    | "modbusSetting"
    | "deleteModbus"
    | "updateModbusDevice"
    | "updateModbusTarget"
    | "getSerialPort"
    | "serialPort";
  type BACNET_CHANNEL =
    | "getBacnetDevices"
    | "getUpdateBacnet"
    | "updateBacnet"
    | "bacnetDevices"
    | "bacnetSacn";
  type Channels =
    | MODBUS_CHANNELS
    | BACNET_CHANNEL
    | "ipc-example"
    | "show-context-menu"
    | "openBrowser";

  type CRUD = "GET" | "POST" | "PUT" | "DELETE";
  type API_ROUTE = {
    method: CRUD;
    path: string;
    handler: import("express").RequestHandler;
    middleware?:
      | import("express").RequestHandler
      | import("express").RequestHandler[];
  };

  interface IReadOption {
    port: string;
    readLen: number;
    start: number;
    id: number;
    functionCode: number;
    isRun: boolean;
  }

  // interface IDevice {
  //   id: string;
  //   deviceOption: import("modbus-serial/ModbusRTU.d.ts").SerialPortOptions;
  //   fileName: string;
  //   options: IReadOption[];
  //   enableIds?: number[];
  // }

  // interface IClient {
  //   id: string;
  //   fileName: string;
  //   client: import("modbus-serial").default;
  //   logger: import("winston").Logger;
  // }

  type TGroupType = 0 | 1 | 2 | 3;
  type TParity = "space" | "none" | "even" | "odd" | "mark" | undefined;
  type TDataBit = 5 | 6 | 7 | 8 | undefined;
  type TStopBit = 1 | 2 | undefined;
  type generateDeviceOption = {
    id: number;
    deviceType: number;
    ipAddress: string;
    port: number;
    comPort: string;
    baudRate: number;
    parity: TParity;
    dataBit: TDataBit;
    stopBit: TStopBit;
    slaveId: number;
    name?: string;
    groups: IModbusGroup[];
  };
  interface IModbusDevice {
    id: number;
    name: string;
    deviceType: number;
    ipAddress: string;
    port: number;
    comPort: string;
    baudRate: number;
    parity: TParity;
    dataBit: TDataBit;
    stopBit: TStopBit;
    slaveId: number;
    socket?: import("net").Socket | SerialPort;
    client?:
      | import("jsmodbus").ModbusTCPClient
      | import("jsmodbus").ModbusRTUClient;
    groups?: IModbusGroup[];
  }

  interface IModbusGroup {
    id: number;
    name: string;
    start: number;
    length: number;
    delay: number;
    type: number;
    targetName: string;
    targets: IModbusTarget[];
    device_id?: number;
  }
  interface IModbusTarget {
    id: number;
    name: string;
    position: number;
    parsing?: string;
    value?: any;
    group_id?: number;
  }

  interface IBacnetDevice {
    id: string;
    name: string;
    sender: IBacnetSender;
    deviceId: number;
    object_identifier: IBacnetIdentifier;
    object_name: string;
    vendor_name: string;
    apdu_timeout: number;
    max_apdu_length_accepted: number;
    object_type: string;
    object_list: IBacnetObject[];
    group_id: number;
  }

  interface IBacnetObject {
    id: string;
    object_identifier: IBacnetIdentifier | string;
    description: string;
    event_state: string;
    object_name: string;
    object_type: string;
    out_of_service: boolean;
    present_value: any;
    reliability: string;
    status_flags: any[];
    units: string;
    enabled: boolean;
  }

  interface IBacnetSender {
    address: string;
    forwardedFrom: any;
  }
  interface IBacnetIdentifier {
    type: number;
    instance: number;
  }
}
