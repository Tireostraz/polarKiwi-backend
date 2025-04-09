import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import swaggerDocs from "./utils/swagger.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ], // Разрешаем только эти адреса
    methods: ["GET", "POST"], // Разрешаем только нужные методы
    allowedHeaders: ["Content-Type", "Authorization"], // Разрешённые заголовки
  })
);

app.use(cookieParser());
app.use(express.json()); // Для работы с JSON

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

swaggerDocs(app);

app.listen(PORT, () =>
  console.log(`Server has been started and runing on port ${PORT}...`)
);
