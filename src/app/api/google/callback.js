import { setCookie } from "cookies-next";
import passport from "passport";
import "../../../lib/passport";

export default async function handler(req, res) {
  passport.authenticate("google", (err, user, info) => {
    if (err || !user) {
      return res.redirect("https://caimax.co.ke/?a=auth_fail");
    }

    if (info?.token) {
      setCookie("token", info.token, { req, res, httpOnly: true });
    }

    return res.redirect("https://caimax.co.ke/");
  })(req, res);
}
