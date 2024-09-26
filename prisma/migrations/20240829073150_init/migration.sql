-- AlterTable
ALTER TABLE `modbusDevice` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `ipAddress` VARCHAR(191) NULL,
    MODIFY `port` INTEGER NULL,
    MODIFY `comPort` VARCHAR(191) NULL,
    MODIFY `baudRate` INTEGER NULL,
    MODIFY `parity` VARCHAR(191) NULL,
    MODIFY `dataBit` INTEGER NULL,
    MODIFY `stopBit` INTEGER NULL,
    MODIFY `slaveId` INTEGER NULL;
