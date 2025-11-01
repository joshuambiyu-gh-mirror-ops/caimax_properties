import { NextResponse } from 'next/server';
import { db } from '@/db';

function parseDatabaseHost(databaseUrl: string | undefined) {
  if (!databaseUrl) return null;
  try {
    // DATABASE_URL format: postgres://user:pass@host:port/dbname
    const withoutProto = databaseUrl.split('://')[1];
    const hostPort = withoutProto.split('@')[1].split('/')[0];
    const [host, port] = hostPort.split(':');
    return { host, port };
  } catch {
    return null;
  }
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const hostInfo = parseDatabaseHost(dbUrl);

  try {
    // Run a tiny query to check reachability
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, host: hostInfo, message: 'DB query successful' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, host: hostInfo, message: 'DB query failed', error: errorMessage }, { status: 500 });
  }
}
