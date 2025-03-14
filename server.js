import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import swaggerDocs from "./utils/swagger.js";
import cors from 'cors';


dotenv.config();
const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Разрешаем только эти адреса
    methods: ['GET', 'POST'], // Разрешаем только нужные методы
    allowedHeaders: ['Content-Type', 'Authorization'] // Разрешённые заголовки
}));

app.use(express.json()); // Для работы с JSON

app.use('/auth', authRoutes);


swaggerDocs(app);

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server has been started and runing on port ${PORT}...`));

