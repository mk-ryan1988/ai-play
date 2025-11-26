import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import type { Theme } from '@/utils/theme';

// Define the updateTheme function/tool for Gemini
const updateThemeTool = {
  name: 'updateTheme',
  description: 'Updates the application theme based on user preferences. Use this when the user wants to change colors, appearance, mood, or visual style of the application.',
  parameters: {
    type: 'object',
    properties: {
      description: {
        type: 'string',
        description: 'Description of the desired theme changes. Can be a color (e.g., "green", "ocean blue"), mood (e.g., "dark", "professional"), or modification (e.g., "darker", "more rounded", "lighter accent"). Be specific about what the user wants to change.',
      },
    },
    required: ['description'],
  },
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ActionResult {
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

async function executeUpdateTheme(description: string, currentTheme?: Theme): Promise<ActionResult['result']> {
  try {
    // Build the prompt with context about current theme if available
    let prompt = description;
    if (currentTheme) {
      prompt = `Current theme colors: accent=${currentTheme.colors.accent}, primary=${currentTheme.colors.primary}. User request: ${description}`;
    }

    // Call the existing theme API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/theme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate theme');
    }

    const data = await response.json();
    return {
      success: true,
      theme: data.theme,
    };
  } catch (error) {
    console.error('Theme update error:', error);

    // Check if this is a parsing error (likely non-theme request)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Failed to parse theme')) {
      return {
        success: false,
        error: 'I can only help with theme customization! Try asking me to change colors, make things darker/lighter, adjust roundness, or apply different visual styles.',
      };
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, currentTheme } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    console.log('Chat request:', { messageCount: messages.length, hasCurrentTheme: !!currentTheme });

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Latest message must be from user' },
        { status: 400 }
      );
    }

    // Build description with context
    let themeDescription = latestMessage.content;
    if (currentTheme && currentTheme.colors) {
      // Add current theme context for relative modifications
      themeDescription = `Current theme: accent=${currentTheme.colors.accent}, primary=${currentTheme.colors.primary}. User request: ${latestMessage.content}`;
    }

    console.log('Applying theme:', themeDescription);

    // Always call updateTheme for every message
    const result = await executeUpdateTheme(themeDescription, currentTheme);

    const action: ActionResult = {
      type: 'updateTheme',
      parameters: { description: latestMessage.content },
      result,
    };

    // Generate a brief response message
    let responseMessage = '';
    if (result.success) {
      responseMessage = `Applied ${latestMessage.content} theme!`;
    }
    // Don't set message content for errors - the error box will display it

    return NextResponse.json({
      message: responseMessage,
      action,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
