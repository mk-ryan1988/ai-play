'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useThemeOptional } from './ThemeContext';
import { useModel } from './ModelContext';
import type { Theme } from '@/utils/theme';

export interface ActionMetadata {
  type: 'updateTheme' | 'suggestTheme';
  parameters: {
    description?: string; // for updateTheme
    prompt?: string; // for suggestTheme
    action?: string; // for suggestTheme
  };
  result: {
    success: boolean;
    theme?: Theme;
    error?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ActionMetadata[]; // Can have multiple actions now
  image?: {
    data: string; // base64 encoded image
    mimeType: string; // e.g., "image/jpeg", "image/png"
  };
}

interface ChatContextType {
  messages: Message[];
  isGenerating: boolean;
  isUpdatingTheme: boolean;
  sendMessage: (content: string, image?: { data: string; mimeType: string }) => Promise<void>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'chat-messages';

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);
  const themeContext = useThemeOptional();
  const { selectedModel } = useModel();

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Failed to load messages from localStorage:', error);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error);
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string, image?: { data: string; mimeType: string }) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      ...(image && { image }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      // Get current theme if available
      const currentTheme = themeContext?.currentTheme;

      // Prepare message history for API (simple format)
      const messageHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
        ...(msg.image && { image: msg.image }),
      }));

      // Route to correct API based on model capabilities
      // v2 = function calling (direct structured output)
      // v1 = JSON parsing from text response
      const chatRoute = selectedModel.supportsFunctionCalling ? '/api/chat-v2' : '/api/chat';

      // Call the chat API
      const response = await fetch(chatRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messageHistory,
          currentTheme,
          model: selectedModel.id,
        }),
      });

      const data = await response.json();

      // Check for rate limit error
      if (!response.ok) {
        if (response.status === 429 || data.errorCode === 'RATE_LIMITED') {
          alert('⚠️ Rate limit exceeded!\n\nYou\'ve hit the API quota limit. Please wait a minute and try again.');
          throw new Error('Rate limited');
        }
        throw new Error(`API error: ${response.status}`);
      }

      // Handle actions (can be multiple)
      const actions = data.actions || [];

      // Check if any action failed
      const hasFailedAction = actions.some((action: ActionMetadata) => !action.result.success);
      if (hasFailedAction) {
        setIsGenerating(false);
      }

      // Process theme update actions
      for (const action of actions) {
        if (action.type === 'updateTheme' && action.result.success) {
          setIsUpdatingTheme(true); // Show shimmer overlay during theme update
          if (themeContext && action.result.theme) {
            themeContext.updateTheme(action.result.theme);
            themeContext.saveTheme(); // Save to localStorage
          }
          // Brief delay to let the shimmer effect be visible
          setTimeout(() => setIsUpdatingTheme(false), 500);
        }
      }

      // Add assistant message with actions metadata
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || '',
        timestamp: new Date(),
        actions: actions.length > 0 ? actions : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  }, [messages, themeContext, selectedModel]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isGenerating,
        isUpdatingTheme,
        sendMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
