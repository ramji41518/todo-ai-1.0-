import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    task: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],

    // award-cycle tracking for “all HIGH tasks done”
    highVersion: { type: Number, default: 0 },
    lastHighAwardedVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Collection", CollectionSchema);
