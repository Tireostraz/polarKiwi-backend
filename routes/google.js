import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db/db.js"; // подключаем подключение к Postgres

import { parseTimeToMs } from "../utils/timeParser.js";

dotenv.config();
const router = express.Router();

const FRONTEND_URL =
  process.env.NODE_ENV === "dev"
    ? "http://127.0.0.1:3000"
    : "https://polaroidkiwi.ru";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        const name = profile.displayName;

        // Ищем в БД
        let result = await pool.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);
        let user = result.rows[0];

        if (!user) {
          // Создаём нового пользователя
          result = await pool.query(
            `INSERT INTO users (email, username, password, user_type_id, is_verified)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [email, name, null, 1, true]
          );
          user = result.rows[0];
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

router.use(passport.initialize());

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const user = req.user;
    const payload = { id: user.user_id, role: user.role || "user" };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: parseTimeToMs(process.env.JWT_EXPIRES_IN),
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: parseTimeToMs(process.env.JWT_REFRESH_EXPIRES_IN),
      }).send(`
        <html>
          <body>
            <script>
              window.opener.postMessage("google-auth-success", "*");
              window.close();
            </script>
          </body>
        </html>
      `);
  }
);
export default router;
