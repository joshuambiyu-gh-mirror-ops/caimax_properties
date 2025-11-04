import { NextResponse } from 'next/server';
import { getListings } from '@/actions/get-listings';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || '10');
    const skip = Number(url.searchParams.get('skip') || '0');

    const result = await getListings(limit, skip);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ listings: result.listings, hasMore: result.hasMore });
  } catch (error) {
    console.error('API /api/listings error', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}
