/*
  Warnings:

  - The `status` column on the `peralatan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name,clusterId]` on the table `jenis_pengujian` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderId,parameterId]` on the table `order_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,jenisPengujianId]` on the table `parameters` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subtotal` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PengujianStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PeralatanStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DAMAGED');

-- AlterTable
ALTER TABLE "clusters" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "jenis_pengujian" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "subtotal" DECIMAL(12,2) NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "address" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "contact_person" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "pengujian_id" INTEGER,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "parameters" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "peralatan" ADD COLUMN     "kode_bmn" TEXT,
ADD COLUMN     "koreksi" TEXT,
ADD COLUMN     "lokasi_penyimpanan" TEXT,
ADD COLUMN     "merk" TEXT,
ADD COLUMN     "nomor_alat" TEXT,
ADD COLUMN     "nomor_seri" TEXT,
ADD COLUMN     "nup" TEXT,
ADD COLUMN     "tanggal_kalibrasi" TIMESTAMP(3),
ADD COLUMN     "tipe" TEXT,
ADD COLUMN     "waktu_pengadaan" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "PeralatanStatus" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "pengujian" (
    "id" SERIAL NOT NULL,
    "nomor_pengujian" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "jenis_pengujian_id" INTEGER NOT NULL,
    "status" "PengujianStatus" NOT NULL DEFAULT 'PENDING',
    "total_amount" DECIMAL(12,2) NOT NULL,
    "tanggal_pengujian" TIMESTAMP(3),
    "lokasi" TEXT,
    "catatan" TEXT,
    "nama_perusahaan" TEXT,
    "jenis_kegiatan" TEXT,
    "alamat_perusahaan" TEXT,
    "jml_tenaga_kerja_pria" INTEGER,
    "jml_tenaga_kerja_wanita" INTEGER,
    "provinsi" TEXT,
    "kota" TEXT,
    "fasilitas_kesehatan" TEXT,
    "kecamatan" TEXT,
    "kelurahan" TEXT,
    "nama_penanggung_jawab" TEXT,
    "email_perusahaan" TEXT,
    "no_hp_penanggung_jawab" TEXT,
    "status_wlkp" TEXT,
    "email_penanggung_jawab" TEXT,
    "nomor_wlkp" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengujian_items" (
    "id" SERIAL NOT NULL,
    "pengujian_id" INTEGER NOT NULL,
    "parameter_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "hasil" TEXT,
    "keterangan" TEXT,

    CONSTRAINT "pengujian_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengujian_nomor_pengujian_key" ON "pengujian"("nomor_pengujian");

-- CreateIndex
CREATE INDEX "pengujian_user_id_idx" ON "pengujian"("user_id");

-- CreateIndex
CREATE INDEX "pengujian_status_idx" ON "pengujian"("status");

-- CreateIndex
CREATE INDEX "pengujian_jenis_pengujian_id_idx" ON "pengujian"("jenis_pengujian_id");

-- CreateIndex
CREATE INDEX "pengujian_created_at_idx" ON "pengujian"("created_at");

-- CreateIndex
CREATE INDEX "pengujian_items_pengujian_id_idx" ON "pengujian_items"("pengujian_id");

-- CreateIndex
CREATE INDEX "pengujian_items_parameter_id_idx" ON "pengujian_items"("parameter_id");

-- CreateIndex
CREATE UNIQUE INDEX "pengujian_items_pengujian_id_parameter_id_key" ON "pengujian_items"("pengujian_id", "parameter_id");

-- CreateIndex
CREATE INDEX "clusters_name_idx" ON "clusters"("name");

-- CreateIndex
CREATE INDEX "clusters_isActive_idx" ON "clusters"("isActive");

-- CreateIndex
CREATE INDEX "jenis_pengujian_clusterId_idx" ON "jenis_pengujian"("clusterId");

-- CreateIndex
CREATE INDEX "jenis_pengujian_name_idx" ON "jenis_pengujian"("name");

-- CreateIndex
CREATE INDEX "jenis_pengujian_isActive_idx" ON "jenis_pengujian"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "jenis_pengujian_name_clusterId_key" ON "jenis_pengujian"("name", "clusterId");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_parameterId_idx" ON "order_items"("parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_orderId_parameterId_key" ON "order_items"("orderId", "parameterId");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_pengujian_id_idx" ON "orders"("pengujian_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "parameters_jenisPengujianId_idx" ON "parameters"("jenisPengujianId");

-- CreateIndex
CREATE INDEX "parameters_name_idx" ON "parameters"("name");

-- CreateIndex
CREATE INDEX "parameters_isActive_idx" ON "parameters"("isActive");

-- CreateIndex
CREATE INDEX "parameters_harga_idx" ON "parameters"("harga");

-- CreateIndex
CREATE UNIQUE INDEX "parameters_name_jenisPengujianId_key" ON "parameters"("name", "jenisPengujianId");

-- CreateIndex
CREATE INDEX "peralatan_status_idx" ON "peralatan"("status");

-- CreateIndex
CREATE INDEX "peralatan_name_idx" ON "peralatan"("name");

-- CreateIndex
CREATE INDEX "peralatan_merk_idx" ON "peralatan"("merk");

-- CreateIndex
CREATE INDEX "peralatan_nomor_seri_idx" ON "peralatan"("nomor_seri");

-- CreateIndex
CREATE INDEX "peralatan_nomor_alat_idx" ON "peralatan"("nomor_alat");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- AddForeignKey
ALTER TABLE "pengujian" ADD CONSTRAINT "pengujian_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengujian" ADD CONSTRAINT "pengujian_jenis_pengujian_id_fkey" FOREIGN KEY ("jenis_pengujian_id") REFERENCES "jenis_pengujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengujian_items" ADD CONSTRAINT "pengujian_items_pengujian_id_fkey" FOREIGN KEY ("pengujian_id") REFERENCES "pengujian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengujian_items" ADD CONSTRAINT "pengujian_items_parameter_id_fkey" FOREIGN KEY ("parameter_id") REFERENCES "parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_pengujian_id_fkey" FOREIGN KEY ("pengujian_id") REFERENCES "pengujian"("id") ON DELETE SET NULL ON UPDATE CASCADE;
