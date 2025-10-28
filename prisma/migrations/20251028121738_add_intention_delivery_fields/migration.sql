-- AlterTable
ALTER TABLE "Intention" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "deliveryEvents" JSONB,
ADD COLUMN     "deliveryStatus" TEXT,
ADD COLUMN     "resendMessageId" TEXT;
