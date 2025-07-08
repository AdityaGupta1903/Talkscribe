/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Recordings" DROP CONSTRAINT "Recordings_UserId_fkey";

-- AlterTable
ALTER TABLE "Recordings" ALTER COLUMN "UserId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "Id" DROP DEFAULT,
ALTER COLUMN "Id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("Id");
DROP SEQUENCE "User_Id_seq";

-- AddForeignKey
ALTER TABLE "Recordings" ADD CONSTRAINT "Recordings_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
