import Collection from "../models/Collection.js";
import Task from "../models/Task.js";

export async function createCollection(req, res, next) {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ message: "Collection name required" });

    const col = await Collection.create({
      name,
      userId: req.user.id,
      tasks: [],
    });

    res.status(201).json({ collection: col });
  } catch (e) {
    next(e);
  }
}

export async function listCollections(req, res, next) {
  try {
    const cols = await Collection.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ collections: cols });
  } catch (e) {
    next(e);
  }
}

export async function deleteCollection(req, res, next) {
  try {
    const { id } = req.params;
    const col = await Collection.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });
    if (!col) return res.status(404).json({ message: "Not found" });

    await Task.deleteMany({ collectionId: id });
    res.json({ message: "Collection & its tasks deleted" });
  } catch (e) {
    next(e);
  }
}
