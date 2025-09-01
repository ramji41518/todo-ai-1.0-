import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    content: { type: String, required: true, trim: true },
    isDone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Subtask", subtaskSchema);
