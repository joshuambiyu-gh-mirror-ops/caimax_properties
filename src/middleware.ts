import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Auth is disabled - no checks needed
  return NextResponse.next();
}

// No middleware matching since auth is disabled
export const config = {
  matcher: [],
};