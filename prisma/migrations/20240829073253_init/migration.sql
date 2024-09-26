/*
  Warnings:

  - Made the column `name` on table `modbusDevice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `modbusDevice` MODIFY `name` VARCHAR(191) NOT NULL;
