import bcrypt from "bcryptjs";
import pool from "../db/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../utils/mailer.js";

import { parseTimeToMs } from "../utils/timeParser.js";

dotenv.config();

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const register = async (req, res) => {
  try {
    const { email, firstname, lastname, password } = req.body;

    const userCheck = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Этот email уже используется" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Отправка письма верификации
    const emailToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const result = await pool.query(
      `INSERT INTO users (email, password, is_guest) VALUES ($1, $2, $3) RETURNING user_id`,
      [email, hashedPassword, false]
    );

    const payload = { id: result.rows[0].user_id };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      //secure: process.env.NODE_ENV === "production" ? "true" : "false",
      secure: "false",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "None",
      maxAge: parseTimeToMs(process.env.JWT_REFRESH_EXPIRES_IN),
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      secure: "false",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "None",
      maxAge: parseTimeToMs(process.env.JWT_EXPIRES_IN),
    });

    res.status(201).json({ message: "Регистрация успешна" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера", detail: err.detail });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const userResult = await pool.query(
      `SELECT user_id, firstname, lastname, password, email, is_verified FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Неверный email или пароль" });
    }

    const user = userResult.rows[0];

    const sendUser = {
      id: user.user_id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    };

    if (!user.is_verified) {
      return res.status(403).json({ error: "Подтвердите email перед входом" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Введён неверный пароль" });
    }

    const payload = { id: user.user_id };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    //Access Token
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      secure: false, // СДЕЛАТЬ ПОТОМ true (Когда будет HTTPS) иначе не работает
      /* sameSite: "None", */
      /* sameSite: process.env.NODE_ENV === "production" ? "Strict" : "None", */
      maxAge: rememberMe
        ? parseTimeToMs(process.env.JWT_EXPIRES_IN)
        : undefined,
    });

    if (rememberMe) {
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/",
        //secure: process.env.NODE_ENV === "production" ? "true" : "false",
        secure: false, //TODO СДЕЛАТЬ ПОТОМ true (Когда будет HTTPS) иначе не работает
        /* sameSite: "None", */
        /* sameSite: process.env.NODE_ENV === "production" ? "Strict" : "None", */
        maxAge: parseTimeToMs(process.env.JWT_REFRESH_EXPIRES_IN),
      });
    }

    res.status(200).json({ message: "Вход выполнен успешно", user: sendUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера", detail: err.detail });
  }
};

export const refreshToken = (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "Refresh токен отсутствует" });
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Refresh токен недействителен" });
      }

      const payload = { id: decoded.id };
      const newAccessToken = generateAccessToken(payload);

      //Access Token
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        path: "/",
        secure: "false",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "None",
        /* maxAge: rememberMe  //пока убрал, в запросе тут на рефреш нету поля rememberMe
          ? parseTimeToMs(process.env.JWT_EXPIRES_IN)
          : undefined, */
      });
      console.log("access cookie sent to user");

      res.status(200).json({ message: "Access token отправлен успешно" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  res.status(200).json({ message: "Выход выполнен успешно" });
};

export const check = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Неавторизированный запрос" });
  }

  res.status(200).json({
    id: req.user.user_id,
    firstname: req.user.firstname,
    lastname: req.user.lastname,
    email: req.user.email,
  });
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    await pool.query(`UPDATE users SET is_verified = true WHERE email = $1`, [
      email,
    ]);

    res.status(200).json({ message: "Email подтверждён успешно!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Невалидный или истёкший токен" });
  }
};
