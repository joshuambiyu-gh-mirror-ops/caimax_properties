// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google"; // ✅ Correct import
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { db } from "./db";

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET){
//     throw new Error ('Missing google oauth credentials');
// }

// export const{handlers:{GET,POST}, auth, signOut, signIn}=NextAuth({
//     adapter: PrismaAdapter(db),
//     providers: [
//         Google({
//             clientId: GOOGLE_CLIENT_ID,
//             clientSecret: GOOGLE_CLIENT_SECRET
//         })
//     ],
//     callbacks:{
//         //not needed fixing bug for nextauth
//         async session ({session, user}: any){
//             if(session && user){
//                 session.user.id=user.id;
//             }
//             return session;

//         },
//     },
// });

// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { db } from "./db";

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
//     throw new Error('Missing google oauth credentials');
// }

// export const handler = NextAuth({
//     adapter: PrismaAdapter(db),
//     providers: [
//         Google({
//             clientId: GOOGLE_CLIENT_ID,
//             clientSecret: GOOGLE_CLIENT_SECRET
//         })
//     ],
//     callbacks: {
//         async session({session, user}: any) {
//             if(session && user) {
//                 session.user.id = user.id;
//             }
//             return session;
//         },
//     },
// });

// export const { auth, signIn, signOut } = handler;

// import NextAuth from "next-auth";
// import Github from "next-auth/providers/github";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// // import { db } from "./app/db";
// import { db } from "./db";

// const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
// const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET){
//     throw new Error ('Missing github oauth credentials');
// }

// export const{handlers:{GET,POST}, auth, signOut, signIn}=NextAuth({
//     adapter: PrismaAdapter(db),
//     providers: [
//         Github({
//             clientId: GITHUB_CLIENT_ID,
//             clientSecret: GITHUB_CLIENT_SECRET
//         })
//     ],
//     callbacks:{
//         //not needed fixing bug for nextauth
//         async session ({session, user}: any){
//             if(session && user){
//                 session.user.id=user.id;
//             }
//             return session;

//         },
//     },
// });


// import NextAuth from "next-auth";
// import GithubProvider from "next-auth/providers/github";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { db } from "./db";
// // Removed incorrect import statement for auth, signIn, and signOut

// const authOptions = {
//   adapter: PrismaAdapter(db),
//   providers: [
//     GithubProvider({
//       clientId: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     }),
//   ],
//   callbacks: {
//     async session({ session, user }) {
//       if (session && user) {
//         session.user.id = user.id;
//       }
//       return session;
//     },
//   },
// };

// // ✅ API Routes (for handling authentication requests)
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

// // ✅ Server Actions (for manually calling auth functions)
// export const auth = nextAuth;
// export const signIn = nextSignIn;
// export const signOut = nextSignOut;


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
