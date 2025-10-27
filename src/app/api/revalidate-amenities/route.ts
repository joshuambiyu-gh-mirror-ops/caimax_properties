import { db } from '@/db';
import { fetchAndStoreAmenities } from '@/lib/fetch-amenities';
import { NextResponse } from 'next/server';

export const revalidate = 2592000; // 30 days in seconds

export async function GET() {
  try {
    // Get all listings that need amenity updates
    // (either never checked or checked more than 30 days ago)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const listings = await db.listing.findMany({
      where: ( {
        OR: [
          { lastAmenityCheck: null },
          { lastAmenityCheck: { lt: thirtyDaysAgo } }
        ]
      } as any ),
      select: { id: true }
    });

    // Enqueue refresh jobs instead of running them inline. This avoids
    // exhausting DB connections and spreads work over the queue worker.
    const { enqueueAmenityRefresh } = await import('@/lib/amenity-queue');
    const enqueued = listings.map(l => enqueueAmenityRefresh(l.id));
    const results = { total: listings.length, enqueued };
    return NextResponse.json(results);
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate amenities' },
      { status: 500 }
    );
  }
}

// SELECT state, count(*) FROM pg_stat_activity WHERE datname = current_database() GROUP BY state;