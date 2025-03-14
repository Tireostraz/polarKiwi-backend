import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Доступ к админским данным (только для администраторов)
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Доступ к админ-панели (только для администраторов)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Доступ разрешён, отображается админ-панель
 *       403:
 *         description: Доступ запрещён, если пользователь не админ
 *       401:
 *         description: Неавторизованный запрос
 */

router.get('/dashboard', authenticateToken, authorizeRole(['admin']), (req, res)=>{
    res.status(200).json({ message: 'Добро пожаловать в админ-панель' });
});

router.get('/profile', authenticateToken, (req, res) => {
    res.status(200).json({ message: `Добро пожаловать, ${req.user.role}`})
});

export default router;