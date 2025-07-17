import pool from "../db/db.js";
import fs from "fs/promises";
import path from "path";

/* Создать новый проект POST /api/projects*/
export const createProject = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;

    const productSlug = req.body.product_slug;
    const resultProduct = await pool.query(
      "SELECT p.id, p.title, p.subtitle, p.image_url, p.price, p.slug, pr_c.* FROM products as p LEFT JOIN product_configs as pr_c ON (p.id = pr_c.product_id) WHERE (p.slug = $1)",
      [productSlug]
    );

    const product = resultProduct.rows[0];

    if (!product) {
      return res.status(404).json({ error: "Продукт не найден" });
    }

    const now = new Date();
    const monthToAdd = 6; //TODO хардкод через сколько будет expired_at. Вынести куда-то?
    const expired_at = new Date(now.setMonth(now.getMonth() + monthToAdd));

    let ownerColumn, ownerId;

    if (userId) {
      ownerColumn = "user_id";
      ownerId = userId;
    } else if (guestId) {
      ownerColumn = "guest_id";
      ownerId = guestId;
    } else {
      return res
        .status(401)
        .json({ error: "Ошибка авторизации. Нет ни guestId ни userId" });
    }

    await pool.query(
      `INSERT INTO projects (${ownerColumn}, product_id, title, subtitle, image_url, expired_at) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        ownerId,
        product.id,
        product.title,
        product.subtitle,
        product.image_url,
        expired_at,
      ]
    );

    return res.status(201).json({ response: { message: "Project created" } });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Ошибка при создании проекта" });
  }
};

/* Получить все проекты пользователя */
export const getProjects = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;

    const result = await pool.query(
      `SELECT * FROM projects WHERE ((user_id = $1 OR guest_id = $2) AND deleted_at IS NULL) ORDER BY updated_at DESC`,
      [userId, guestId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Ошибка при получении проектов" });
  }
};

// Получить id всех проектов в работе/в корзине  /api/projects/ids
export const getProjectsIds = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;

    let resultInCart, resultDraft;

    if (userId) {
      resultInCart = await pool.query(
        `SELECT id, quantity FROM projects WHERE user_id = $1 AND status = 'in_cart' AND deleted_at IS NULL ORDER BY updated_at DESC`,
        [userId]
      );
      resultDraft = await pool.query(
        `SELECT id, quantity FROM projects WHERE user_id = $1 AND status = 'draft' AND deleted_at IS NULL ORDER BY updated_at DESC`,
        [userId]
      );
    } else if (guestId) {
      resultInCart = await pool.query(
        `SELECT id, quantity FROM projects WHERE guest_id = $1 AND status = 'in_cart' AND deleted_at IS NULL ORDER BY updated_at DESC`,
        [guestId]
      );
      resultDraft = await pool.query(
        `SELECT id, quantity FROM projects WHERE guest_id = $1 AND status = 'draft' AND deleted_at IS NULL ORDER BY updated_at DESC`,
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

//Получить все черновики /api/projects/drafts
export const draftProjects = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;

    const result = await pool.query(
      `SELECT p.*, pr.slug as product_slug, pr.price as product_price
      FROM projects p
      LEFT JOIN products pr ON p.product_id = pr.id
      WHERE (user_id = $1 OR guest_id = $2) AND p.deleted_at IS NULL`,
      [userId, guestId]
    );

    const formatedDrafts = result.rows.map((project) => {
      return {
        expired_at: project.expired_at,
        project: {
          id: project.id,
          title: project.title,
          subtitle: project.subtitle,
          image_url: project.image_url,
          total: project.total, //{для цены. добавить потом. "currency_code_3": "USD", "cents": 6500} пока будет в product,
          //is_in_cart: false, аналог - статус
          status: project.status,
          quantity: project.quantity,
          can_be_reordered: project.can_be_reordered,
          created_at: project.created_at,
          updated_at: project.updated_at,
          product: { slug: project.product_slug, price: project.product_price },
        },
      };
    });
    res.status(200).json({ response: { drafts: formatedDrafts } });
  } catch (e) {
    console.error("Ошибка запроса черновиков", e);
  }
};

/* Получить один проект */
export const getProjectById = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, pr.slug as product_slug, pr.is_out_of_stock, pr_c.*
      FROM projects as p
      LEFT JOIN products as pr ON p.product_id = pr.id
      LEFT JOIN product_configs as pr_c ON pr.id = pr_c.product_id
      WHERE p.id = $1 AND (p.user_id = $2 OR p.guest_id = $3) AND p.deleted_at IS NULL`,
      [id, userId, guestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Проект не найден" });
    }

    const formatedProject = result.rows.map((p) => {
      return {
        project: {
          id: p.id,
          title: p.title,
          subtitle: p.subtitle,
          image_url: p.image_url,
          total: p.total,
          status: p.status,
          quantity: p.quantity,
          can_be_reordered: p.can_be_reordered,
          created_at: p.created_at,
          updated_at: p.updated_at,
          product: {
            slug: p.product_slug,
            is_customizable_on_web_mobile: p.is_customizable_on_web_mobile,
            bypass_customization: p.bypass_customization,
            is_out_of_stock: p.is_out_of_stock,
            is_quantity_editable: p.is_quantity_editable,
          },
        },
        config: {
          min_page_count: p.min_page_count,
          max_page_count: p.max_page_count,
          page_increment_step: p.page_increment_step,
          page_increment_price: p.page_increment_price,
          display_title: p.display_title,
          display_format: p.display_format,
          display_page_name_singular: p.display_page_name_singular,
          display_page_name_plural: p.display_page_name_plural,
          min_column_count: p.min_column_count,
          max_column_count: p.max_column_count,
          is_zoom_out_enabled: p.is_zoom_out_enabled,
          should_start_with_gallery: p.should_start_with_gallery,
          dpi_thresholds: p.dpi_thresholds,
        },
        addons: [{}, {}],
      };
    });

    return res.status(200).json({ response: formatedProject });
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ error: "Ошибка при получении проекта" });
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
       WHERE id = $8 AND (user_id = $9 OR guest_id = $10) AND deleted_at IS NULL
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

    const projectId = req.params.projectId;

    try {
      const result = await pool.query(
        `SELECT * 
        FROM projects
        WHERE id = $1 AND (user_id = $2 OR guest_id = $3)`,
        [projectId, userId, guestId]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Проект не найден или нет доступа" });
      }
    } catch (e) {
      console.error("Ошибка запроса проекта для удаления", e);
      return res
        .status(500)
        .json({ responce: "Ошибка запроса при удалении проекта" });
    }

    await pool.query(
      `UPDATE projects
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1`,
      [projectId]
    );

    /* const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 AND (user_id = $2 OR guest_id = $3) RETURNING *",
      [projectId, userId, guestId]
    ); */

    /* const ownerId = userId || guestId;

    const projectDir = path.resolve("uploads", `${ownerId}`, projectId);

    try {
      await fs.rm(projectDir, { recursive: true, force: true });
    } catch (err) {
      console.warn("Ошибка удаления проекта", err);
    } */

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
