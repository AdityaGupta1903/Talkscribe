-- CreateTable
CREATE TABLE "User" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "Email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Recordings" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "Recording" TEXT NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "Processed" BOOLEAN NOT NULL,
    "PublicUrl" TEXT,

    CONSTRAINT "Recordings_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- AddForeignKey
ALTER TABLE "Recordings" ADD CONSTRAINT "Recordings_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
