import pool from "../db/db.js";

export const getLayouts = async (req, res) => {
  try {
    const { type } = req.query;
    const params = [];
    let query = "SELECT id, name, preview_url, type, data FROM layouts";

    if (type) {
      query += " WHERE type = $1";
      params.push(type);
    }

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении шаблонов:", err);
    res.status(500).json({ error: "Ошибка сервера при получении шаблонов" });
  }
};

export const getLayoutById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM layouts WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Шаблон не найден" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при получении шаблона:", err);
    res.status(500).json({ error: "Ошибка сервера при получении шаблона" });
  }
};
