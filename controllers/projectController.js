import pool from "../db/db.js";

/* Получить все проекты пользователя */
export const getProjects = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await pool.query(
      "SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Ошибка при получении проектов" });
  }
};

/* Получить один проект */
export const getProjectById = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Проект не найден" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ error: "Ошибка при получении проекта" });
  }
};

/* Создать новый проект */
export const createProject = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { name, product_type, layout, data } = req.body;

    const result = await pool.query(
      `INSERT INTO projects (user_id, name, product_type, layout, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, product_type, layout, data]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Ошибка при создании проекта" });
  }
};

/* Обновить проект */
export const updateProject = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;
    const { name, product_type, layout, data } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET name = $1, product_type = $2, layout = $3, data = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, product_type, layout, data, id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Проект не найден или нет доступа" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ error: "Ошибка при обновлении проекта" });
  }
};

/* Удалить проект */
export const deleteProject = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Проект не найден или нет доступа" });
    }

    res.json({ message: "Проект удален" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Ошибка при удалении проекта" });
  }
};
