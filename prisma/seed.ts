import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a dummy user first since listings reference users
  const dummyUser = await prisma.user.upsert({
    where: { email: "dummy@example.com" },
    update: {},
    create: {
      email: "dummy@example.com",
      name: "Dummy User",
      onboarded: false,
    },
  });

  // Sample listings data
  const listings = [
    {
      name: "Modern Downtown Apartment",
      footage: 850,
      bathroomCount: 1,
      bedroomCount: 2,
      location: "Downtown Nairobi",
      latitude: -1.2864,
      longitude: 36.8172,
      description: "A stylish apartment in the heart of Nairobi with great city views.",
      userId: dummyUser.id,
      images: [
        { url: "v1234567890/sample1.jpg", order: 1 },
        { url: "v1234567890/sample2.jpg", order: 2 }
      ]
    },
    {
      name: "Spacious Family Home",
      footage: 2200,
      bathroomCount: 3,
      bedroomCount: 4,
      location: "Karen, Nairobi",
      latitude: -1.3207,
      longitude: 36.7073,
      description: "Perfect family home with a large garden and modern amenities.",
      userId: dummyUser.id,
      images: [
        { url: "v1234567890/sample3.jpg", order: 1 },
        { url: "v1234567890/sample4.jpg", order: 2 }
      ]
    },
    {
      name: "Cozy Studio Apartment",
      footage: 450,
      bathroomCount: 1,
      bedroomCount: 1,
      location: "Westlands, Nairobi",
      latitude: -1.2630,
      longitude: 36.8065,
      description: "Compact and efficient studio perfect for young professionals.",
      userId: dummyUser.id,
      images: [
        { url: "v1234567890/sample5.jpg", order: 1 }
      ]
    },
    {
      name: "Luxury Villa",
      footage: 3500,
      bathroomCount: 4,
      bedroomCount: 5,
      location: "Kilimani, Nairobi",
      latitude: -1.2921,
      longitude: 36.8219,
      description: "Exclusive villa with swimming pool and premium finishes.",
      userId: dummyUser.id,
      images: [
        { url: "v1234567890/sample6.jpg", order: 1 },
        { url: "v1234567890/sample7.jpg", order: 2 },
        { url: "v1234567890/sample8.jpg", order: 3 }
      ]
    }
  ];

  for (const listingData of listings) {
    const { images, ...listingInfo } = listingData;

    await prisma.listing.create({
      data: {
        ...listingInfo,
        images: {
          create: images
        }
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
