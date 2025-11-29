// services/geminiService.ts
// Gemini-г бүр ашиглахгүй, OpenAI chatService руу дамжуулна.

import { sendChat } from "./chatService";

export async function chatWithGemini(
  messages: { role: string; content: string }[]
) {
  return sendChat(messages);
}

// ⬇️ НЭМЭХ ХЭСЭГ
export async function generatePersonaUpdate(
  messages: { role: string; content: string }[]
) {
  // persona update-г одоогоор шууд chat руу дамжуулж байна
  return chatWithGemini(messages);
}

export async function translateWithGemini(text: string): Promise<string> {
  return text; // түр орчуулга байхгүй
}
