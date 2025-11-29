// services/geminiService.ts
// Gemini-г бүр ашиглахгүй, OpenAI chatService руу дамжуулна.

import { sendChat } from "./chatService";

export async function chatWithGemini(messages: { role: string; content: string }[]) {
  return sendChat(messages);
}

export async function translateWithGemini(text: string): Promise<string> {
  return text; // түр орчуулга байхгүй
}
