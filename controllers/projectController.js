import pool from "../db/db.js";
import fs from "fs/promises";
import path from "path";

/* Получить все проекты пользователя */
export const getProjects = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;

    const result = await pool.query(
      `SELECT * FROM projects WHERE (user_id = $1 OR guest_id = $2) ORDER BY updated_at DESC`,
      [userId, guestId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Ошибка при получении проектов" });
  }
};

/* Получить id всех проектов в работе/в корзине*/
export const getProjectsIds = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;

    let resultInCart, resultDraft;

    if (userId) {
      resultInCart = await pool.query(
        `SELECT id, quantity FROM projects WHERE user_id = $1 AND status = 'in_cart' ORDER BY updated_at DESC`,
        [userId]
      );
      resultDraft = await pool.query(
        `SELECT id, quantity FROM projects WHERE user_id = $1 AND status = 'draft' ORDER BY updated_at DESC`,
        [userId]
      );
    } else if (guestId) {
      resultInCart = await pool.query(
        `SELECT id, quantity FROM projects WHERE guest_id = $1 AND status = 'in_cart' ORDER BY updated_at DESC`,
        [guestId]
      );
      resultDraft = await pool.query(
        `SELECT id, quantity FROM projects WHERE guest_id = $1 AND status = 'draft' ORDER BY updated_at DESC`,
        [guestId]
      );
    } else {
      return res.status(401).json({ error: "Не найден userId или guestId" });
    }

    res.status(200).json({
      response: {
        cart_projects: resultInCart.rows,
        draft_projects: resultDraft.rows,
      },
    });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Ошибка при получении проектов" });
  }
};

/* Получить один проект */
export const getProjectById = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND (user_id = $2 OR guest_id = $3)",
      [id, userId, guestId]
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
    const id = crypto.randomUUID();
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;

    const {
      title,
      type,
      format,
      product_id,
      pages_quantity,
      status = "draft",
      photos = [],
    } = req.body;

    const pages = Array.from({ length: pages_quantity }, () => ({
      id: crypto.randomUUID(),
      layout: null,
      elements: [],
      textBlocks: [],
    }));

    const result = await pool.query(
      `INSERT INTO projects 
        (id, user_id, guest_id, title, type, format, product_id, status, pages, photos)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
        userId,
        guestId,
        title,
        type,
        format,
        product_id,
        status,
        JSON.stringify(pages),
        JSON.stringify(photos),
      ]
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
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;

    const { id } = req.params;
    const { title, type, format, product_id, status, pages, photos } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET title = $1,
           type = $2,
           format = $3,
           product_id = $4,
           status = $5,
           pages = $6,
           photos = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND (user_id = $9 OR guest_id = $10)
       RETURNING *`,
      [
        title,
        type,
        format,
        product_id,
        status,
        JSON.stringify(pages),
        JSON.stringify(photos),
        id,
        userId,
        guestId,
      ]
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
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;

    const { id: projectId } = req.params;

    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 AND (user_id = $2 OR guest_id = $3) RETURNING *",
      [projectId, userId, guestId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Проект не найден или нет доступа" });
    }

    const ownerId = userId || guestId;

    const projectDir = path.resolve("uploads", `${ownerId}`, projectId);

    try {
      await fs.rm(projectDir, { recursive: true, force: true });
    } catch (err) {
      console.warn("Ошибка удаления проекта", err);
    }

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Ошибка при удалении проекта" });
  }
};

// Дублировать проект
export const duplicateProject = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;
    const { id: oldProjectId } = req.params;

    const result = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND (user_id = $2 OR guest_id = $3)",
      [oldProjectId, userId, guestId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Проект не найден или нет доступа" });
    }

    const original = result.rows[0];

    const newProjectId = crypto.randomUUID();
    const newTitle = original.title + " (копия)";
    const newPages = (original.pages || "[]").map((page) => ({
      ...page,
      id: crypto.randomUUID(),
    }));

    const copyDir = async (from, to) => {
      try {
        await fs.mkdir(to, { recursive: true });
        const files = await fs.readdir(from);
        for (const file of files) {
          await fs.copyFile(path.join(from, file), path.join(to, file));
        }
      } catch (err) {
        if (err.code !== "ENOENT") throw err;
      }
    };

    const ownerId = userId || guestId;
    const baseUploads = path.resolve("uploads", `${ownerId}`);
    const oldOriginal = path.join(baseUploads, oldProjectId, "original");
    const newOriginal = path.join(baseUploads, newProjectId, "original");
    const oldProcessed = path.join(baseUploads, oldProjectId, "processed");
    const newProcessed = path.join(baseUploads, newProjectId, "processed");

    await copyDir(oldOriginal, newOriginal);
    await copyDir(oldProcessed, newProcessed);

    // Обновляем ссылки в photos
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "/api/images"
        : "http://127.0.0.1:3001/images";

    const newPhotos = (original.photos || "[]").map((photo) => {
      const filename = photo.url.split("/").pop();
      return {
        ...photo,
        id: crypto.randomUUID(),
        url: `${baseUrl}/${ownerId}/${newProjectId}/${filename}`,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    const insertResult = await pool.query(
      `INSERT INTO projects 
      (id, user_id, guest_id, title, type, format, product_id, status, pages, photos) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [
        newProjectId,
        userId,
        guestId,
        newTitle,
        original.type,
        original.format,
        original.product_id,
        "draft",
        JSON.stringify(newPages),
        JSON.stringify(newPhotos),
      ]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error("Ошибка при дублировании проекта", err);
    res.status(500).json({ error: "Ошибка при дублировании проекта" });
  }
};
