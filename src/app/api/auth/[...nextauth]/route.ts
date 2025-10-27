import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../../db";

export const authOptions = {
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
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
					async signIn(params: { user: any; account: any; profile?: any; email?: any; credentials?: any }) {
						const { user, profile } = params;
						// Ensure user exists in DB after login
						console.log('NextAuth signIn callback triggered for user:', user);
						if (!user?.email) return false;
						const existingUser = await db.user.findUnique({ where: { email: user.email } });
								if (!existingUser) {
									const createdUser = await db.user.create({
										data: {
											email: user.email,
											name: user.name || profile?.name || null,
											image: user.image || profile?.picture || null,
										},
									});
									console.log('Created new user:', createdUser);
								} else {
									console.log('User already exists:', existingUser);
								}
						return true;
					},
				async session({ session, token }: { session: any; token: any }) {
					// Attach Prisma user id to session
					if (session.user && session.user.email) {
						const dbUser = await db.user.findUnique({ where: { email: session.user.email } });
						if (dbUser) {
							session.user.id = dbUser.id;
						}
					}
					return session;
				},
		},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };