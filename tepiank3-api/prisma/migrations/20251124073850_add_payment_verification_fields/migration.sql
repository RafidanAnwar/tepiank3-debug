-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "bukti_bayar_file" TEXT,
ADD COLUMN     "payment_rejection_reason" TEXT,
ADD COLUMN     "payment_status" TEXT DEFAULT 'UNPAID';
