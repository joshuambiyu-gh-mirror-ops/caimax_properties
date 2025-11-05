import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";
import { db } from "@/db";
import type { Account, Profile, Session, User as AuthUser } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";

interface GoogleProfile extends Profile {
  email_verified?: boolean;
  email?: string;
  name?: string;
  picture?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.NEXT_GITHUB_CLIENT_ID!,
      clientSecret: process.env.NEXT_GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials provider to accept Google One Tap ID token
    CredentialsProvider({
      id: 'google-onetap',
      name: 'Google One Tap',
      credentials: {
        id_token: { label: 'ID Token', type: 'text' },
      },
      async authorize(credentials) {
        const idToken = credentials?.id_token as string | undefined;
        if (!idToken) return null;

        // Verify the ID token using Google's tokeninfo endpoint
        try {
          const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
          if (!res.ok) {
            console.error('Failed to verify id_token with Google tokeninfo:', await res.text());
            return null;
          }
          const payload = await res.json() as {
            aud?: string;
            sub?: string;
            name?: string;
            email?: string;
            picture?: string;
          };

          // Validate audience
          const aud = payload.aud;
          if (aud !== process.env.GOOGLE_CLIENT_ID && aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
            console.error('ID token audience mismatch', aud);
            return null;
          }

          // Ensure required fields exist
          if (!payload.sub || !payload.email) {
            console.error('ID token missing required fields', payload);
            return null;
          }

          // Build a properly typed user object for NextAuth
          const user: AuthUser = {
            id: payload.sub,
            name: payload.name ?? '',
            email: payload.email,
            image: payload.picture ?? undefined,
          };

          return user;
        } catch (error) {
          console.error('Error verifying Google id_token:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async signIn(params: { user: AuthUser | AdapterUser; account: Account | null; profile?: GoogleProfile }) {
      const { user, profile } = params;
      console.log('NextAuth signIn callback triggered for user:', user);
      if (!user?.email) return false;
      const existingUser = await db.user.findUnique({ where: { email: user.email } });
      if (!existingUser) {
        const isAdminEmail = (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL === user.email) || user.email === 'joshuambiyu002@gmail.com';
        const createdUser = await db.user.create({
          data: {
            email: user.email,
            name: user.name || profile?.name || null,
            image: user.image || profile?.picture || null,
            role: isAdminEmail ? 'ADMIN' : 'USER',
          },
        });
        console.log('Created new user:', createdUser);
      } else {
        console.log('User already exists:', existingUser);
        try {
          const shouldBeAdmin = (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL === existingUser.email) || existingUser.email === 'joshuambiyu002@gmail.com';
          if (shouldBeAdmin && existingUser.role !== 'ADMIN') {
            await db.user.update({ where: { id: existingUser.id }, data: { role: 'ADMIN' } });
            console.log('Promoted existing user to ADMIN:', existingUser.email);
          }
        } catch (error) {
          console.error('Failed to promote existing user to ADMIN (non-fatal):', error);
        }
      }
      return true;
    },
    async session({ session }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user?.email) {
        const dbUser = await db.user.findUnique({ where: { email: session.user.email } });
        if (dbUser) {
          session.user.id = dbUser.id;
          // attach role (string) onto session.user — NextAuth's DefaultSession.user doesn't have role
          // but the app assumes it exists; this mutation is safe at runtime.
          (session.user as Session['user'] & { role?: string }).role = dbUser.role;
        }
      }
      return session;
    },
  },
};
