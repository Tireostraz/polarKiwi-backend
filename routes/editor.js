import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { loadPages } from "../controllers/editorController.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/:projectId/content", loadPages);

export default router;
