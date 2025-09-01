import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";
import { register, login, logout, me } from "../controllers/authController.js";

router.post("/register", register);
router.post("/login", login);
router.post("/logout", auth, logout);
router.get("/me", auth, me);

export default router;
