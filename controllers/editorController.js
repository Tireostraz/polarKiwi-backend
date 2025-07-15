import pool from "../db/db.js";
import { DefinitionSchema } from "../validation/definitionSchemas.js";

//загружаем состояние проекта (редактируемые страницы) api/edit/95160109/content
export const loadPages = async (req, res) => {
  const userId = req.user.user_id || null;
  const guestId = req.guestId || null;

  const projectId = req.params.projectId;

  if (!userId && !guestId) {
    return res
      .status(401)
      .json({ error: "Ошибка авторизации. Требуется userId или guestId" });
  }

  let project;

  try {
    const projectResult = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId]
    );
    project = projectResult.rows[0];
  } catch (e) {
    console.error("Ошибка при запросе проекта:", e);
    return res
      .status(500)
      .json({ error: "Ошибка при получении проекта из БД" });
  }

  if (!project) {
    return res.status(404).json({ error: "Проект не найден" });
  }

  if (project.user_id !== userId && project.guest_id !== guestId) {
    return res.status(403).json({ error: "Нет доступа к проекту" });
  }

  //Смотрим, есть ли уже страницы данного проекта
  const pagesResult = await pool.query(
    "SELECT id, pages, print_quantities, used_photos FROM pages WHERE pages.project_id = $1",
    [projectId]
  );

  const pages = pagesResult.rows[0];

  //Если нет, то берем заготовку из product_template definition
  if (!pages) {
    const definitionResult = await pool.query(
      `SELECT p.*, pr_t.* FROM projects as p 
    LEFT JOIN products as pr ON p.product_id = pr.id
    LEFT JOIN product_templates as pr_t ON pr.id = pr_t.product_id
    WHERE (p.id = $1)`,
      [projectId]
    );

    //Генерируем id для pages
    const pagesId = crypto.randomUUID();

    const definitions = definitionResult.rows[0];
    console.log(definitions);

    if (!definitions || !definitions.pages) {
      return res
        .status(404)
        .json({ error: "Не удалось загрузить шаблон проекта" });
    }

    //Формируем из строк запроса definitions ответ требуемого формата
    const formatedDefinitions = {
      id: pagesId,
      definition: {
        definition_version: definitions.definition_version,
        //locale: definitions.locale, пока не нужно
        pages: definitions.pages,
        selection_photos: [],
        gallery_photos: [],
        template_type: definitions.template_type,
        definition_version: definitions.definition_version,
        status: definitions.status,
        template_id: definitions.id, //Просто id данного product_templates
      },
    };

    //Добавляем в formatedDefinitions массив объектов print_quantities если они есть в таблице product_templates (обычно только для template_type = prints)
    if (definitions.print_quantities) {
      formatedDefinitions.definition = {
        ...formatedDefinitions.definition,
        print_quantities: definitions.print_quantities,
      };
    }

    //Удаляем из объекта(ов) pages поля editable_pictures: [] и editable_texts: [] чтобы добавть в pages - pages
    const formatedPages = definitions.pages.map((p) => {
      return {
        key: p.key,
        color_key: p.color_key,
        page_definition_key: p.page_definition_key,
        filter_type_key: p.filter_type_key,
      };
    });

    //и добавляем в страницы для дальнейшей работы
    await pool.query(
      `INSERT INTO pages (id, project_id, pages, print_quantities) VALUES($1, $2, $3, $4)`,
      [
        pagesId,
        projectId,
        JSON.stringify(formatedPages),
        JSON.stringify(definitions.print_quantities),
      ]
    );

    //аналогично добавляем данные в конкретный project из product_templates (его id и дальше для совместимости обращаемся к product_template по его id)
    await pool.query(`UPDATE projects SET template_id = $1 WHERE id = $2`, [
      definitions.id,
      projectId,
    ]);

    return res.status(200).json({ response: formatedDefinitions });
  }

  //Иначе если есть страницы pages

  const templateResult = await pool.query(
    "SELECT * FROM product_templates WHERE id = $1",
    [project.template_id]
  );

  const template = templateResult.rows[0];
  //console.log("project", project);
  //console.log("template by id", templateResult.rows);

  //Ищем все editable_pictures, editable_texts, videos (потом если нужно будет)
  const picturesResult = await pool.query(
    "SELECT * FROM editable_pictures WHERE page_id = $1",
    [pages.id]
  );

  const textsResult = await pool.query(
    "SELECT * FROM editable_texts WHERE page_id = $1",
    [pages.id]
  );

  /* console.log("pictures: ", picturesResult.rows);
  console.log("texts: ", textsResult.rows);
  console.log("pages:", pages); */
  pages.pages = pages.pages.map((page) => {
    return {
      ...page,
      editable_pictures: picturesResult.rows,
      editable_texts: textsResult.rows,
    };
  });

  const formatedDefinitions = {
    id: pages.id,
    definition: {
      definition_version: template.definition_version,
      //locale: definitions.locale, пока не нужно
      pages: pages.pages,
      used_photos: pages.used_photos,
      //gallery_photos: [], TODO исправить. Далее если используем это
      template_type: template.template_type,
      definition_version: template.definition_version,
      status: project.status,
      template_id: template.id,
    },
  };

  //Добавляем к ответу print_quantities если есть
  if (pages.print_quantities) {
    formatedDefinitions.definition = {
      ...formatedDefinitions.definition,
      print_quantities: pages.print_quantities,
    };
  }

  res.status(200).json({ response: formatedDefinitions });
};

