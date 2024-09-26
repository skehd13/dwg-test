-- CreateTable
CREATE TABLE `modbusDevice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `deviceType` INTEGER NOT NULL,
    `ipAddress` VARCHAR(191) NOT NULL,
    `port` INTEGER NOT NULL,
    `comPort` VARCHAR(191) NOT NULL,
    `baudRate` INTEGER NOT NULL,
    `parity` INTEGER NOT NULL,
    `dataBit` INTEGER NOT NULL,
    `stopBit` INTEGER NOT NULL,
    `slaveId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modbusGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `start` INTEGER NOT NULL,
    `length` INTEGER NOT NULL,
    `delay` INTEGER NOT NULL,
    `type` INTEGER NOT NULL,
    `targetName` VARCHAR(191) NOT NULL,
    `device_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modbusTarget` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `position` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `group_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bacnetDevice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sender` VARCHAR(191) NOT NULL,
    `object_name` VARCHAR(191) NOT NULL,
    `vendor_name` VARCHAR(191) NOT NULL,
    `apdu_timeout` INTEGER NOT NULL,
    `max_apdu_length_accepted` INTEGER NOT NULL,
    `object_type` VARCHAR(191) NOT NULL,
    `deviceId` INTEGER NOT NULL,
    `object_identifier` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bacnetObject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `object_identifier` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `event_state` VARCHAR(191) NOT NULL,
    `object_name` VARCHAR(191) NOT NULL,
    `object_type` VARCHAR(191) NOT NULL,
    `out_of_service` VARCHAR(191) NOT NULL,
    `reliability` VARCHAR(191) NOT NULL,
    `units` VARCHAR(191) NOT NULL,
    `device_id` VARCHAR(191) NOT NULL,
    `enabled` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
