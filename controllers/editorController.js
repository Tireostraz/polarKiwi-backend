import pool from "../db/db.js";

//загружаем состояние проекта (редактируемые страницы) api/edit/95160109/content
export const loadPages = async (req, res) => {
  const userId = req.user.user_id || null;
  const guestId = req.guestId || null;

  const projectId = req.params.projectId;

  if (!userId && !guestId) {
    return res
      .status(404)
      .json({ error: "Ошибка авторизации, нет userId или guestId" });
  }

  //Смотрим, есть ли уже страницы данного проекта
  const resultPages = await pool.query(
    `SELECT pages.*, p.user_id, p.guest_id FROM pages
    LEFT JOIN projects as p ON pages.project_id = p.id
    LEFT JOIN editable_pictures ON editable_pictures.page_id = pages.id
    LEFT JOIN editable_texts ON editable_texts.page_id = pages.id
    WHERE (pages.project_id = $1)`,
    [projectId]
  );

  console.log(resultPages.rows);

  //Если нет, то берем заготовку из product_template definition
  if (!resultPages.rows[0]) {
    const result = await pool.query(
      `SELECT p.*, pr_t.* FROM projects as p 
    LEFT JOIN products as pr ON p.product_id = pr.id
    LEFT JOIN product_templates as pr_t ON pr.id = pr_t.product_id
    WHERE (p.id = $1)`,
      [projectId]
    );

    if (
      !result.rows[0] ||
      !result.rows[0].definition ||
      !result.rows[0].definition.pages
    ) {
      return res
        .status(404)
        .json({ error: "Не удалось загрузить шаблон проекта" });
    }

    const formatedPages = result.rows[0].definition.pages.map((p) => {
      return {
        key: p.key,
        color_key: p.color_key,
        page_definition_key: p.page_definition_key,
        filter_type_key: p.filter_type_key,
      };
    });

    //и добавляем в страницы для дальнейшей работы
    await pool.query(`INSERT INTO pages (project_id, pages) VALUES($1, $2)`, [
      projectId,
      JSON.stringify(formatedPages),
    ]);

    //дописать работу с editable_texts и pictures

    /* await pool.query(`INSERT INTO editable_pictures ()`) */

    const formatedContent = result.rows.map((p) => {
      return {
        id: p.id,
        definition: p.definition,
        definition_version: p.definition_version,
        status: p.status,
      };
    });
    return res.status(200).json({ response: formatedContent });
  }

  //если страницы есть, проверяем владельца.
  if (
    resultPages.rows[0].user_id !== userId &&
    resultPages.rows[0].guest_id !== guestId
  ) {
    return res.status(404).json({ error: "Ошибка авторизации" });
  } else {
    return res.status(200).json({ response: resultPages.rows });
  }
};

export const savePages = async (req, res) => {};

export const loadTemplate = async (req, res) => {};
