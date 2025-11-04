import { NextResponse } from 'next/server';
import { getRelatedListings } from '@/actions/get-listings';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const listingId = url.searchParams.get('listingId');
    const limit = Number(url.searchParams.get('limit') || '3');
    const skip = Number(url.searchParams.get('skip') || '0');

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    const result = await getRelatedListings(listingId, limit, skip);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ listings: result.listings, hasMore: result.hasMore });
  } catch (error) {
    console.error('API /api/related-listings error', error);
    return NextResponse.json({ error: 'Failed to fetch related listings' }, { status: 500 });
  }
}
