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

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing google oauth credentials');
}

export const handler = NextAuth({
    adapter: PrismaAdapter(db),
    providers: [
        Google({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        async session({session, user}: any) {
            if(session && user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
});

export const { auth, signIn, signOut } = handler;