import NextAuth, { Session, User } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { OAuth2Client } from "google-auth-library";
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
  // Add a credentials provider to accept Google One Tap ID tokens
  providers: [
    // keep any providers from authConfig (spread above) by merging here
    ...(authConfig.providers || []),
    CredentialsProvider({
      id: "google-onetap",
      name: "Google One Tap",
      credentials: {
        id_token: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        const idToken = credentials?.id_token as string | undefined;
        if (!idToken) {
          throw new Error("No ID token provided");
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) throw new Error("Invalid ID token");

        // Upsert user into Prisma so we persist them in the database
        try {
          const persisted = await db.user.upsert({
            where: { email: payload.email ?? "" },
            create: {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              image: payload.picture,
            },
            update: {
              name: payload.name,
              image: payload.picture,
            },
          });

          // Return the user object that NextAuth expects
          const user = {
            id: persisted.id,
            name: persisted.name,
            email: persisted.email,
            image: persisted.image,
          } as any;

          return user;
        } catch (err) {
          console.error("Failed to upsert One Tap user", err);
          // Fallback to returning a minimal in-memory user object if DB fails
          return {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            image: payload.picture,
          } as any;
        }
      },
    }),
  ],
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
