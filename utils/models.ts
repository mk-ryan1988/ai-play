/**
 * Model Configuration
 *
 * Defines available AI models and their capabilities.
 * Models with function calling support use the v2 API (direct structured output).
 * Models without use the v1 API (JSON parsing from text).
 */

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'google' | 'openai' | 'anthropic';
  supportsFunctionCalling: boolean;
  description?: string;
}

export const MODELS: ModelConfig[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    supportsFunctionCalling: true,
    description: 'Most capable, native function calling',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    supportsFunctionCalling: false,
    description: 'Faster & cheaper, uses JSON parsing',
  },
];

export const DEFAULT_MODEL_ID = 'gemini-2.5-flash';

export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getDefaultModel(): ModelConfig {
  return MODELS.find((m) => m.id === DEFAULT_MODEL_ID) || MODELS[0];
}
