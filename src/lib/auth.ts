import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
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
