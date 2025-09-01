import Subtask from "../models/Subtask.js";
import Task from "../models/Task.js";
import Collection from "../models/Collection.js";
import User from "../models/User.js";

/** +5 credits when all HIGH tasks in a collection are complete (same rule you had) */
export async function maybeAwardForHighCompletion({ userId, collectionId }) {
  const [col, outstanding] = await Promise.all([
    Collection.findById(collectionId),
    Task.countDocuments({ collectionId, priority: "high", isDone: false }),
  ]);
  if (!col) return 0;

  if (
    outstanding === 0 &&
    (col.highVersion || 0) > (col.lastHighAwardedVersion || 0)
  ) {
    const u = await User.findById(userId);
    if (!u) return 0;
    u.credits = (u.credits || 0) + 5;
    await u.save();

    col.lastHighAwardedVersion = col.highVersion || 0;
    await col.save();
    return 5;
  }
  return 0;
}

/** Secure helper: ensure this task belongs to the user (via its collection) */
async function assertOwnership(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) return [null, null, { code: 404, message: "Task not found" }];
  const owner = await Collection.findOne({ _id: task.collectionId, userId });
  if (!owner) return [null, null, { code: 403, message: "Forbidden" }];
  return [task, owner, null];
}

/** Recompute task.isDone from subtasks (all done => true); award if needed */
export async function recomputeTaskDoneAndMaybeAward(task, userId) {
  const [total, done] = await Promise.all([
    Subtask.countDocuments({ taskId: task._id }),
    Subtask.countDocuments({ taskId: task._id, isDone: true }),
  ]);
  if (total > 0) {
    const wasDone = task.isDone;
    task.isDone = done === total;
    await task.save();

    if (task.priority === "high" && wasDone !== task.isDone) {
      await maybeAwardForHighCompletion({
        userId,
        collectionId: task.collectionId,
      });
    }
  }
}

/** Routes */
export async function listByTask(req, res, next) {
  try {
    const { taskId } = req.params;
    const [task, _owner, err] = await assertOwnership(taskId, req.user.id);
    if (err) return res.status(err.code).json({ message: err.message });
    const subtasks = await Subtask.find({ taskId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ subtasks });
  } catch (e) {
    next(e);
  }
}

export async function createSubtask(req, res, next) {
  try {
    const { taskId, content } = req.body;
    if (!(taskId && content && content.trim())) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const [task, _owner, err] = await assertOwnership(taskId, req.user.id);
    if (err) return res.status(err.code).json({ message: err.message });

    const subtask = await Subtask.create({
      taskId,
      content: content.trim(),
      isDone: false,
    });
    await recomputeTaskDoneAndMaybeAward(task, req.user.id);
    res.status(201).json({ subtask, task });
  } catch (e) {
    next(e);
  }
}

export async function toggleSubtaskDone(req, res, next) {
  try {
    const { subtaskId } = req.params;
    const s = await Subtask.findById(subtaskId);
    if (!s) return res.status(404).json({ message: "Not found" });

    const [task, _owner, err] = await assertOwnership(s.taskId, req.user.id);
    if (err) return res.status(err.code).json({ message: err.message });

    s.isDone = !s.isDone;
    await s.save();

    await recomputeTaskDoneAndMaybeAward(task, req.user.id);
    res.json({ subtask: s, task });
  } catch (e) {
    next(e);
  }
}

export async function deleteSubtask(req, res, next) {
  try {
    const { subtaskId } = req.params;
    const s = await Subtask.findById(subtaskId);
    if (!s) return res.status(404).json({ message: "Not found" });

    const [task, _owner, err] = await assertOwnership(s.taskId, req.user.id);
    if (err) return res.status(err.code).json({ message: err.message });

    await Subtask.deleteOne({ _id: subtaskId });
    await recomputeTaskDoneAndMaybeAward(task, req.user.id);
    res.json({ message: "Subtask deleted", task });
  } catch (e) {
    next(e);
  }
}
