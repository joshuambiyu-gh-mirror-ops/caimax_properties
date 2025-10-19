import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { OAuth2Client } from "google-auth-library";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/db";

interface ExtendedSession extends Session {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    onboarded?: boolean;
  };
}

interface ExtendedUser extends User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

export const options: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  useSecureCookies: false, // Since we're on localhost
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false // Since we're on localhost
      }
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "google-onetap",
      name: "Google One Tap",
      credentials: {
        id_token: { label: "ID Token", type: "text" },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        try {
          const idToken = credentials?.id_token;
          if (!idToken) throw new Error("No ID token provided");

          const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
          const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
          });

          const payload = ticket.getPayload();
          if (!payload) throw new Error("Invalid ID token");
          if (!payload.email) throw new Error("No email in ID token");

          // Find or create user
          const user = await db.user.upsert({
            where: { email: payload.email },
            update: {},
            create: {
              email: payload.email,
              name: payload.name || null,
              image: payload.picture || null,
              onboarded: false,
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Google One Tap auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }): Promise<ExtendedSession> {
      if (session?.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: user?.id || token?.sub,
            onboarded: typeof token.onboarded === 'boolean' ? token.onboarded : undefined,
          },
        };
      }
      return session as ExtendedSession;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as ExtendedUser).id;
        token.onboarded = (user as any).onboarded;
      }
      return token;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
} satisfies NextAuthOptions;

export const authOptions = options;
export default options;