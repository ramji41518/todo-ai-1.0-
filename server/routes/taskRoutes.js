import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";
import {
  createTask,
  listTasksByCollection,
  togglePriority,
  toggleDone,
  deleteTask,
} from "../controllers/taskController.js";

router.post("/", auth, createTask);
router.get("/by-collection/:collectionId", auth, listTasksByCollection);
router.patch("/:taskId/toggle-priority", auth, togglePriority);
router.patch("/:taskId/toggle-done", auth, toggleDone);
router.delete("/:taskId", auth, deleteTask);

export default router;
