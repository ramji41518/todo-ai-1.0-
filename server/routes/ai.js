import { Router } from "express";
import { chat } from "../controllers/aiController.js";
import auth from "../middleware/auth.js"; // your existing auth

const router = Router();
router.post("/chat", auth, chat);

export default router;
