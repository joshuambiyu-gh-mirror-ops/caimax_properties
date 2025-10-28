/*
  Warnings:

  - The `propertyType` column on the `Listing` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'VILLA', 'TOWNHOUSE', 'CONDO');

-- Create a temporary column for the new enum
ALTER TABLE "Listing" ADD COLUMN "propertyType_new" "PropertyType";

-- Convert existing data
UPDATE "Listing" 
SET "propertyType_new" = CASE 
    WHEN "propertyType" ILIKE 'house' THEN 'HOUSE'::"PropertyType"
    WHEN "propertyType" ILIKE 'apartment' THEN 'APARTMENT'::"PropertyType"
    WHEN "propertyType" ILIKE 'villa' THEN 'VILLA'::"PropertyType"
    WHEN "propertyType" ILIKE 'townhouse' THEN 'TOWNHOUSE'::"PropertyType"
    WHEN "propertyType" ILIKE 'condo' THEN 'CONDO'::"PropertyType"
    ELSE 'HOUSE'::"PropertyType"
END;

-- Drop the old column and rename the new one
ALTER TABLE "Listing" DROP COLUMN "propertyType";
ALTER TABLE "Listing" RENAME COLUMN "propertyType_new" TO "propertyType";

-- Set the not null constraint and default value
ALTER TABLE "Listing" ALTER COLUMN "propertyType" SET NOT NULL;
ALTER TABLE "Listing" ALTER COLUMN "propertyType" SET DEFAULT 'HOUSE'::"PropertyType";

-- Add the price column
ALTER TABLE "Listing" ADD COLUMN "price" DOUBLE PRECISION;
