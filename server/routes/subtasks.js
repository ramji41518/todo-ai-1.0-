import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  listByTask,
  createSubtask,
  toggleSubtaskDone,
  deleteSubtask,
} from "../controllers/subtasksController.js";

const r = Router();
r.use(auth);

r.get("/by-task/:taskId", listByTask);
r.post("/", createSubtask);
r.patch("/:subtaskId/toggle-done", toggleSubtaskDone);
r.delete("/:subtaskId", deleteSubtask);

export default r;
