// One-time script to normalize amenity distances in the database.
// Run with: node scripts/normalize-amenity-distances.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async function() {
  try {
    console.log('Finding amenities with distance > 1000 (likely stored in meters)');
    const bad = await prisma.amenities.findMany({ where: { distance: { gt: 1000 } }, take: 10000 });
    console.log(`Found ${bad.length} amenities to normalize`);
    for (const a of bad) {
      const old = a.distance;
      const normalized = old / 1000;
      await prisma.amenities.update({ where: { id: a.id }, data: { distance: normalized } });
      console.log(`Normalized ${a.id}: ${old} -> ${normalized}`);
    }
    console.log('Done');
  } catch (err) {
    console.error('Error normalizing distances:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();