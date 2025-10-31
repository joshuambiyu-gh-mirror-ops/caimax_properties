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
      type PgConnCount = { cnt: number };
      const result = await db.$queryRaw<PgConnCount[]>`SELECT count(*)::int as cnt FROM pg_stat_activity WHERE datname = current_database()`;
      if (result?.[0]?.cnt !== undefined) {
        activeConnections = result[0].cnt;
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
