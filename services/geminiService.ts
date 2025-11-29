// services/geminiService.ts
// Gemini-г ашиглахгүй, бүхнийг OpenAI chatService руу дамжуулна.

import { sendChat } from "./chatService";

type Message = { role: string; content: string };

// Гол chat
export async function chatWithGemini(messages: Message[]) {
  return sendChat(messages);
}

// Persona-д ашиглагддаг wrapper
export async function generatePersonaUpdate(messages: Message[]) {
  return chatWithGemini(messages);
}

// 👉 TranslateView.tsx энэ функцийг импортлож байгаа
export async function detectLanguage(text: string): Promise<string> {
  // Одоохондоо хэл илрүүлэхгүй, зүгээр "mn" буцаая
  return "mn";
}

// 👉 TranslateView.tsx энэ функцийг ч импортолж байгаа
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  // Одоохондоо жинхэнэ орчуулга хийхгүй, зүгээр оригинал текстээ буцаана
  return text;
}

// Хэрэв өөр газар ашиглаж байвал нийцүүлээд хадгалъя
export async function translateWithGemini(text: string): Promise<string> {
  return text;
}
