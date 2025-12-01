-- AlterTable
ALTER TABLE "pengujian" ADD COLUMN "order_id" INTEGER;
ALTER TABLE "pengujian" ADD CONSTRAINT "pengujian_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
