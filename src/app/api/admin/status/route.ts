import { db } from '@/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic DB health check
    let dbConnected = false;
    let activeConnections: number | null = null;
    try {
      await db.$queryRaw`SELECT 1`;
      dbConnected = true;
      // Try to get active connections (Postgres-specific)
      const result: any = await db.$queryRaw`SELECT count(*)::int as cnt FROM pg_stat_activity WHERE datname = current_database()`;
      if (Array.isArray(result) && result.length) {
        activeConnections = result[0].cnt ?? null;
      } else if (result && typeof result.cnt === 'number') {
        activeConnections = result.cnt;
      }
    } catch (err) {
      console.error('DB health check failed:', err);
    }

    // Get latest amenity refresh info
    const latest = await db.listing.findFirst({
      orderBy: { lastAmenityCheck: 'desc' },
      select: { id: true, lastAmenityCheck: true }
    });

    return NextResponse.json({ dbConnected, activeConnections, latestAmenityCheck: latest?.lastAmenityCheck ?? null });
  } catch (error) {
    console.error('/api/admin/status error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
