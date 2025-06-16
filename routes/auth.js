import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  register,
  login,
  refreshToken,
  logout,
  check,
  verifyEmail,
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
 *                 format: email
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: Иван Иванов
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *               user_type_id:
 *                 type: integer
 *                 description: ID типа пользователя (опционально)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: |
 *                 refreshToken=xyz123; HttpOnly; Path=/; Max-Age=604800
 *                 accessToken=abc456; HttpOnly; Path=/; Max-Age=900
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Регистрация успешна
 *       400:
 *         description: Ошибка валидации или email уже используется
 *       500:
 *         description: Ошибка сервера
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
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *               rememberMe:
 *                 type: boolean
 *                 description: Запомнить пользователя (долгоживущие куки)
 *                 example: true
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: |
 *                 refreshToken=xyz123; HttpOnly; Path=/; Max-Age=604800
 *                 accessToken=abc456; HttpOnly; Path=/; Max-Age=900
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Вход выполнен успешно
 *       400:
 *         description: Неверный email или пароль
 *       500:
 *         description: Ошибка сервера
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
 *   get:
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
router.get("/logout", logout);

/**
 * @swagger
 * /auth/check:
 *   get:
 *     summary: Получение информации о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о текущем пользователе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 role:
 *                   type: user | admin
 *                   example: user
 *       401:
 *         description: Пользователь не авторизован (токен отсутствует или недействителен)
 */
router.get("/check", authenticateToken, check);

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Подтверждение email-адреса
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Токен подтверждения email
 *     responses:
 *       200:
 *         description: Email успешно подтверждён
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email подтверждён успешно!
 *       400:
 *         description: Невалидный или истёкший токен
 */

router.get("/verify-email", verifyEmail);

export default router;
