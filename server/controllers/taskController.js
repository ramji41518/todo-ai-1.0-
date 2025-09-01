import Task from "../models/Task.js";
import Collection from "../models/Collection.js";
import User from "../models/User.js";
import Subtask from "../models/Subtask.js"; // NEW
import {
  recomputeTaskDoneAndMaybeAward,
  maybeAwardForHighCompletion,
} from "./subtasksController.js"; // reuse helpers

export async function createTask(req, res, next) {
  try {
    const { collectionId, content, priority } = req.body;
    if (!(collectionId && content))
      return res.status(400).json({ message: "Missing fields" });

    const owner = await Collection.findOne({
      _id: collectionId,
      userId: req.user.id,
    });
    if (!owner) return res.status(403).json({ message: "Forbidden" });

    const task = await Task.create({
      collectionId,
      content,
      priority: priority === "high" ? "high" : "low",
      // keep your model's default isDone (recommend false)
    });

    if (task.priority === "high") {
      owner.highVersion = (owner.highVersion || 0) + 1;
      await owner.save();
    }

    await Collection.findByIdAndUpdate(collectionId, {
      $push: { tasks: task._id },
    });
    res.status(201).json({ task });
  } catch (e) {
    next(e);
  }
}

export async function listTasksByCollection(req, res, next) {
  try {
    const { collectionId } = req.params;
    const owner = await Collection.findOne({
      _id: collectionId,
      userId: req.user.id,
    });
    if (!owner) return res.status(403).json({ message: "Forbidden" });

    const tasks = await Task.find({ collectionId }).lean();
    tasks.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority === "high" ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    res.json({ tasks });
  } catch (e) {
    next(e);
  }
}

export async function togglePriority(req, res, next) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Not found" });

    const col = await Collection.findOne({
      _id: task.collectionId,
      userId: req.user.id,
    });
    if (!col) return res.status(403).json({ message: "Forbidden" });

    const wasHigh = task.priority === "high";
    task.priority = wasHigh ? "low" : "high";
    const nowHigh = task.priority === "high";

    if (!wasHigh && nowHigh) {
      col.highVersion = (col.highVersion || 0) + 1;
      await col.save();
    } else if (wasHigh && !nowHigh) {
      await maybeAwardForHighCompletion({
        userId: req.user.id,
        collectionId: task.collectionId,
      });
    }

    await task.save();
    res.json({ task });
  } catch (e) {
    next(e);
  }
}

export async function toggleDone(req, res, next) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Not found" });

    const col = await Collection.findOne({
      _id: task.collectionId,
      userId: req.user.id,
    });
    if (!col) return res.status(403).json({ message: "Forbidden" });

    const subCount = await Subtask.countDocuments({ taskId: task._id });
    if (subCount > 0) {
      // Cascade to all subtasks
      const nextIsDone = !task.isDone;
      await Subtask.updateMany(
        { taskId: task._id },
        { $set: { isDone: nextIsDone } }
      );
      task.isDone = nextIsDone;
      await task.save();
      if (task.priority === "high") {
        await maybeAwardForHighCompletion({
          userId: req.user.id,
          collectionId: task.collectionId,
        });
      }
      return res.json({ task });
    }

    // No subtasks: behave as before
    task.isDone = !task.isDone;
    if (task.priority === "high") {
      await maybeAwardForHighCompletion({
        userId: req.user.id,
        collectionId: task.collectionId,
      });
    }
    await task.save();
    res.json({ task });
  } catch (e) {
    next(e);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Not found" });

    const col = await Collection.findOne({
      _id: task.collectionId,
      userId: req.user.id,
    });
    if (!col) return res.status(403).json({ message: "Forbidden" });

    await Subtask.deleteMany({ taskId: task._id }); // delete subtasks
    await Task.deleteOne({ _id: taskId });
    await Collection.findByIdAndUpdate(task.collectionId, {
      $pull: { tasks: taskId },
    });

    if (task.priority === "high") {
      await maybeAwardForHighCompletion({
        userId: req.user.id,
        collectionId: task.collectionId,
      });
    }
    res.json({ message: "Task deleted" });
  } catch (e) {
    next(e);
  }
}
