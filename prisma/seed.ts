import { PrismaClient } from '@prisma/client';
import { generateListings } from './seed-data';
import { uploadImageToS3FromUrl } from './seed-utils';

const prisma = new PrismaClient();

import { fetchNearbyAmenities } from '../src/lib/fetch-amenities';

// Function to fetch real amenities data
async function getAmenities(listingId: string, latitude: number, longitude: number) {
  try {
    const amenities = await fetchNearbyAmenities({
      latitude,
      longitude,
      config: {
        maxRetries: 3,
        initialRadius: 1000,
        maxRadius: 3000,
        radiusStep: 1000,
        batchDelay: 2000,
      }
    });

    // Add listingId to each amenity
    return amenities.map(amenity => ({
      ...amenity,
      listingId
    }));
  } catch (error) {
    console.error(`Error fetching amenities for listing ${listingId}:`, error);
    return []; // Return empty array if fetch fails
  }
}

async function main() {
  console.log('\n=== Starting Database Seed ===');
  
  // Create a dummy user first since listings reference users
  console.log('\n👤 Creating admin user...');
  const dummyUser = await prisma.user.upsert({
    where: { email: "admin@caimax.com" },
    update: {},
    create: {
      email: "admin@caimax.com",
      name: "Admin User",
      role: "ADMIN",
      onboarded: true,
    },
  });
  console.log('✓ Admin user created/updated');

  // Generate listings with our seed data
  console.log('\n📋 Generating listing data...');
  const listingsToCreate = generateListings(dummyUser.id);
  console.log(`✓ Generated ${listingsToCreate.length} listings in memory`);

  console.log('\n🏗️ Creating listings in database...');
  
  let totalImages = 0;
  listingsToCreate.forEach(listing => {
    totalImages += listing.images.length;
  });
  
  // Create listings and their related data
  let createdCount = 0;
  for (const listingData of listingsToCreate) {
    const { images, ...listingInfo } = listingData;

    // Upload images to S3 first
    console.log(`\n[${++createdCount}/${listingsToCreate.length}] Processing listing: ${listingData.name}`);
    console.log(`  📤 Uploading ${images.length} images to S3...`);
    
    const s3Images = await Promise.all(
      images.map(async (image) => ({
        ...image,
        url: await uploadImageToS3FromUrl(image.url)
      }))
    );
    
    // Create the listing with S3 URLs
    console.log(`  💾 Creating listing in database...`);
    const listing = await prisma.listing.create({
      data: {
        ...listingInfo,
        images: {
          create: s3Images
        }
      }
    });
    console.log(`✓ Created listing: ${listing.name}`);
    console.log(`  Location: ${listing.location}`);
    console.log(`  Type: ${listing.propertyType}`);
    console.log(`  Images: ${images.length}`);
    console.log(`  Price: ${listing.price} KES`);

    // Fetch and create real amenities for this listing
    console.log(`\n  🔍 Fetching amenities near ${listing.location}...`);
    const amenities = await getAmenities(listing.id, listing.latitude, listing.longitude);
    
    if (amenities.length > 0) {
      console.log(`  Found ${amenities.length} amenities nearby:`);
      const amenityTypes = [...new Set(amenities.map(a => a.type))];
      amenityTypes.forEach(type => {
        const count = amenities.filter(a => a.type === type).length;
        console.log(`    - ${count} ${type}(s)`);
      });

      // Create amenities in batches to avoid overwhelming the database
      console.log('  💾 Saving amenities to database...');
      await prisma.$transaction(
        amenities.map((amenity: any) =>
          prisma.amenities.create({
            data: amenity
          })
        )
      );
      console.log('  ✓ Amenities saved successfully');
    } else {
      console.log('  ⚠️ No amenities found in the vicinity');
    }

  }

  console.log('\n=== Seed Summary ===');
  console.log(`✅ Created ${listingsToCreate.length} listings`);
  console.log(`✅ Added ${totalImages} images`);
  console.log(`✅ Created amenities for all listings`);
  console.log('\n=== Seed Complete ===\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
