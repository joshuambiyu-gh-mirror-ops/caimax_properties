import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/auth/signin";

  // Get session token and log state
  const sessionToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log(`[Server] Middleware Check - Path: ${path}`, {
    isPublicPath,
    hasSession: !!sessionToken,
    userId: sessionToken?.sub,
    email: sessionToken?.email,
    timestamp: new Date().toISOString(),
  });

  // Redirect authenticated users away from public routes
  if (isPublicPath && sessionToken) {
    console.log("[Server] Redirecting authenticated user to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to signin page
  if (!isPublicPath && !sessionToken) {
    console.log("[Server] Redirecting unauthenticated user to home");
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Add routes that should be protected by authentication
export const config = {
  matcher: ["/dashboard/:path*", "/", "/auth/signin"],
};