-- CreateEnum
CREATE TYPE "PegawaiStatus" AS ENUM ('SIAP', 'SPT', 'STANDBY', 'CUTI');

-- CreateTable
CREATE TABLE "pegawai" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "status" "PegawaiStatus" NOT NULL DEFAULT 'SIAP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pegawai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pegawai_nama_key" ON "pegawai"("nama");

-- CreateIndex
CREATE INDEX "pegawai_status_idx" ON "pegawai"("status");

-- CreateIndex
CREATE INDEX "pegawai_nama_idx" ON "pegawai"("nama");
