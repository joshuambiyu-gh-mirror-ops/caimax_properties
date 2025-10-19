import NextAuth from "next-auth";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { authOptions } from "../../../../../auth.config";

interface ExtendedSession extends Session {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("[Server] Sign In Attempt:", {
          userEmail: user?.email,
          accountType: account?.type,
          providerId: account?.provider,
          timestamp: new Date().toISOString(),
        });
        return true;
      } catch (error) {
        console.error("[Server] Sign In Error:", error);
        return false;
      }
    },
    async session({ session, token, user }): Promise<ExtendedSession> {
      try {
        console.log("[Server] Session Callback:", {
          userId: user?.id || token?.sub,
          email: session?.user?.email,
          timestamp: new Date().toISOString(),
        });
        return {
          ...session,
          user: {
            ...session.user,
            id: user?.id || token?.sub,
            onboarded: (user as any)?.onboarded ?? false,
          },
          expires: session.expires,
        } as ExtendedSession;
      } catch (error) {
        console.error("[Server] Session Callback Error:", error);
        return session as ExtendedSession;
      }
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      try {
        if (user) {
          token.id = user.id;
          token.email = user.email;
        }
        return token;
      } catch (error) {
        console.error("[Server] JWT Callback Error:", error);
        return token;
      }
    }
  }
});

export { handler as GET, handler as POST };