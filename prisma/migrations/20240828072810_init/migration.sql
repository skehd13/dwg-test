-- AddForeignKey
ALTER TABLE `modbusGroup` ADD CONSTRAINT `modbusGroup_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `modbusDevice`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modbusTarget` ADD CONSTRAINT `modbusTarget_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `modbusGroup`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
