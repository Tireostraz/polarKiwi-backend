import express from "express";
import {
  getProducts,
  getProductById,
  getProductsByIds,
} from "../controllers/productController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Управление товарами
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [polaroid, smsbook, poster, brochure]
 *         description: Фильтр по категории
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductDetails'
 *       404:
 *         description: Товар не найден
 *       500:
 *         description: Ошибка сервера
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /products/batch:
 *   post:
 *     summary: Получить список товаров по массиву ID
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Массив данных товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductDetails'
 *       400:
 *         description: Некорректный формат запроса
 *       500:
 *         description: Ошибка сервера
 */

router.post("/batch", getProductsByIds);

export default router;
