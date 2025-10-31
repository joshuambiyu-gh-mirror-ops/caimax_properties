import { NextResponse } from "next/server";

export async function middleware() {
  // Auth is disabled - no checks needed
  return NextResponse.next();
}

// No middleware matching since auth is disabled
export const config = {
  matcher: [],
};