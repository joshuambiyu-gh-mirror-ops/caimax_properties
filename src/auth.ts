import NextAuth, { Session, User } from "next-auth";
import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import authConfig from "../auth.config";

const authOptions = {
  secret: process.env.AUTH_SECRET,

  callbacks: {
    async session({ session, user }: { session: Session; user: User }) {
      if (session && user) {
        // @ts-ignore - augmenting session.user with id; consider module augmentation for types
        session.user.id = user.id;
      }
      return session;
    },
  },

  adapter: PrismaAdapter(db),
  ...authConfig,
};

// Create the NextAuth handler and export for App Router (GET/POST)
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export async function auth() {
  try {
    const session = await getServerSession(authOptions as any);
    return session as Session | null;
  } catch (error) {
    console.error('Error getting server session', error);
    return null;
  }
}

// Simple helpers for server actions: return the provider route so callers
// (server actions) can return or redirect the client as needed.
export function signIn(provider: string, callbackUrl?: string) {
  const url = `/api/auth/signin/${provider}` + (callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "");
  return url;
}

export function signOut(callbackUrl?: string) {
  const url = `/api/auth/signout` + (callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "");
  return url;
}
