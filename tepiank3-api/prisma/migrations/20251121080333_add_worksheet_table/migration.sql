-- CreateEnum
CREATE TYPE "WorksheetStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "worksheets" (
    "id" SERIAL NOT NULL,
    "nomor_worksheet" TEXT NOT NULL,
    "pengujian_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "WorksheetStatus" NOT NULL DEFAULT 'DRAFT',
    "tanggal_mulai" TIMESTAMP(3),
    "tanggal_selesai" TIMESTAMP(3),
    "pegawai_utama" INTEGER,
    "pegawai_pendamping" INTEGER,
    "hasil" TEXT,
    "catatan" TEXT,
    "peralatan_digunakan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worksheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worksheet_items" (
    "id" SERIAL NOT NULL,
    "worksheet_id" INTEGER NOT NULL,
    "parameter_id" INTEGER NOT NULL,
    "nilai" DECIMAL(10,3),
    "satuan" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worksheet_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "worksheets_nomor_worksheet_key" ON "worksheets"("nomor_worksheet");

-- CreateIndex
CREATE INDEX "worksheets_pengujian_id_idx" ON "worksheets"("pengujian_id");

-- CreateIndex
CREATE INDEX "worksheets_user_id_idx" ON "worksheets"("user_id");

-- CreateIndex
CREATE INDEX "worksheets_status_idx" ON "worksheets"("status");

-- CreateIndex
CREATE INDEX "worksheets_created_at_idx" ON "worksheets"("created_at");

-- CreateIndex
CREATE INDEX "worksheet_items_worksheet_id_idx" ON "worksheet_items"("worksheet_id");

-- CreateIndex
CREATE INDEX "worksheet_items_parameter_id_idx" ON "worksheet_items"("parameter_id");

-- CreateIndex
CREATE UNIQUE INDEX "worksheet_items_worksheet_id_parameter_id_key" ON "worksheet_items"("worksheet_id", "parameter_id");

-- AddForeignKey
ALTER TABLE "worksheets" ADD CONSTRAINT "worksheets_pengujian_id_fkey" FOREIGN KEY ("pengujian_id") REFERENCES "pengujian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worksheets" ADD CONSTRAINT "worksheets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worksheet_items" ADD CONSTRAINT "worksheet_items_worksheet_id_fkey" FOREIGN KEY ("worksheet_id") REFERENCES "worksheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worksheet_items" ADD CONSTRAINT "worksheet_items_parameter_id_fkey" FOREIGN KEY ("parameter_id") REFERENCES "parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
