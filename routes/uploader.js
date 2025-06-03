import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  uploadImage,
  getUserImages,
  sendImage,
} from "../controllers/uploadController.js";

const router = express.Router();

/**
 * @swagger
 * /uploader/upload:
 *   post:
 *     summary: Загрузить изображение
 *     tags: [Uploader]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Информация о сохранённом файле
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadedImage'
 *       401: { description: Неавторизован }
 *       500: { description: Ошибка сервера }
 */

/**
 * @swagger
 * /uploader/images:
 *   get:
 *     summary: Получить список изображений пользователя
 *     tags: [Uploader]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Список картинок
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UploadedImage'
 *       401: { description: Неавторизован }
 *       500: { description: Ошибка сервера }
 */

/**
 * @swagger
 * /images/{userId}/{file}:
 *   get:
 *     summary: Скачать изображение
 *     tags: [Uploader]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: file
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: jpg-файл }
 *       403: { description: Чужое изображение }
 *       404: { description: Файл не найден }
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadedImage:
 *       type: object
 *       properties:
 *         filename: { type: string }
 *         url:      { type: string }
 *         width:    { type: integer }
 *         height:   { type: integer }
 */

/* ---------- POST /uploader/upload ---------- */
router.post(
  "/upload",
  authenticateToken,
  upload.single("image"), // field name = image
  uploadImage
);

/* ---------- GET /uploader/images ---------- */
router.get("/images", authenticateToken, getUserImages);

/* ---------- GET /images/:userId/:file ---------- */
router.get("/images/:userId/:projectId/:file", authenticateToken, sendImage);

export default router;
