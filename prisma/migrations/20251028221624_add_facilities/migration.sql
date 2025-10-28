-- CreateEnum
CREATE TYPE "Facility" AS ENUM ('LAUNDRY', 'SWIMMING_POOL', 'WIFI', 'PET_FRIENDLY', 'PARKING', 'GYM');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "facilities" "Facility"[];
