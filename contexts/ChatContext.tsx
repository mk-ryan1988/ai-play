'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useThemeOptional } from './ThemeContext';
import { useModel } from './ModelContext';
import type { Theme } from '@/utils/theme';

export interface ActionMetadata {
  type: 'updateTheme' | 'suggestTheme' | 'checkAccessibility';
  parameters: {
    description?: string; // for updateTheme
    prompt?: string; // for suggestTheme
    action?: string; // for suggestTheme
  };
  result: {
    success: boolean;
    theme?: Theme;
    error?: string;
    passed?: boolean; // for checkAccessibility
    adjustments?: Array<{
      colorKey: string;
      originalValue: string;
      adjustedValue: string;
      contrastWith: string;
      originalRatio: number;
      adjustedRatio: number;
      requirement: number;
    }>;
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
  isStreaming?: boolean; // True while message is being streamed
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

  // Save messages to localStorage whenever they change (but not during streaming)
  useEffect(() => {
    // Don't save while any message is streaming
    const hasStreamingMessage = messages.some(m => m.isStreaming);
    if (hasStreamingMessage) return;

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

    // Create placeholder assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const streamingMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, streamingMessage]);

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
      const chatRoute = selectedModel.supportsFunctionCalling ? '/api/chat-v2' : '/api/chat';

      // Call the chat API (now returns SSE stream)
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

      // Check for non-streaming error responses
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          if (response.status === 429 || data.errorCode === 'RATE_LIMITED') {
            alert('⚠️ Rate limit exceeded!\n\nYou\'ve hit the API quota limit. Please wait a minute and try again.');
          }
        }
        throw new Error(`API error: ${response.status}`);
      }

      // Process SSE stream
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';
      const collectedActions: ActionMetadata[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6); // Remove "data: "
          if (!jsonStr.trim()) continue;

          try {
            const event = JSON.parse(jsonStr);

            switch (event.type) {
              case 'text':
                accumulatedContent += event.content;
                // Update message content progressively
                setMessages((prev) => prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ));
                break;

              case 'action':
                collectedActions.push(event.action as ActionMetadata);
                // Process theme updates immediately
                if (event.action.type === 'updateTheme' && event.action.result?.success) {
                  setIsUpdatingTheme(true);
                  if (themeContext && event.action.result.theme) {
                    themeContext.updateTheme(event.action.result.theme);
                    themeContext.saveTheme();
                  }
                  setTimeout(() => setIsUpdatingTheme(false), 500);
                }
                // Process accessibility check results - apply adjusted theme
                if (event.action.type === 'checkAccessibility' && event.action.result?.success) {
                  setIsUpdatingTheme(true);
                  if (themeContext && event.action.result.theme) {
                    themeContext.updateTheme(event.action.result.theme);
                    themeContext.saveTheme();
                  }
                  setTimeout(() => setIsUpdatingTheme(false), 500);
                }
                break;

              case 'error':
                if (event.error === 'RATE_LIMITED') {
                  alert('⚠️ Rate limit exceeded!\n\nYou\'ve hit the API quota limit. Please wait a minute and try again.');
                }
                throw new Error(event.error);

              case 'done':
                // Finalize the message
                setMessages((prev) => prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: accumulatedContent,
                        actions: collectedActions.length > 0 ? collectedActions : undefined,
                        isStreaming: false,
                      }
                    : msg
                ));
                break;
            }
          } catch (parseError) {
            console.error('Failed to parse SSE event:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      // Update the streaming message to show error
      setMessages((prev) => prev.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: msg.content || 'Sorry, I encountered an error processing your request.',
              isStreaming: false,
            }
          : msg
      ));
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
