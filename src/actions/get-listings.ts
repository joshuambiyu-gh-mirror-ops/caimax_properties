'use server'

import { db } from "@/db";

export interface ListingWithImages {
  id: string;
  name: string;
  footage: number;
  bathroomCount: number;
  bedroomCount: number;
  location: string;
  description: string;
  images: {
    url: string;
    order: number;
  }[];
}

export async function getListings() {
  try {
    const listings = await db.listing.findMany({
      include: {
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, listings };
  } catch (error) {
    console.error('Error fetching listings:', error);
    return { error: 'Failed to fetch listings' };
  }
}