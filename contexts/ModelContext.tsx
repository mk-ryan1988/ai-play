'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ModelConfig, getDefaultModel, getModelById, MODELS } from '@/utils/models';

interface ModelContextType {
  selectedModel: ModelConfig;
  setSelectedModel: (modelId: string) => void;
  availableModels: ModelConfig[];
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

const MODEL_STORAGE_KEY = 'selected-model';

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModelState] = useState<ModelConfig>(getDefaultModel());

  // Load selected model from localStorage on mount
  useEffect(() => {
    try {
      const savedModelId = localStorage.getItem(MODEL_STORAGE_KEY);
      if (savedModelId) {
        const model = getModelById(savedModelId);
        if (model) {
          setSelectedModelState(model);
        }
      }
    } catch (error) {
      console.error('Failed to load selected model:', error);
    }
  }, []);

  const setSelectedModel = useCallback((modelId: string) => {
    const model = getModelById(modelId);
    if (model) {
      setSelectedModelState(model);
      localStorage.setItem(MODEL_STORAGE_KEY, modelId);
    }
  }, []);

  return (
    <ModelContext.Provider
      value={{
        selectedModel,
        setSelectedModel,
        availableModels: MODELS,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}
