import express from "express";
import { register, login } from "../controllers/authController.js";

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
router.post('/register', register);

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
router.post('/login', login);

export default router;