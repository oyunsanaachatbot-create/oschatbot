// services/chatService.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
});

export async function sendChat(messages) {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 500,
      messages: messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }))
    });

    return {
      success: true,
      reply: completion.choices[0].message.content
    };
  } catch (error) {
    console.error("OpenAI error:", error);
    return {
      success: false,
      reply: "Алдаа гарлаа, дахин оролдоод үзээрэй."
    };
  }
}
