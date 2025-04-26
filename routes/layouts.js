import express from "express";
import {
  getLayouts,
  getLayoutById,
  getPhotoLayouts,
} from "../controllers/layoutsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Layouts
 *   description: Управление шаблонами макетов
 */

/**
 * @swagger
 * /layouts:
 *   get:
 *     summary: Получить список шаблонов
 *     tags: [Layouts]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [cover, page]
 *         description: Фильтр по типу шаблона (обложка или страница)
 *     responses:
 *       200:
 *         description: Список шаблонов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Layout'
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /layouts/{id}:
 *   get:
 *     summary: Получить шаблон по ID
 *     tags: [Layouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID шаблона
 *     responses:
 *       200:
 *         description: Данные шаблона
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Layout'
 *       404:
 *         description: Шаблон не найден
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Layout:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор шаблона
 *         name:
 *           type: string
 *           description: Название шаблона
 *         type:
 *           type: string
 *           enum: [cover, page]
 *           description: Тип шаблона (обложка или страница)
 *         preview_url:
 *           type: string
 *           description: URL превью шаблона
 *         data:
 *           type: object
 *           description: Конфигурация элементов Konva.js
 *           properties:
 *             nodes:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   attrs:
 *                     type: object
 */

router.get("/", getLayouts); // /layouts?type=cover | page
router.get("/:id", getLayoutById); // /layouts/:id

/**
 * @swagger
 * /layouts/photo:
 *   post:
 *     summary: Получить шаблоны фотомакетов по формату
 *     tags: [Layouts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 description: Формат фотомакета (например, 'Standard')
 *             required:
 *               - format
 *     responses:
 *       200:
 *         description: Список шаблонов фотомакетов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PhotoLayout'
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PhotoLayout:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор шаблона
 *         title:
 *           type: string
 *           description: Название шаблона
 *         quantity:
 *           type: number
 *           description: Минимальное количество фото для заказа
 *         size:
 *           type: object
 *           properties:
 *             width:
 *               type: integer
 *               description: Ширина изображения
 *             height:
 *               type: integer
 *               description: Высота изображения
 *             top:
 *               type: integer
 *               description: Верхняя граница
 *             right:
 *               type: integer
 *               description: Правая граница
 *             bottom:
 *               type: integer
 *               description: Нижняя граница
 *             left:
 *               type: integer
 *               description: Левая граница
 */
router.post("/photo", getPhotoLayouts); // /layouts/photo

export default router;
