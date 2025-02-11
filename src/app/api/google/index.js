import passport from "passport";
import "../../../lib/passport"; 

export default async function handler(req, res, next) {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
}
//cahnges