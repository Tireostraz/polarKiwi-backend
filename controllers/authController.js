import bcrypt from "bcryptjs";
import pool from "../db/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req, res) =>{
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера ', detail: error.detail });
        
    }
}