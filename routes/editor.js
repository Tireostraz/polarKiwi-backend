import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { loadPages, loadTemplate } from "../controllers/editorController.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/:projectId/content", loadPages);

router.get("/:projectId/template", loadTemplate);

export default router;
