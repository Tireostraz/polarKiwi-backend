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
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: secretPassword
 *     responses:
 *       201:
 *         description: Регистрация успешна, accessToken возвращается в JSON, refreshToken устанавливается в cookie
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=xyz123; HttpOnly; Secure; Path=/auth/refresh
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access-токен
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
 *         description: Авторизация успешна
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=xyz123; HttpOnly; Secure; Path=/auth/refresh
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access-токен
 *       400:
 *         description: Неверный email или пароль
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Обновление access-токена
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Новый access-токен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Новый access-токен
 *       401:
 *         description: Refresh-токен невалиден или отсутствует
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Выход из системы
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Удаляет refresh-токен
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=; HttpOnly; Secure; Path=/auth/refresh; Max-Age=0
 */
router.post("/logout", logout);

export default router;
