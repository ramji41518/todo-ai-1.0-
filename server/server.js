import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import collectionRouter from "./routes/collectionRoutes.js";
import taskRouter from "./routes/taskRoutes.js";

import aiRouter from "./routes/ai.js";

import { config } from "dotenv";
config();

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import subtasksRouter from "./routes/subtasks.js";

const app = express();

const allowed = [process.env.CLIENT_URL, "https://todo-ai-frontend.onrender.com"];
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowed.includes(origin)),
    credentials: true,
  })
);

app.use(json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => res.send("Todo-AI API running"));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/collections", collectionRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/subtasks", subtasksRouter);

app.use("/api/ai", aiRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
