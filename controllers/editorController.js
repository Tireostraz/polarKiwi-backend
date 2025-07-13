import pool from "../db/db.js";

//загружаем состояние проекта (редактируемые страницы) api/edit/95160109/content
export const loadPages = async (req, res) => {
  const userId = req.user.user_id || null;
  const guestId = req.guestId || null;

  const projectId = req.params.projectId;

  const result = await pool.query(
    `SELECT p.*, pr_t.* FROM projects as p 
    LEFT JOIN products as pr ON p.product_id = pr.id
    LEFT JOIN product_templates as pr_t ON pr.id = pr_t.product_id
    WHERE (p.id = $1)`,
    [projectId]
  );

  const formatedContent = result.rows.map((p) => {
    return {
      id: p.id,
      definition: p.definition,
      definition_version: p.definition_version,
      status: p.status,
    };
  });
  res.status(200).json({ response: formatedContent });
};

export const savePages = async (req, res) => {};

export const loadTemplate = async (req, res) => {};
