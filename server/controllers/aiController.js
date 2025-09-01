import User from "../models/User.js";
import { generateChatReply } from "../utils/aiProvider.js";

const COST_PER_CHAT = 1;

export const chat = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (!messages.length)
    return res.status(400).json({ message: "messages required" });

  if ((user.credits ?? 0) <= 0) {
    return res.status(402).json({ message: "No credits left." });
  }

  try {
    // 1) Call provider
    const reply = await generateChatReply(messages);

    // 2) Only on success, deduct 1 credit
    user.credits = Math.max(0, (user.credits || 0) - COST_PER_CHAT);
    await user.save();

    return res.json({ reply, credits: user.credits });
  } catch (err) {
    // Gemini errors often include HTTP-ish status on err.status or err.response?.status
    const status = err?.status || err?.response?.status || 500;

    if (status === 429) {
      // rate/quota
      return res
        .status(503)
        .json({
          message:
            "AI is temporarily unavailable due to provider limits. Please try again soon.",
        });
    }

    console.error("[AI error]", err);
    return res
      .status(500)
      .json({ message: "AI error. Please try again later." });
  }
};
