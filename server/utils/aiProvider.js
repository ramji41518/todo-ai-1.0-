import { GoogleGenerativeAI } from "@google/generative-ai";

let model = null;

function getModel() {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is missing. Add it to your .env and restart the server."
      );
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    // Fast + cheap; switch to "gemini-1.5-pro" if you need stronger reasoning
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
  return model;
}

/**
 * messages: [{ role: 'system'|'user'|'assistant', content: string }]
 * We flatten the chat to a single prompt string while keeping roles for context.
 */
export async function generateChatReply(messages) {
  const mdl = getModel();
  const prompt = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const result = await mdl.generateContent(prompt);
  const text = result?.response?.text?.();
  if (!text) throw new Error("No text returned from Gemini");
  return text.trim();
}
