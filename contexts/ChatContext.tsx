'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useThemeOptional } from './ThemeContext';
import type { Theme } from '@/utils/theme';

export interface ActionMetadata {
  type: 'updateTheme';
  parameters: {
    description: string;
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
  action?: ActionMetadata;
}

interface ChatContextType {
  messages: Message[];
  isGenerating: boolean;
  isUpdatingTheme: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'chat-messages';

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);
  const themeContext = useThemeOptional();

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

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
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
      }));

      // Call the new chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messageHistory,
          currentTheme,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Check if the action failed - if so, stop generating state immediately
      if (data.action && !data.action.result.success) {
        setIsGenerating(false);
      }

      // If there's a theme update action, apply it
      if (data.action?.type === 'updateTheme' && data.action.result.success) {
        setIsUpdatingTheme(true); // Show shimmer overlay during theme update
        if (themeContext && data.action.result.theme) {
          themeContext.updateTheme(data.action.result.theme);
          themeContext.saveTheme(); // Save to localStorage
        }
        // Brief delay to let the shimmer effect be visible
        setTimeout(() => setIsUpdatingTheme(false), 500);
      }

      // Add assistant message with action metadata
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || '',
        timestamp: new Date(),
        action: data.action,
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
  }, [messages, themeContext]);

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
