// services/modelService.ts
export async function getAvailableModels(apiKeys: string[], apiBaseUrl?: string): Promise<string[]> {
  // OpenAI default model list
  const defaultModelList = ['gpt-4.1-mini'];

  if (!apiKeys || apiKeys.length === 0) {
    return defaultModelList;
  }

  const models = new Set(defaultModelList);

  for (const key of apiKeys) {
    const sanitizedApiKey = key.trim().replace(/["']/g, '');
    if (!sanitizedApiKey) continue;

    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${sanitizedApiKey}`
        }
      });

      if (!response.ok) continue;

      const data = await response.json();

      const chatModels = data.data
        .filter((m: any) =>
          m.id.includes("gpt") || m.id.includes("o3")
        )
        .map((m: any) => m.id);

      chatModels.forEach((id: string) => models.add(id));

    } catch {
      continue;
    }
  }

  return [...models];
}
