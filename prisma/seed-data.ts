import { Facility, PropertyType } from '@prisma/client';

// Real locations in major Kenyan cities
const locations = [
  // Nairobi Locations
  {
    name: "Kilimani",
    latitude: -1.2921,
    longitude: 36.7895,
    area: "Kilimani, Nairobi"
  },
  {
    name: "Westlands",
    latitude: -1.2673,
    longitude: 36.8062,
    area: "Westlands, Nairobi"
  },
  {
    name: "Lavington",
    latitude: -1.2785,
    longitude: 36.7723,
    area: "Lavington, Nairobi"
  },
  {
    name: "Karen",
    latitude: -1.3189,
    longitude: 36.7062,
    area: "Karen, Nairobi"
  },
  {
    name: "Kileleshwa",
    latitude: -1.2841,
    longitude: 36.7776,
    area: "Kileleshwa, Nairobi"
  },

  // Mombasa Locations
  {
    name: "Nyali",
    latitude: -4.0198,
    longitude: 39.7020,
    area: "Nyali, Mombasa"
  },
  {
    name: "Bamburi",
    latitude: -3.9935,
    longitude: 39.7147,
    area: "Bamburi, Mombasa"
  },
  {
    name: "Tudor",
    latitude: -4.0398,
    longitude: 39.6674,
    area: "Tudor, Mombasa"
  },
  {
    name: "Shanzu",
    latitude: -3.9741,
    longitude: 39.7426,
    area: "Shanzu, Mombasa"
  },

  // Nakuru Locations
  {
    name: "Section 58",
    latitude: -0.2827,
    longitude: 36.0789,
    area: "Section 58, Nakuru"
  },
  {
    name: "Milimani",
    latitude: -0.2897,
    longitude: 36.0655,
    area: "Milimani, Nakuru"
  },
  {
    name: "London",
    latitude: -0.2776,
    longitude: 36.0726,
    area: "London, Nakuru"
  }
];

// High-quality real estate images from Unsplash
const unsplashImages = [
  // Modern Apartments
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000",
  
  // Houses
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1000",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1000",
  
  // Luxury Homes
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000",
  
  // Interior Shots
  "https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1000",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1000",
  
  // Apartments with Views
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000",
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1000",
  "https://images.unsplash.com/photo-1459535653751-d571815e906b?w=1000",
  
  // Modern Houses
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1000",
  
  // Villa Style
  "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1000",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1000",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1000"
];

const facilities: Facility[] = [
  'LAUNDRY',
  'SWIMMING_POOL',
  'WIFI',
  'PET_FRIENDLY',
  'PARKING',
  'GYM'
];

// Features that can be added to property descriptions
const features = [
  "Security System",
  "Solar Water Heating",
  "Backup Generator",
  "Borehole Water",
  "Perimeter Wall",
  "Electric Fence",
  "24/7 Security",
  "CCTV",
  "High-Speed Internet",
  "Spacious Parking",
  "Modern Finishes",
  "Built-in Wardrobes",
  "Master Ensuite",
  "Balcony/Terrace",
  "Garden"
];

// Property types with their price ranges (in KES)
const propertyTypes: Array<{
  type: PropertyType;
  priceRange: { min: number; max: number };
  footageRange: { min: number; max: number };
  description: string[];
}> = [
  {
    type: 'APARTMENT',
    priceRange: { min: 25000, max: 80000 },
    footageRange: { min: 400, max: 1200 },
    description: [
      "Modern apartment with excellent amenities",
      "Well-maintained apartment complex with secure parking",
      "Spacious apartment with great natural lighting",
      "Contemporary apartment with urban convenience"
    ]
  },
  {
    type: 'HOUSE',
    priceRange: { min: 45000, max: 150000 },
    footageRange: { min: 1000, max: 3000 },
    description: [
      "Beautiful family home in a quiet neighborhood",
      "Spacious house with modern finishes",
      "Well-maintained home with lovely garden",
      "Charming house with great curb appeal"
    ]
  },
  {
    type: 'VILLA',
    priceRange: { min: 150000, max: 500000 },
    footageRange: { min: 3000, max: 6000 },
    description: [
      "Luxury villa with premium finishes",
      "Exclusive villa in prestigious location",
      "High-end villa with resort-style amenities",
      "Executive villa with panoramic views"
    ]
  },
  {
    type: 'TOWNHOUSE',
    priceRange: { min: 35000, max: 120000 },
    footageRange: { min: 800, max: 2000 },
    description: [
      "Modern townhouse with excellent location",
      "Contemporary townhouse with private garden",
      "Well-designed townhouse in secure community",
      "Stylish townhouse with modern amenities"
    ]
  }
];

// Helper to get random items from an array
const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper to get a random number between min and max
const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to get locations for a specific city
const getLocationsForCity = (cityName: string) => {
  return locations.filter(loc => loc.area.includes(cityName));
};

// Type definition for our generated listing
interface GeneratedListing {
  name: string;
  footage: number;
  bathroomCount: number;
  bedroomCount: number;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  propertyType: PropertyType;
  price: number;
  facilities: Facility[];
  userId: string;
  images: Array<{ url: string; order: number }>;
}

// Generate listings data
export const generateListings = (userId: string): GeneratedListing[] => {
  const listings: GeneratedListing[] = [];
  const cities = ['Nairobi', 'Mombasa', 'Nakuru'];
  
  console.log('\n=== Starting Listing Generation ===');
  
  // Generate listings for each city
  cities.forEach(city => {
    console.log(`\n🏘️ Generating listings for ${city}`);
    const cityLocations = getLocationsForCity(city);
    const listingsPerCity = city === 'Nairobi' ? 12 : 8; // More listings for Nairobi
    console.log(`- Planning to create ${listingsPerCity} listings`);

    for (let i = 0; i < listingsPerCity; i++) {
      // Get random property type and its configurations
      const propertyConfig = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      
      // Get random location from this city
      const location = cityLocations[Math.floor(Math.random() * cityLocations.length)];
      
      // Add some random variation to the exact coordinates
      const latitude = location.latitude + (Math.random() - 0.5) * 0.01;
      const longitude = location.longitude + (Math.random() - 0.5) * 0.01;

    // Get 2-4 random images
    const imageCount = getRandomNumber(2, 4);
    const listingImages = getRandomItems(unsplashImages, imageCount)
      .map((url, index) => ({
        url,
        order: index + 1
      }));

    // Get 3-6 random features
    const propertyFeatures = getRandomItems(features, getRandomNumber(3, 6));

    // Get 2-4 random facilities
    const propertyFacilities = getRandomItems(facilities, getRandomNumber(2, 4));

    // Generate random price within the range
    const price = getRandomNumber(
      propertyConfig.priceRange.min,
      propertyConfig.priceRange.max
    );

    // Generate random square footage
    const footage = getRandomNumber(
      propertyConfig.footageRange.min,
      propertyConfig.footageRange.max
    );

    // Create listing object
    const listing = {
      name: `${propertyConfig.type.charAt(0) + propertyConfig.type.slice(1).toLowerCase()} in ${location.area}`,
      footage,
      bathroomCount: Math.ceil(footage / 800), // Rough estimate based on size
      bedroomCount: Math.ceil(footage / 600), // Rough estimate based on size
      location: location.area,
      latitude,
      longitude,
      description: `${getRandomItems(propertyConfig.description, 1)[0]}.\n\nFeatures:\n${propertyFeatures.join('\n')}`,
      propertyType: propertyConfig.type,
      price,
      facilities: propertyFacilities,
      userId,
      images: listingImages
    };

    listings.push(listing);
    }
  });

  return listings;
};