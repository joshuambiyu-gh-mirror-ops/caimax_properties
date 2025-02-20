import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // (Optional) Add callbacks, secret, database, etc.
};

// The NextAuth handler is exported as both GET and POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
