import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";
import {
  createCollection,
  listCollections,
  deleteCollection,
} from "../controllers/collectionController.js";

router.post("/", auth, createCollection);
router.get("/", auth, listCollections);
router.delete("/:id", auth, deleteCollection);

export default router;
