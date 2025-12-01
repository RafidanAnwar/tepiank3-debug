-- AlterTable
ALTER TABLE "worksheet_items" ADD COLUMN "quantity" INTEGER DEFAULT 1;
ALTER TABLE "worksheet_items" ADD COLUMN "is_ready" BOOLEAN;
ALTER TABLE "pengujian_items" ADD COLUMN "quantity" INTEGER DEFAULT 1;
ALTER TABLE "order_items" ADD COLUMN "quantity" INTEGER DEFAULT 1;
