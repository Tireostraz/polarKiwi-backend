import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getProjects,
  getProjectsIds,
  draftProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  duplicateProject,
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
 * /projects/ids:
 *   get:
 *     summary: Получить идентификаторы проектов в корзине и черновиках
 *     tags: [Projects]
 *     description: >
 *       Возвращает списки идентификаторов проектов пользователя или гостя с их количеством.
 *       Группировка производится по статусу: `in_cart` и `draft`.
 *     responses:
 *       200:
 *         description: Успешный ответ с идентификаторами проектов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: object
 *                   properties:
 *                     cart_projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 94918827
 *                           quantity:
 *                             type: integer
 *                             example: 2
 *                     draft_projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 95137788
 *                           quantity:
 *                             type: integer
 *                             example: 1
 *       401:
 *         description: Неавторизованный доступ — не найден userId или guestId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Не найден userId или guestId
 *       500:
 *         description: Ошибка сервера при получении проектов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ошибка при получении проектов
 */
router.get("/ids", getProjectsIds);

/**
 * @swagger
 * /projects/drafts:
 *   get:
 *     summary: Получить список черновиков пользователя или гостя
 *     tags: [Projects]
 *     description: >
 *       Возвращает список проектов в статусе `draft` или `in_cart`, принадлежащих текущему авторизованному пользователю (по `userId`) или гостю (по `guestId`).
 *     responses:
 *       200:
 *         description: Успешный ответ со списком черновиков
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: object
 *                   properties:
 *                     drafts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           expired_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-12-17T16:09:28.570Z"
 *                           project:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                                 example: "0052dde5-540b-4855-8d55-ff96cbc77f60"
 *                               title:
 *                                 type: string
 *                                 example: "Полароид стандарт"
 *                               subtitle:
 *                                 type: string
 *                                 nullable: true
 *                                 example: null
 *                               image_url:
 *                                 type: string
 *                                 format: uri
 *                                 nullable: true
 *                                 example: null
 *                               status:
 *                                 type: string
 *                                 enum: [draft, in_cart]
 *                                 example: "in_cart"
 *                               quantity:
 *                                 type: integer
 *                                 example: 1
 *                               can_be_reordered:
 *                                 type: boolean
 *                                 example: false
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-06-17T16:09:28.570Z"
 *                               updated_at:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-11T22:05:08.414Z"
 *                               product:
 *                                 type: object
 *                                 properties:
 *                                   slug:
 *                                     type: string
 *                                     example: "standard"
 *                                   price:
 *                                     type: integer
 *                                     description: Цена продукта в базовой валюте (например, рублях или центах)
 *                                     example: 20
 *       401:
 *         description: Неавторизованный доступ — отсутствует userId и guestId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Не найден userId или guestId
 *       500:
 *         description: Ошибка сервера при получении черновиков
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ошибка запроса черновиков
 */
router.get("/drafts", draftProjects);

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

/**
 * @swagger
 * /projects/{id}/duplicate:
 *   post:
 *     summary: Продублировать проект
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID проекта для дублирования
 *     responses:
 *       201:
 *         description: Дубликат проекта успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Проект не найден
 */
router.post("/:id/duplicate", duplicateProject);

export default router;
