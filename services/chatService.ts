// services/gemini/chatService.ts
// OpenAI GPT-4.1-mini руу энгийн fetch ашиглаж холбож байна

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function sendChat(messages: { role: string; content: string }[]) {
  try {
    if (!OPENAI_API_KEY) {
      console.error("VITE_OPENAI_API_KEY тохируулаагүй байна");
      return {
        success: false,
        reply: "Серверийн тохиргоонд асуудал байна. API key тохируулаагүй байна.",
      };
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.7,
        max_tokens: 500,
        messages: messages.map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        })),
      }),
    });

    if (!res.ok) {
      console.error("OpenAI response error:", res.status, await res.text());
      return {
        success: false,
        reply: "AI-аас хариу авахад алдаа гарлаа. Дахин оролдоод үзээрэй.",
      };
    }

    const data = await res.json();

    return {
      success: true,
      reply: data.choices?.[0]?.message?.content ?? "",
    };
  } catch (error) {
    console.error("OpenAI fetch error:", error);
    return {
      success: false,
      reply: "Алдаа гарлаа, дахин оролдоод үзээрэй.",
    };
  }
}
