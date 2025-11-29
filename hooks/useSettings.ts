import { useEffect, useState } from 'react';
import { getAvailableModels } from '../services/modelService';
import { loadSettings, saveSettings } from '../services/storageService';
import { useLocalization } from '../contexts/LocalizationContext';

interface Settings {
  theme: string;
  language: string;
  apiKey: string[];
  defaultModel: string;
  suggestionModel: string;
  autoTitleGeneration: boolean;
  titleGenerationModel: string;
  languageDetectionModel: string;
  defaultSearch: boolean;
  useSearchOptimizerPrompt: boolean;
  showThoughts: boolean;
  enableGlobalSystemPrompt: boolean;
  globalSystemPrompt: string;
  optimizeFormatting: boolean;
  thinkDeeper: boolean;
  apiBaseUrl: string;
}

const defaultSettings: Settings = {
  theme: 'light',
  language: 'en',
  apiKey: [],

  // *** OpenAI руу тогтмол model ашиглах ***
  defaultModel: 'gpt-4.1-mini',
  suggestionModel: 'gpt-4.1-mini',
  autoTitleGeneration: true,
  titleGenerationModel: 'gpt-4.1-mini',
  languageDetectionModel: 'gpt-4.1-mini',

  defaultSearch: false,
  useSearchOptimizerPrompt: false,
  showThoughts: true,
  enableGlobalSystemPrompt: false,
  globalSystemPrompt: '',
  optimizeFormatting: false,
  thinkDeeper: false,
  apiBaseUrl: '',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // *** Энд зөвхөн OpenAI-ийн model жагсаалт ***
  const [availableModels, setAvailableModels] = useState<string[]>([
    'gpt-4.1-mini',
    'gpt-4.1',
    'o3-mini',
  ]);

  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const { setLanguage } = useLocalization();

  useEffect(() => {
    const loadedSettings = loadSettings();
    const initialSettings = { ...defaultSettings, ...loadedSettings };

    // Dark mode авто илрүүлэлт
    if (!loadedSettings && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      initialSettings.theme = 'dark';
    }

    // Environment API base override
    if (process.env.API_BASE_URL) {
      initialSettings.apiBaseUrl = process.env.API_BASE_URL;
    }

    setSettings(initialSettings);
    setLanguage(initialSettings.language);
    setIsStorageLoaded(true);

    // Model жагсаалт шинэчлэх
    (async () => {
      const models = await getAvailableModels(initialSettings.apiKey, initialSettings.apiBaseUrl);
      if (models?.length > 0) setAvailableModels(models);
    })();
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    saveSettings(merged);
  };

  return { settings, updateSettings, availableModels, isStorageLoaded };
};
