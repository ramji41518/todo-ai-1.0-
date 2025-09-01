import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";
import {
  updateProfile,
  uploadMiddleware,
} from "../controllers/userController.js";

router.put("/profile", auth, uploadMiddleware, updateProfile);

export default router;
