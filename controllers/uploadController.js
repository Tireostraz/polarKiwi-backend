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
    const userId = req.user?.user_id || null;
    const guestId = req.guestId || null;

    const projectId = req.query.projectId;
    if (!projectId)
      return res.status(400).json({ message: "projectId required" });

    const ownerId = userId || guestId;
    if (!ownerId)
      return res.status(400).json({ message: "userId or guestId required" });

    const processedDir = path.join(
      "uploads",
      `${ownerId}`,
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
    const fileUrl = `${baseUrl}/${ownerId}/${projectId}/${outName}`;

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
  const userId = req.user?.user_id || null;
  const guestId = req.guestId || null;

  const projectId = req.query.projectId;
  const ownerId = userId || guestId;

  if (!ownerId || !projectId)
    return res.status(400).json({ message: "projectId required" });

  const dir = path.join("uploads", `${ownerId}`, `${projectId}`, "processed");
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
/*
export const sendImage = (req, res) => {
  const { userId, projectId, file } = req.params;
  const token = req.cookies.accessToken;
  const guestId = req.headers["x-guest-id"];

  // Если userId — это guestId (UUID) и совпадает с заголовком, пускаем
  if (guestId && guestId === userId) {
    const filePath = path.resolve(
      "uploads",
      userId,
      projectId,
      "processed",
      file
    );
    return res.sendFile(filePath, (err) => {
      if (err) res.sendStatus(404);
    });
  }

  // Если нет токена и не совпадает guestId — запрещаем
  if (!token) {
    return res.status(401).json({ message: "Токен отсутствует" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id !== userId) {
      return res.sendStatus(403);
    }

    const filePath = path.resolve(
      "uploads",
      userId,
      projectId,
      "processed",
      file
    );
    return res.sendFile(filePath, (err) => {
      if (err) res.sendStatus(404);
    });
  } catch (err) {
    return res.status(401).json({ message: "Неверный или просроченный токен" });
  }
};
*/

export const sendImage = (req, res) => {
  const { userId, projectId, file } = req.params;
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
