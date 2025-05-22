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
 *   description: Управление проектами пользователя
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Получить список всех проектов пользователя
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Список проектов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Неавторизован
 */

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
 *         description: ID проекта
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
 *         description: Проект создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Неверный формат данных
 */

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
 *         description: ID проекта
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
 *         description: ID проекта
 *     responses:
 *       204:
 *         description: Проект удален
 *       404:
 *         description: Проект не найден
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Моя фотокнига"
 *         type:
 *           type: string
 *           example: "photobook"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-22T12:34:56.789Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-22T12:35:56.789Z"
 *         data:
 *           type: object
 *           description: Произвольные данные проекта (layout, photos и т.д.)
 *           example:
 *             layoutId: 123
 *             photos:
 *               - id: "abc123"
 *                 crop: { x: 0, y: 0, width: 100, height: 100 }
 *                 scale: 1.2
 */

router.get("/", getProjects); // GET /projects
router.get("/:id", getProjectById); // GET /projects/:id
router.post("/", createProject); // POST /projects
router.put("/:id", updateProject); // PUT /projects/:id
router.delete("/:id", deleteProject); // DELETE /projects/:id

export default router;
