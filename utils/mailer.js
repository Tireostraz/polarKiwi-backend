import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "connect.smtp.bz",
  port: 587,
  secure: false, // true для 465, false для 587
  auth: {
    user: process.env.SMTP_USER, // логин от smtp.bz
    pass: process.env.SMTP_PASS, // пароль от smtp.bz
  },
});

export default transporter;
