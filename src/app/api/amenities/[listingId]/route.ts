import { db } from '@/db';
import { fetchAndStoreAmenities } from '@/lib/fetch-amenities';
import { NextResponse } from 'next/server';
import type { amenities } from '@prisma/client';

type AmenityResponse = Pick<amenities, 'id' | 'type' | 'name' | 'distance' | 'latitude' | 'longitude'>;

export async function GET(
  request: Request,
  // Next's generated route types expect `params` to be a promise-like value
  // (Promise<any>). Declare it as such to satisfy the type checker. At
  // runtime `await params` will work whether the framework supplies a
  // promise-like object or a plain object.
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    // `params` can be a promise-like value in some Next runtimes — await it first.
    const resolvedParams = (await params) as { listingId?: string } | undefined;
    const listingId = resolvedParams?.listingId;
    if (!listingId) return NextResponse.json({ error: 'Missing listingId' }, { status: 400 });
    // Fetch listing and stored amenities. Failures reading from the DB are
    // handled gracefully so the client doesn't receive a 500 for transient
    // database issues (improves UX while allowing background refreshes to run).
    let listing;
    try {
      listing = await db.listing.findUnique({ where: { id: listingId }, select: { id: true, lastAmenityCheck: true } });
    } catch (dbErr) {
      console.error('DB error when fetching listing for amenities:', dbErr);
      // Return an empty result set with a gentle hint that data may be stale.
      return NextResponse.json({ amenities: [], stale: true, dbError: true });
    }

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    let amenities: AmenityResponse[] = [];
    try {
      amenities = await db.amenities.findMany({
        where: { listingId },
        orderBy: { distance: 'asc' },
        select: { id: true, type: true, name: true, distance: true, latitude: true, longitude: true }
      });
    } catch (dbErr) {
      console.error('DB error when fetching amenities for listing', listingId, dbErr);
      // If the DB read fails, return an empty list rather than a 500 so the
      // client can still render the page. Mark the response as stale.
      return NextResponse.json({ amenities: [], stale: true, dbError: true });
    }

    // If amenities are missing or stale (older than 7 days), trigger a background refresh.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (!listing.lastAmenityCheck || listing.lastAmenityCheck < sevenDaysAgo) {
      // Trigger refresh but do not await — best-effort background refresh.
      fetchAndStoreAmenities(listingId).catch(err => console.error('Background amenities refresh failed:', err));
    }

    return NextResponse.json({ amenities, stale: !listing.lastAmenityCheck || listing.lastAmenityCheck < sevenDaysAgo });
  } catch (error) {
    // Provide more context in logs and include the stack in non-production
    // environments to help debugging. Return a safe 500 with minimal info.
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('GET /api/amenities error:', error, errorStack);
    const isProd = process.env.NODE_ENV === 'production';
    const body = isProd 
      ? { error: 'Internal error' } 
      : { 
          error: error instanceof Error ? error.message : 'Internal error', 
          stack: errorStack 
        };
    return NextResponse.json(body, { status: 500 });
  }
}
