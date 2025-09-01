import multer, { memoryStorage } from "multer";
import { createReadStream } from "streamifier";
import cloudinary from "../utils/cloudinary.js";
import User from "../models/User.js";

const upload = multer({ storage: memoryStorage() });
export const uploadMiddleware = upload.single("image");

export async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    const updates = {};
    if (name) updates.name = name;

    if (req.file) {
      const buffer = req.file.buffer;

      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "todo-ai-profile" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          createReadStream(buffer).pipe(stream);
        });

      const result = await streamUpload();
      updates.profileImage = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).lean();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        isSubscribed: user.isSubscribed,
        credits: user.credits,
      },
    });
  } catch (e) {
    next(e);
  }
}
