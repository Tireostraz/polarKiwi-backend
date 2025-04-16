import pool from "../db/db.js";

export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;

    let query = `
      SELECT 
        p.*,
        json_agg(pi.url) AS images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
    `;

    const params = [];

    if (category) {
      query += ` WHERE p.category = $1`;
      params.push(category);
    }

    query += ` GROUP BY p.id ORDER BY p.id ASC`;

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await pool.query(
      `SELECT 
        p.*,
        json_agg(pi.url) AS images,
        COALESCE(
          json_agg(
            json_build_object(
              'url', pi.url,
              'alt_text', pi.alt_text
            )
          ) FILTER (WHERE pi.url IS NOT NULL),
          '[]'
        ) AS images_details
       FROM products p
       LEFT JOIN product_images pi ON p.id = pi.product_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    // Добавляем специфичные атрибуты в зависимости от категории
    const product = productResult.rows[0];

    if (product.category === "polaroid") {
      const attributes = await pool.query(
        "SELECT * FROM polaroid_attributes WHERE product_id = $1",
        [id]
      );
      product.attributes = attributes.rows[0];
    }
    // Аналогично для других категорий...

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
