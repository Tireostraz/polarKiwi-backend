import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Управление пользовательскими проектами
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PhotoData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         crop:
 *           type: object
 *           properties:
 *             x: { type: number }
 *             y: { type: number }
 *             width: { type: number }
 *             height: { type: number }
 *         scale:
 *           type: number
 *         rotate:
 *           type: number
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           example: 42
 *         title:
 *           type: string
 *           example: "Моя фотокнига"
 *         type:
 *           type: string
 *           example: "photobook"
 *         format:
 *           type: string
 *           example: "A4-horizontal"
 *         product_id:
 *           type: integer
 *           example: 5
 *         status:
 *           type: string
 *           example: "draft"
 *         pages:
 *           type: array
 *           items:
 *             type: object
 *             description: Данные страницы
 *         photos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PhotoData'
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-05-22T12:34:56.789Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-05-22T12:35:56.789Z"
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Получить список всех проектов пользователя
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Успешный ответ со списком проектов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Неавторизованный доступ
 */
router.get("/", getProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Получить проект по ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Идентификатор проекта
 *     responses:
 *       200:
 *         description: Данные проекта
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Проект не найден
 */
router.get("/:id", getProjectById);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Создать новый проект
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Проект успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Неверные данные запроса
 */
router.post("/", createProject);

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Обновить проект по ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Идентификатор проекта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Проект обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Проект не найден
 */
router.put("/:id", updateProject);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Удалить проект по ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Идентификатор проекта
 *     responses:
 *       204:
 *         description: Проект успешно удалён
 *       404:
 *         description: Проект не найден
 */
router.delete("/:id", deleteProject);

export default router;
