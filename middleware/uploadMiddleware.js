import multer from "multer";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";
import mime from "mime-types";

export const upload = multer({
  storage: multer.diskStorage({
    destination(req, _file, cb) {
      const dir = path.join("uploads", `${req.user.user_id}`, "original");
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(_req, file, cb) {
      const ext = mime.extension(file.mimetype) || "jpg";
      cb(null, `${uuid()}.${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 }, // ≤ 15 MB
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("only images"), false);
    }
    cb(null, true);
  },
});
