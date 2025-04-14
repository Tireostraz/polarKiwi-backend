import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUserById } from "../services/userServices.js";

dotenv.config();

export const authenticateToken = async (req, res, next) => {
  let token;

  // Проверяем наличие токена в заголовке Authorization
  const authHeader = req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Если в заголовке нет токена, пытаемся получить его из cookies
  if (!token && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: "Токен отсутствует" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    req.user = user; // Добавляем пользователя в объект запроса
    next();
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: "Неверный или просроченный токен" });
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Доступ запрещен" });
    }
    next();
  };
};
