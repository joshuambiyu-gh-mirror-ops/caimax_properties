// Test script for amenity fetching functionality
const { PrismaClient } = require('@prisma/client');
const { fetchNearbyAmenities } = require('../src/lib/fetch-amenities');

const prisma = new PrismaClient();

// Configuration for the test
const TEST_LOCATIONS = [
  {
    name: "Nairobi CBD",
    latitude: -1.2921,
    longitude: 36.8219
  },
  {
    name: "Eastleigh",
    latitude: -1.2713984,
    longitude: 36.8574464
  }
];

async function testAmenityFetch(location) {
  console.log(`\n${'-'.repeat(60)}`);
  console.log(`Testing amenity fetch for ${location.name}`);
  console.log(`Coordinates: ${location.latitude}, ${location.longitude}`);
  console.log(`${'-'.repeat(60)}\n`);

  const startTime = Date.now();
  let results;

  try {
    results = await fetchNearbyAmenities({
      latitude: location.latitude,
      longitude: location.longitude,
      prisma,
      // Test parameters - adjust these to find optimal values
      maxRetries: 3,
      initialRadius: 1000,
      maxRadius: 3000,
      radiusStep: 1000,
      batchDelay: 2000, // 2 second delay between batches
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    // Group and analyze results
    const groupedResults = results.reduce((acc, amenity) => {
      if (!acc[amenity.type]) {
        acc[amenity.type] = [];
      }
      acc[amenity.type].push(amenity);
      return acc;
    }, {});

    // Print summary
    console.log('\nResults Summary:');
    console.log(`Total time: ${duration.toFixed(2)} seconds`);
    console.log(`Total amenities found: ${results.length}`);
    console.log('\nBreakdown by type:');
    
    Object.entries(groupedResults).forEach(([type, amenities]) => {
      console.log(`\n${type} (${amenities.length} found):`);
      
      // Sort by distance before displaying
      amenities.sort((a, b) => a.distance - b.distance);
      
      // Show closest 3 with distances
      amenities.slice(0, 3).forEach(amenity => {
        console.log(`  - ${amenity.name || 'Unnamed'}`);
        console.log(`    Distance: ${amenity.distance.toFixed(2)}m`);
        console.log(`    Coords: ${amenity.latitude}, ${amenity.longitude}`);
      });

      if (amenities.length > 3) {
        console.log(`  ... and ${amenities.length - 3} more`);
      }
    });

  } catch (error) {
    console.error('\nError during fetch:', error);
    console.error('Stack trace:', error.stack);
  }

  return results;
}

async function runTests() {
  try {
    // Test each location sequentially to avoid overwhelming the API
    for (const location of TEST_LOCATIONS) {
      await testAmenityFetch(location);
      // Add delay between locations
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
runTests()
  .catch(console.error);