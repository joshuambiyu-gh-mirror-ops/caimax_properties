-- CreateTable
CREATE TABLE "Intention" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Intention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Intention_listingId_idx" ON "Intention"("listingId");

-- AddForeignKey
ALTER TABLE "Intention" ADD CONSTRAINT "Intention_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
