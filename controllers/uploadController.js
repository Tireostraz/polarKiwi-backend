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

    const processedDir = path.join("uploads", `${userId}`, "processed");
    await fs.mkdir(processedDir, { recursive: true });

    const outName = req.file.filename.replace(/\.\w+$/, ".jpg");
    const outPath = path.join(processedDir, outName);
    const fileUrl = `${process.env.API_PUBLIC_URL}/images/${userId}/${outName}`;
    console.log(fileUrl);

    // конвертация/нормализация → JPEG
    const { width, height } = await sharp(req.file.path)
      .rotate()
      .jpeg({ quality: 85 })
      .toFile(outPath);

    // отвечаем фронту
    res.json({ filename: outName, url: fileUrl, width, height });
    /* res.json({
      filename: outName,
      url: `/images/${userId}/${outName}`,
      width,
      height,
    }); */
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

/**
 * GET /uploader/images
 * Возвращаем список обработанных картинок пользователя
 */
export const getUserImages = async (req, res) => {
  const userId = req.user.user_id;
  const dir = path.join("uploads", `${userId}`, "processed");
  try {
    const files = await fs.readdir(dir);
    const list = files.map((f) => ({
      filename: f,
      url: `${process.env.API_PUBLIC_URL}/images/${userId}/${f}`,
    }));
    res.json(list);
  } catch {
    res.json([]); // папки ещё нет
  }
};

/**
 * GET /images/:userId/:file  (используем в uploadRouter)
 */
export const sendImage = (req, res) => {
  const { userId, file } = req.params;
  if (String(req.user.user_id) !== userId) return res.sendStatus(403);

  const filePath = path.resolve("uploads", userId, "processed", file);
  res.sendFile(filePath, (err) => {
    if (err) res.sendStatus(404);
  });
};
