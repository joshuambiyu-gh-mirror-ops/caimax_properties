// import passport from "passport";
// import "../../../lib/passport"; 

// export default async function handler(req, res, next) {
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//     session: false,
//   })(req, res, next);
// }
// //


import passport from "passport";
import "../../../lib/passport"; // Adjust path if necessary
import { NextResponse } from "next/server";

export async function GET(req) {
  return new Promise((resolve, reject) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })(req, {}, (err, user, info) => {
      if (err) {
        reject(NextResponse.json({ error: err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ user, info }, { status: 200 }));
      }
    });
  });
}
