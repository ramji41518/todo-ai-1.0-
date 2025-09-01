import mongoose, { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    content: { type: String, required: true },
    isDone: { type: Boolean, default: false }, // per your spec
    priority: { type: String, enum: ["high", "low"], default: "low" },
  },
  { timestamps: true }
);

export default model("Task", taskSchema);
