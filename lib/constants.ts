import { ModelOption } from "@/types/agent";

export const VALID_MODELS: Record<string, ModelOption[]> = {
  openai: [
    {
      value: "gpt-4-turbo-preview",
      label: "GPT-4 Turbo",
      description: "Most capable model for complex tasks",
    },
    {
      value: "gpt-3.5-turbo",
      label: "GPT-3.5 Turbo",
      description: "Efficient model for most tasks",
    },
  ],
  claude: [
    {
      value: "claude-3-opus-20240229",
      label: "Claude 3 Opus",
      description: "Most powerful model for complex reasoning",
    },
    {
      value: "claude-3-sonnet-20240229",
      label: "Claude 3 Sonnet",
      description: "Balanced model for various tasks",
    },
  ],
  gemini: [
    {
      value: "gemini-pro",
      label: "Gemini Pro",
      description: "Versatile model for text-based tasks",
    },
    {
      value: "gemini-pro-vision",
      label: "Gemini Pro Vision",
      description: "Multimodal model for text and image tasks",
    },
  ],
};
