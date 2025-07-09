/*
  Warnings:

  - You are about to drop the column `Recording` on the `Recordings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recordings" DROP COLUMN "Recording",
ALTER COLUMN "Processed" SET DEFAULT false;
