import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/authController.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Авторизация и регистрация
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: User
 *               password:
 *                 type: string
 *                 example: secretPassword
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       201:
 *         description: Пользователь зарегистрирован, возвращает токен
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: secretPassword
 *     responses:
 *       200:
 *         description: Авторизация успешна, возвращает токен
 *       400:
 *         description: Неверный email или пароль
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Обновление access токена по refresh токену из cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Возвращает новый access токен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Новый JWT access токен
 *       401:
 *         description: Refresh токен не найден
 *       403:
 *         description: Refresh токен недействителен или истёк
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Выход пользователя и удаление refresh токена из cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Выход выполнен успешно
 */
router.post("/logout", logout);

export default router;
