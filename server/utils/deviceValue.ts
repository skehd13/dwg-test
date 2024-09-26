/**
 * modbusEditWindow에서 입력한 데이터를 IModbusDeviceGroup[]으로 바꿔주는 함수
 * @param options generateDeviceOption | generateDeviceOption[]
 * @returns IModbusDeviceGroup[]
 */
export const generateDevice: (
  options: generateDeviceOption | generateDeviceOption[]
) => IModbusDevice[] = (options) => {
  if (Array.isArray(options)) {
    return options.map((option) => {
      const device_id = option.id > 0 ? option.id : 0;
      const deviceName =
        option.name && option.name !== ""
          ? option.name
          : `device_${device_id !== 0 ? device_id : "${device_id}"}`;
      const device: IModbusDevice = {
        id: device_id,
        name: deviceName,
        ipAddress: option.ipAddress,
        port: option.port,
        deviceType: option.deviceType,
        comPort: option.comPort,
        baudRate: option.baudRate,
        parity: option.parity,
        dataBit: option.dataBit,
        stopBit: option.stopBit,
        slaveId: option.slaveId,
        groups: option.groups.map((group) => {
          const group_id = group.id > 0 ? group.id : 0;
          const groupName =
            group.name && group.name !== ""
              ? group.name
              : `${deviceName}_group_${
                  group_id !== 0 ? group_id : "${group_id}"
                }`;
          const newGroup: IModbusGroup = {
            ...group,
            id: group_id,
            name: groupName,
            targets: Array.from({ length: group.length }).map(
              (d, targetIndex) => {
                const position = group.start + targetIndex;
                const targetName =
                  group.targetName && group.targetName !== ""
                    ? group.targetName
                    : `${groupName}_target_${position}`;
                return {
                  id: targetIndex,
                  position: position,
                  name: targetName,
                };
              }
            ),
          };
          return newGroup;
        }),
      };
      return device;
    });
  } else {
    const device_id = options.id > 0 ? options.id : 0;
    const deviceName =
      options.name && options.name !== ""
        ? options.name
        : `device_${device_id !== 0 ? device_id : "${device_id}"}`;
    const device: IModbusDevice = {
      id: device_id,
      name: deviceName,
      ipAddress: options.ipAddress,
      port: options.port,
      deviceType: options.deviceType,
      comPort: options.comPort,
      baudRate: options.baudRate,
      parity: options.parity,
      dataBit: options.dataBit,
      stopBit: options.stopBit,
      slaveId: options.slaveId,
      groups: options.groups.map((group) => {
        const group_id = group.id > 0 ? group.id : 0;
        const groupName =
          group.name && group.name !== ""
            ? group.name
            : `${deviceName}_group_${
                group_id !== 0 ? group_id : "${group_id}"
              }`;
        const newGroup: IModbusGroup = {
          ...group,
          id: group_id,
          name: groupName,
          targets: Array.from({ length: group.length }).map(
            (d, targetIndex) => {
              const position = group.start + targetIndex;
              const targetName =
                group.targetName && group.targetName !== ""
                  ? group.targetName
                  : `${groupName}_target_${position}`;
              return {
                id: targetIndex,
                position: position,
                name: targetName,
              };
            }
          ),
        };
        return newGroup;
      }),
    };
    return [device];
  }
};
