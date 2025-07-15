import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  loadPages,
  loadTemplate,
  savePages,
} from "../controllers/editorController.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/:projectId/content", loadPages);

router.put("/:projectId/content", savePages);

router.get("/:projectId/template", loadTemplate);

export default router;
