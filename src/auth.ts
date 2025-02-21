import NextAuth, { DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import authConfig from "../auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
    secret: process.env.AUTH_SECRET,

    callbacks: {
        async session({ session, user }) {
          if (session && user) {
            session.user.id = user.id;
          }
          return session;
        },
      },
  
  adapter: PrismaAdapter(db),
  ...authConfig,
});
