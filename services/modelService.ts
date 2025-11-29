// services/modelService.ts

export async function getAvailableModels(
  apiKeys: string[],
  apiBaseUrl?: string
): Promise<string[]> {
  // 🔹 OpenAI-ийн ашиглах моделуудын тогтмол жагсаалт
  const defaultModelList = ['gpt-4.1-mini', 'gpt-4.1', 'o3-mini'];

  // Одоогоор динамик model fetch хийхгүй, шууд энэ жагсаалтыг буцаана.
  // Хожим нь хүсвэл OpenAI /v1/models рүү хүсэлт илгээдэг болгож болно.
  return defaultModelList;
}
