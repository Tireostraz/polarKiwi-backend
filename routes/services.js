import express from "express";
import { verifyUserToken } from "../middleware/verifyUserToken.js";

const router = express.Router();

router.get('/services', verifyUserToken);

export default router;