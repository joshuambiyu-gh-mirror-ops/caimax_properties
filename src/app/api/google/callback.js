// import { setCookie } from "cookies-next";
// import passport from "passport";
// import "../../../lib/passport";

// export default async function handler(req, res) {
//   passport.authenticate("google", (err, user, info) => {
//     if (err || !user) {
//       return res.redirect("https://caimax.co.ke/?a=auth_fail");
//     }

//     if (info?.token) {
//       setCookie("token", info.token, { req, res, httpOnly: true });
//     }

//     return res.redirect("https://caimax.co.ke/");
//   })(req, res);
// }


import { cookies } from "next/headers";
import passport from "passport";
import "../../../../lib/passport"; // Adjust path if necessary
import { NextResponse } from "next/server";

export async function GET(req) {
  return new Promise((resolve) => {
    passport.authenticate("google", (err, user, info) => {
      if (err || !user) {
        return resolve(NextResponse.redirect("https://caimax.co.ke/?a=auth_fail"));
      }

      if (info?.token) {
        cookies().set("token", info.token, {
          httpOnly: true,
          secure: true,
          path: "/",
        });
      }

      return resolve(NextResponse.redirect("https://caimax.co.ke/"));
    })(req);
  });
}
