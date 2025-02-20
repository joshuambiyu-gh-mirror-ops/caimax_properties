import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { db } from "@/db";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://caimax.co.ke/api/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const image = profile.photos?.[0]?.value;
        const name = profile.displayName;

        let user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await db.user.create({
            data: { name, email, image },
          });
        }

        const token = jwt.sign(
          { id: user.id, created: Date.now().toString() },
          process.env.AUTH_SECRET,
          { expiresIn: "1d" }
        );

        return done(null, user, { message: "Authenticated", token });
      } catch (err) {
        return done(err, false, { message: "Server Error" });
      }
    }
  )
);
