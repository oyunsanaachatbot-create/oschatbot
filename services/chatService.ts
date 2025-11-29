// oschatbot/services/chatService.ts

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

type FileAttachment = {
  id: string;
  name: string;
  type: string;     // "image/png" гэх мэт
  size: number;
  dataUrl: string;  // fileToData() -с ирдэг base64 data URL
};

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: FileAttachment[];
};

export async function sendChat(messages: ChatMessage[]) {
  if (!OPENAI_API_KEY) {
    console.error('VITE_OPENAI_API_KEY тохируулаагүй байна');
    return {
      success: false,
      reply: 'Серверийн тохиргоонд асуудал байна. API key тохируулаагүй байна.',
    };
  }

  const payloadMessages = messages.map((msg) => {
    // Зурагтай user мессеж
    if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
      const parts: any[] = [];

      if (msg.content && msg.content.trim() !== '') {
        parts.push({
          type: 'text',
          text: msg.content,
        });
      }

      for (const att of msg.attachments) {
        parts.push({
          type: 'image_url',
          image_url: { url: att.dataUrl },
        });
      }

      return {
        role: 'user',
        content: parts,
      };
    }

    // Энгийн текст мессеж
    return {
      role: msg.role,
      content: msg.content,
    };
  });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',        // Чиний ашиглаж байгаа model
      temperature: 0.7,
      max_tokens: 500,
      messages: payloadMessages,
    }),
  });

  if (!res.ok) {
    console.error('OpenAI response error:', res.status, await res.text());
    return {
      success: false,
      reply: 'AI-аас хариу авахад алдаа гарлаа. Дахин оролдоод үзээрэй.',
    };
  }

  const data = await res.json();

  return {
    success: true,
    reply: data.choices?.[0]?.message?.content ?? '',
  };
}
