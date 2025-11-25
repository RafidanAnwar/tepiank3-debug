-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "persetujuan_rejection_reason" TEXT,
ADD COLUMN     "persetujuan_status" TEXT DEFAULT 'PENDING';
