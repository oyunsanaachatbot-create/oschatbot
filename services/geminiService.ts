// services/geminiService.ts
import { sendChat } from "./chatService";
import { Message as ChatMessage, MessageRole } from "../types";

// OpenAI руу явах жинхэнэ request-д хэрэглэгдэх формат
type ApiMessage = { role: string; content: string };

// Гол chat (шууд OpenAI chatService руу дамжуулна)
export async function chatWithGemini(messages: ApiMessage[]) {
  return sendChat(messages);
}

// Persona update-д ашиглагддаг wrapper
export async function generatePersonaUpdate(messages: ApiMessage[]) {
  return chatWithGemini(messages);
}

// TranslateView-д ашиглагддаг (одоохондоо stub)
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

/**
 * 🔹 sendMessageStream
 *   KChat-ийн useChatMessaging нь "Gemini stream" бүтэцтэй async generator
 *   хүлээдэг тул энд OpenAI-ийн нэг удаагийн хариуг
 *   яг тэр бүтэц рүү хувиргаад нэг chunk болгон yield хийж байна.
 */
export async function* sendMessageStream(
  apiKeys: string[],
  historyForAPI: ChatMessage[],
  promptContent: string,
  promptAttachments: any[],
  currentModel: string,
  settings: any,
  toolConfig: any,
  activePersona: any,
  isStudyMode?: boolean
): AsyncGenerator<any> {
  // historyForAPI = (сүүлийн user мессежгүй түүх)
  const messages: ApiMessage[] = historyForAPI.map((m) => ({
    role: m.role === MessageRole.USER ? "user" : "assistant",
    content: m.content,
  }));

  // Сүүлийн user prompt-ийг нэмж өгнө
  messages.push({ role: "user", content: promptContent });

  const result = await sendChat(messages);

  const replyText = result.success
    ? result.reply
    : `Error: ${result.reply || "Failed to get response"}`;

  // useChatMessaging доторх for-await энэ "chunk"-ийг уншиж,
  // candidate.content.parts[].text-ээс fullResponse-г угсардаг.
  yield {
    text: result.success ? undefined : replyText,
    candidates: [
      {
        content: {
          parts: [{ text: replyText }],
        },
        groundingMetadata: null,
      },
    ],
  };
}

// 🔹 Title generation – одоохондоо энгийн fallback
export async function generateChatDetails(
  apiKeys: string[],
  content: string,
  model: string,
  settings: any
): Promise<{ title: string; icon: string }> {
  const title = content.slice(0, 40) || "New Chat";
  return { title, icon: "💬" };
}

// 🔹 Suggested replies – одоохондоо хоосон жагсаалт
export async function generateSuggestedReplies(
  apiKeys: string[],
  messages: ChatMessage[]
): Promise<string[]> {
  return [];
}
