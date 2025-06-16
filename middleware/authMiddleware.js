import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUserById } from "../services/userServices.js";

dotenv.config();

export const authenticateToken = async (req, res, next) => {
  const token = req.cookies.accessToken;
  const guestId = req.headers["x-guest-id"];

  // Гостевой доступ без токена
  if (guestId && !token) {
    req.guestId = guestId;
    return next();
  }

  //Если нет ни токена ни гостевого Id
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
    res.status(401).json({ message: "Неверный или просроченный токен" });
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
