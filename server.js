import express from "express";
import authRoutes from "./routes/auth.js";
// import authRoutes from "./routes/auth.js";

const app = express();
app.use(express.json()); // Для работы с JSON

app.use('/auth', authRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server has been started and runing on port ${PORT}...`));

