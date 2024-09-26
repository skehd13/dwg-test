import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const apiRouter: API_ROUTE[] = [];
const prisma = new PrismaClient();

const searchModbusDevice = async (device: IModbusDevice) => {
  return await new Promise<IModbusDevice | null>(async (res) => {
    if (device.deviceType === 1) {
      await prisma.modbusDevice
        .findMany({
          where: {
            ipAddress: device.ipAddress,
            port: device.port,
            deviceType: device.deviceType,
          },
        })
        .then((d) => {
          const data = d as IModbusDevice[];
          if (data && data.length > 0) {
            res(data[0]);
          } else {
            res(null);
          }
        });
    } else if (device.deviceType === 2) {
      await prisma.modbusDevice
        .findMany({
          where: {
            comPort: device.comPort,
            baudRate: device.baudRate,
            parity: device.parity,
            dataBit: device.dataBit,
            stopBit: device.stopBit,
            slaveId: device.slaveId,
            deviceType: device.deviceType,
          },
        })
        .then((d) => {
          const data = d as IModbusDevice[];
          if (data && data.length > 0) {
            res(data[0]);
          } else {
            res(null);
          }
        });
    }
  });
};
export const addModbusDevice = async (devices: IModbusDevice[]) => {
  await Promise.all(
    devices.map(async (device) => {
      const search = await searchModbusDevice(device);
      if (search) {
        return await new Promise((res) => {
          if (device.groups) {
            addModbusGroup(device.groups, search.id).then(() => {
              res(true);
            });
          } else {
            res(true);
          }
        });
      }
      return await new Promise(async (resolve, reject) => {
        await prisma.modbusDevice
          .create({
            data: {
              name: device.name,
              deviceType: device.deviceType,
              ipAddress: device.ipAddress,
              port: device.port,
              comPort: device.comPort,
              baudRate: device.baudRate,
              parity: device.parity as string,
              dataBit: device.dataBit as number,
              stopBit: device.stopBit as number,
              slaveId: device.slaveId,
            },
          })
          .then(async (data) => {
            const deviceName = data.name.replace(
              "${device_id}",
              data.id.toString()
            );
            await prisma.modbusDevice.update({
              where: {
                id: data.id,
              },
              data: {
                name: deviceName,
              },
            });
            await addModbusGroup(device.groups, data.id);
            resolve(true);
          });
      });
    })
  );
};
const addModbusGroup = async (
  groups: IModbusGroup[] | undefined,
  device_id: number
) => {
  if (!groups) {
    return;
  }
  await Promise.all(
    groups.map(async (group) => {
      return await new Promise(async (resolve, reject) => {
        await prisma.modbusGroup
          .create({
            data: {
              name: group.name,
              start: group.start,
              length: group.length,
              delay: group.delay,
              type: group.type,
              targetName: group.targetName,
              device_id: device_id,
            },
          })
          .then(async (data) => {
            const groupName = data.name
              .replace("${device_id}", device_id.toString())
              .replace("${group_id}", data.id.toString());
            await prisma.modbusGroup.update({
              where: {
                id: data.id,
              },
              data: {
                name: groupName,
              },
            });
            if (group.targets) {
              await addModbusTarget(group.targets, data.id, device_id);
            }
            resolve(true);
          });
      });
    })
  );
};
const addModbusTarget = async (
  targets: IModbusTarget[],
  group_id: number,
  device_id: number,
  sameStart?: number,
  sameEnd?: number
) => {
  await Promise.all(
    targets.map(async (target) => {
      if (sameStart !== undefined && sameEnd !== undefined) {
        if (target.position >= sameStart && target.position <= sameEnd) {
          return;
        }
      }
      const targetName = target.name
        .replace("${device_id}", device_id.toString())
        .replace("${group_id}", group_id.toString());
      return await new Promise(async (resolve, reject) => {
        await prisma.modbusTarget.create({
          data: {
            name: targetName,
            position: target.position,
            group_id: group_id,
          },
        });
        resolve(true);
      });
    })
  );
};
const deleteModbusDevice = async (device: IModbusDevice) => {
  const group_ids: number[] = await prisma.modbusGroup
    .findMany({
      where: {
        device_id: device.id,
      },
    })
    .then((data) => {
      const ids = data.map((row) => row.id);
      return ids;
    });
  await prisma.modbusTarget.deleteMany({
    where: {
      group_id: {
        in: group_ids,
      },
    },
  });
  await prisma.modbusGroup.deleteMany({
    where: {
      device_id: device.id,
    },
  });
  await prisma.modbusDevice.delete({
    where: {
      id: device.id,
    },
  });
};
const deleteModbusGroup = async (group_ids: number[]) => {
  await prisma.modbusTarget.deleteMany({
    where: {
      group_id: {
        in: group_ids,
      },
    },
  });
  await prisma.modbusGroup.deleteMany({
    where: {
      id: {
        in: group_ids,
      },
    },
  });
};
const updateModbusDevice = async (device: IModbusDevice) => {
  console.log("updateModbusDevice", device);
  await prisma.modbusDevice.update({
    where: {
      id: device.id,
    },
    data: {
      name: device.name,
      ipAddress: device.ipAddress,
      port: device.port,
      deviceType: device.deviceType,
      comPort: device.comPort,
      baudRate: device.baudRate,
      parity: device.parity,
      dataBit: device.dataBit,
      stopBit: device.stopBit,
      slaveId: device.slaveId,
    },
  });
  if (device.groups) {
    const group_ids = device.groups.map((group) => group.id);
    console.log(group_ids.join(","));
    await prisma.modbusGroup
      .findMany({
        where: {
          device_id: device.id,
          id: {
            notIn: group_ids,
          },
        },
      })
      .then((data) => {
        const delete_ids = data.map((row) => row.id);
        return delete_ids;
      })
      .then(async (delete_ids) => {
        if (delete_ids.length > 0) {
          await deleteModbusGroup(delete_ids);
        }
      });
    await Promise.all(
      device.groups.map(async (group) => {
        if (group.id) {
          await updateModbusGroup(group, device.id);
        } else {
          await addModbusGroup([group], device.id);
        }
      })
    );
  }
};
const updateModbusGroup = async (group: IModbusGroup, device_id: number) => {
  const old_device: IModbusGroup | null = await prisma.modbusGroup.findFirst({
    where: {
      id: group.id,
    },
    include: {
      targets: true,
    },
  });
  let sameStart = -1;
  let sameEnd = -1;
  const old_start = old_device ? old_device.start : -1;
  const old_end = old_device ? old_device.start + old_device.length - 1 : -1;
  const new_start = group.start;
  const new_end = group.start + group.length - 1;
  if (new_start > old_start) {
    sameStart = new_start;
  } else {
    sameStart = old_start;
  }
  if (new_end < old_end) {
    sameEnd = new_end;
  } else {
    sameEnd = old_end;
  }
  await prisma.modbusTarget.deleteMany({
    where: {
      group_id: group.id,
      position: {
        lt: sameStart,
      },
    },
  });
  await prisma.modbusTarget.deleteMany({
    where: {
      group_id: group.id,
      position: {
        gt: sameEnd,
      },
    },
  });
  await prisma.modbusGroup.update({
    where: {
      id: group.id,
    },
    data: {
      name: group.name,
      start: group.start,
      length: group.length,
      delay: group.delay,
      type: group.type,
    },
  });
  if (group.targets) {
    await addModbusTarget(
      group.targets,
      group.id,
      device_id,
      sameStart,
      sameEnd
    );
  }
};
const updateModbusTarget = async (target: IModbusTarget) => {
  await prisma.modbusTarget.update({
    where: {
      id: target.id,
    },
    data: {
      name: target.name,
    },
  });
};
export const getModbusDevice = async () => {
  const devices: IModbusDevice[] = (await prisma.modbusDevice.findMany({
    include: {
      groups: {
        orderBy: {
          name: "asc",
        },
        include: {
          targets: {
            orderBy: {
              name: "asc",
            },
          },
        },
      },
    },
  })) as IModbusDevice[];
  return devices;
};

const routeGetModbus = async (req: Request, res: Response) => {
  const data = await getModbusDevice();
  return res.send({ data });
};

apiRouter.push({ method: "GET", path: "/modbus", handler: routeGetModbus });

export default apiRouter;
