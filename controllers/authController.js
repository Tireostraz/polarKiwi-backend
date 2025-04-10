import bcrypt from "bcryptjs";
import pool from "../db/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
    const { email, name, password, role } = req.body;

    const userCheck = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Этот email уже используется" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userTypeId = req.body.user_type_id || 1;

    const result = await pool.query(
      `INSERT INTO users (email, username, password, user_type_id) VALUES ($1, $2, $3, $4) RETURNING user_id`,
      [email, name, hashedPassword, userTypeId]
    );

    const payload = { id: result.rows[0].user_id, user_type_id: userTypeId };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      //secure: process.env.NODE_ENV === "production" ? "true" : "false",
      secure: "false",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "None",
      maxAge: process.env.JWT_REFRESH_EXPIRES_IN_MS,
    });

    res.status(201).json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера", detail: err.detail });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Неверный email или пароль" });
    }

    const user = userResult.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Введён неверный пароль" });
    }

    const payload = { id: user.user_id, role: user.user_type_id };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      //secure: process.env.NODE_ENV === "production" ? "true" : "false",
      secure: "false",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "None",
      maxAge: process.env.JWT_REFRESH_EXPIRES_IN_MS,
    });

    res.status(200).json({ accessToken });
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

      const payload = { id: decoded.id, role: decoded.role };
      const newAccessToken = generateAccessToken(payload);

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    //secure: process.env.NODE_ENV === "production" ? "true" : "false",
    secure: "false",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "None",
  });

  res.status(200).json({ message: "Выход выполнен успешно" });
};

export const me = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Неавторизированный запрос" });
  }
  console.log(req.user);

  res.json({
    id: req.user.user_id,
    email: req.user.email,
    name: req.user.username,
    role: req.user.user_type_id,
  });
};
