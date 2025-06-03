import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

/**
 * POST /uploader/upload
 * req.file уже лежит в uploads/<id>/original/…
 */
export const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Файл не загружен" });

  try {
    const userId = req.user.user_id;
    const projectId = req.query.projectId;
    if (!projectId)
      return res.status(400).json({ message: "projectId required" });

    const processedDir = path.join(
      "uploads",
      `${userId}`,
      `${projectId}`,
      "processed"
    );
    await fs.mkdir(processedDir, { recursive: true });

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "/api/images"
        : "http://127.0.0.1:3001/images";

    const outName = req.file.filename.replace(/\.\w+$/, ".jpg");
    const outPath = path.join(processedDir, outName);
    const fileUrl = `${baseUrl}/${userId}/${projectId}/${outName}`;

    // конвертация/нормализация → JPEG
    const { width, height } = await sharp(req.file.path)
      .rotate()
      .jpeg({ quality: 85 })
      .toFile(outPath);

    // отвечаем фронту
    res.json({ filename: outName, url: fileUrl, width, height });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

/**
 * GET /uploader/images
 * Возвращаем список обработанных картинок пользователя
 * возможно не работает, надо проверять (в данный момент запрос картинок не нужен - всё идёт из projects)
 */
export const getUserImages = async (req, res) => {
  const userId = req.user.user_id;
  const projectId = req.query.projectId;

  const dir = path.join("uploads", `${userId}`, `${projectId}`, "processed");
  try {
    const files = await fs.readdir(dir);
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "/api/images"
        : "http://127.0.0.1:3001/images";

    const list = files.map((f) => ({
      filename: f,
      url: `${baseUrl}/${userId}/${projectId}/${f}`,
    }));
    res.json(list);
  } catch {
    res.json([]); // папки ещё нет
  }
};

/**
 * GET /images/:userId/:file  (используем в uploadRouter)
 * здесь отдаем пользователю изображение
 */
export const sendImage = (req, res) => {
  const { userId, projectId, file } = req.params;
  if (String(req.user.user_id) !== userId) return res.sendStatus(403);

  console.log("image got");

  const filePath = path.resolve(
    "uploads",
    userId,
    projectId,
    "processed",
    file
  );
  res.sendFile(filePath, (err) => {
    if (err) res.sendStatus(404);
  });
};
