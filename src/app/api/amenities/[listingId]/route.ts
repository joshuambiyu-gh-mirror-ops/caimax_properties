import { db } from '@/db';
import { fetchAndStoreAmenities } from '@/lib/fetch-amenities';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    // `params` can be a promise-like value in some Next runtimes — await it first.
    const resolvedParams = (await params) as { listingId?: string } | undefined;
    const listingId = resolvedParams?.listingId;
    if (!listingId) return NextResponse.json({ error: 'Missing listingId' }, { status: 400 });

    const listing = await db.listing.findUnique({ where: { id: listingId }, select: { id: true, lastAmenityCheck: true } });
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    // Return stored amenities
    const amenities = await db.amenities.findMany({
      where: { listingId },
      orderBy: { distance: 'asc' },
      select: { id: true, type: true, name: true, distance: true, latitude: true, longitude: true }
    });

    // If amenities are missing or stale (older than 7 days), trigger a background refresh.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (!listing.lastAmenityCheck || listing.lastAmenityCheck < sevenDaysAgo) {
      // Trigger refresh but do not await — best-effort background refresh.
      fetchAndStoreAmenities(listingId).catch(err => console.error('Background amenities refresh failed:', err));
    }

    return NextResponse.json({ amenities, stale: !listing.lastAmenityCheck || listing.lastAmenityCheck < sevenDaysAgo });
  } catch (error) {
    console.error('GET /api/amenities error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
