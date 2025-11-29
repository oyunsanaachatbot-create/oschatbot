// services/geminiService.ts
import { sendChat } from "./chatService";

type Message = { role: string; content: string };

// Гол chat
export async function chatWithGemini(messages: Message[]) {
  return sendChat(messages);
}

// Persona update-д ашиглагддаг wrapper
export async function generatePersonaUpdate(messages: Message[]) {
  return chatWithGemini(messages);
}

// TranslateView–д хэрэглэгддэг
export async function detectLanguage(text: string): Promise<string> {
  return "mn"; // эсвэл "en"
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  return text;
}

// 👉 ДУТУУ БАЙСАН 3 ФУНКЦИЙГ НЭМЖ ӨГЖ БАЙНА:

// 1) sendMessageStream — chat streaming хийх
export async function sendMessageStream(messages: Message[]): Promise<any> {
  // streaming хэрэггүй байвал зүгээр sendChat руу дамжуулна
  return sendChat(messages);
}

// 2) generateChatDetails — chat-ийн metadata
export async function generateChatDetails(messages: Message[]): Promise<any> {
  return { summary: "", topics: [] };
}

// 3) generateSuggestedReplies — автосанал
export async function generateSuggestedReplies(
  messages: Message[]
): Promise<string[]> {
  return [];
}
