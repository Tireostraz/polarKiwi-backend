import bcrypt from "bcryptjs";
import pool from "../db/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const result = await pool.query(
            `INSERT INTO users (email, username, password, user_type_id) VALUES ($1, $2, $3, $4) RETURNING user_id`,
            [req.body.email, req.body.name, hashedPassword, req.body.user_type_id || 0]
        );

        const payload = { user_id: result.rows[0].id, user_type_id: req.body.user_type_id || 0};
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.status(201).json({ token });        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера ', detail: err.detail });
        
    }
};

export const login = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM users WHERE email= $1`, [req.body.email]);

        if (result.rows.length === 0){
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (!passwordMatch){
            return res.status(400).json({ error: 'Введён неверный пароль' });
        }

        const payload = {user_id:  user.user_id, user_type_id: user.user_type_id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера', detail: err.detail});
    }
};