//Запрос шаблона проекта 3.0/customizations/{{projectId}}/template
export const loadTemplate = async (req, res) => {
  const userId = req.user.user_id || null;
  const guestId = req.guestId || null;
  const projectId = req.params.projectId;

  if (!userId && !guestId) {
    return res
      .status(401)
      .json({ error: "Ошибка авторизации. Требуется userId или guestId" });
  }

  let project;

  //Запрос проекта по его id
  try {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [
      projectId,
    ]);
    project = result.rows[0];
  } catch (e) {
    console.error("Ошибка получения проектов", e);
    return res.status(500).json({ error: "Ошибка при получении проектов" });
  }

  if (!project) {
    return res.status(404).json({ error: "Данного проекта не существует" });
  }

  let template;

  //Запрос шаблона по template_id из projects
  try {
    const result = await pool.query(
      "SELECT * FROM product_templates WHERE id = $1",
      [project.template_id]
    );
    template = result.rows[0];
  } catch (e) {
    console.error("Ошибка при получении шаблона проекта из БД", e);
    return res
      .status(500)
      .json({ error: "Ошибка при получении шаблона проекта из БД" });
  }

  let template_pages;

  //Запрос template_pages по product_templates id
  try {
    const result = await pool.query(
      "SELECT category_key, filter_type_keys, height_dmm, width_dmm, key, type, color_keys, elements FROM template_pages WHERE template_id = $1",
      [template.id]
    );
    template_pages = result.rows;
  } catch (e) {
    console.error("Ошибка получения шаблонов страниц из БД", e);
  }

  //Формирование массива ключей color_keys и font_keys для дальнейшего запроса цветовых схем и шрифтов

  const formatedTemplate = {
    id: template.id,
    definition: {
      page_configuration: {
        filter_type_definitions: template.filter_type_definitions,
        force_pack_color: template.force_pack_color,
        link_in_content: template.link_in_content,
        increment: template.increment,
        forced_layouts_filter_type_keys:
          template.forced_layouts_filter_type_keys,
        next_filter_type_keys: template.next_filter_type_keys,
      },
      definition_version: template.definition_version,
      min_dpi: template.min_dpi,
      template_type: template.template_type,
      asset_definitions: template.asset_definitions,
      category_definitions: template.category_definitions,
      color_definitions: template.color_definitions,
      font_definitions: template.font_definitions,
      option_definitions: template.option_definitions,
      page_definitions: template_pages,
      presentation_definitions: template.presentation_definitions,
      shape_definitions: template.shape_definitions,
      tag_definitions: template.tag_definitions,
    },
  };

  res.status(200).json({ response: formatedTemplate });
};

export const savePages = async (req, res) => {
  const userId = req.user.user_id || null;
  const guestId = req.guestId || null;

  const projectId = req.params.projectId;

  let project;

  //Запрос проекта по id
  try {
    const response = await pool.query("SELECT * FROM projects WHERE id = $1", [
      projectId,
    ]);
    project = response.rows[0];
  } catch (e) {
    console.error("Ошибка при запросе проекта", e);
    return res.status(500).json({ error: "Ошибка при запросе проекта" });
  }

  if (!project) {
    return res.status(404).json({ error: "Проект не найден" });
  }

  if (userId !== project.user_id && guestId !== project.guestId) {
    console.error("Ошибка авторизации. Требуется guestId или userId");
    return res.status(403).json({ error: "Ошибка авторизации" });
  }

  let page;

  //Запрос pages по project_id
  try {
    const response = await pool.query(
      "SELECT * FROM pages WHERE project_id = $1",
      [projectId]
    );
    page = response.rows[0];
  } catch (e) {
    console.error("Ошибка при запросе pages");
    return res.status(500).json({ error: "Ошибка при запросе pages" });
  }

  if (!page) {
    console.error(
      "Требуется наличие page в таблице pages перед сохранением состояния проекта"
    );
    return res.status(404).json({
      error:
        "Требуется наличие page в таблице pages перед сохранением состояния проекта",
    });
  }

  /* console.log("Pages:", req.body.definition.pages);
  console.log("Used_photos:", req.body.definition.used_photos); */

  let validatedDefinition;
  try {
    validatedDefinition = DefinitionSchema.parse(req.body.definition);
  } catch (e) {
    console.error("Ошибка валидации definition", e);
    return res
      .status(400)
      .json({ error: "Некорректный формат данных", details: e.errors });
  }

  //Добавляем в таблицу pages новое полученное состояние проекта.
  try {
    await pool.query(
      "UPDATE pages SET pages = $1, used_photos = $2, print_quantities = $3 WHERE id = $4",
      [
        JSON.stringify(validatedDefinition.pages),
        JSON.stringify(validatedDefinition.used_photos),
        JSON.stringify(validatedDefinition.print_quantities),
        page.id,
      ]
    );
  } catch (e) {
    console.error("Ошибка добавляения данных в pages", e);
    return res.status(500).json({ error: "Ошибка добавления данных в pages" });
  }

  //Для проверки запрашиваем новые значения что добавили

  let newPage;
  try {
    const response = await pool.query("SELECT * FROM pages WHERE id=$1", [
      page.id,
    ]);
    newPage = response.rows[0];
  } catch (e) {
    console.error("Ошибка при получении нового значения pages", e);
    return res
      .status(500)
      .json({ error: "Ошибка при получении нового значения pages" });
  }

  res.status(200).json({ response: newPage });
};
