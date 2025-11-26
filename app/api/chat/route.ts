import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, FunctionCallingConfigMode, Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';
import type { Theme } from '@/utils/theme';
import { THEME_SYSTEM_PROMPT, parseThemeResponse } from '@/utils/theme';

// Define the updateTheme function/tool for Gemini
const updateThemeTool: FunctionDeclaration = {
  name: 'updateTheme',
  description: 'Updates the application theme based on user preferences. Use this when the user wants to change colors, appearance, mood, or visual style of the application.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      description: {
        type: Type.STRING,
        description: 'Description of the desired theme changes. Can be a color (e.g., "green", "ocean blue"), mood (e.g., "dark", "professional"), or modification (e.g., "darker", "more rounded", "lighter accent"). Be specific about what the user wants to change.',
      },
    },
    required: ['description'],
  },
};

// System instruction for the model
const SYSTEM_INSTRUCTION = `You are a friendly theme customization assistant. You help users customize their application's visual appearance through natural conversation.

When users want to change the theme (colors, style, mood, roundness, etc.), use the updateTheme function.
When users are just chatting, greeting, asking questions, or thanking you, respond naturally and conversationally.

Be warm, helpful, and concise. Keep responses brief (1-2 sentences) unless the user asks for details.

Special commands:
- "flash bang" means make the theme light (bright, white backgrounds)

Examples:
- "make it purple" → Use updateTheme function
- "flash bang" → Use updateTheme function with "light theme"
- "hi" → Respond: "Hello! I can help you customize your theme. Want to try a new color or style?"
- "thanks" → Respond: "You're welcome! Let me know if you want to try any other themes."
- "what can you do?" → Respond: "I can change your app's theme! Try asking for different colors, dark/light modes, or styles like 'professional' or 'playful'."`;

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
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('API key not configured');
    }

    // Build the prompt with context about current theme if available
    let prompt = description;
    if (currentTheme && currentTheme.colors) {
      prompt = `Current theme colors: accent=${currentTheme.colors.accent}, primary=${currentTheme.colors.primary}. User request: ${description}`;
    }

    console.log('Generating theme for prompt:', prompt);

    // Initialize Gemini client and generate theme directly
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${THEME_SYSTEM_PROMPT}\n\nUser request: ${prompt}`,
    });

    const text = response.text;
    if (!text) {
      throw new Error('No text in response from LLM');
    }

    console.log('Gemini theme response:', text);

    // Parse the LLM response into a Theme object
    const theme = parseThemeResponse(text);
    if (!theme) {
      throw new Error('Failed to parse theme from LLM response');
    }

    return {
      success: true,
      theme,
    };
  } catch (error) {
    console.error('Theme update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
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

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('Chat request:', { messageCount: messages.length, hasCurrentTheme: !!currentTheme });

    // Initialize Gemini client
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg: ChatMessage) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Call Gemini with function calling enabled
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: geminiMessages,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{
          functionDeclarations: [updateThemeTool]
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO
          }
        },
      },
    });

    console.log('Gemini response:', JSON.stringify(response, null, 2));

    // Check if the model made a function call
    const functionCall = response.functionCalls?.[0];

    if (functionCall && functionCall.name === 'updateTheme' && functionCall.args) {
      // Model decided to update the theme
      console.log('Function call detected:', functionCall);
      const description = functionCall.args.description as string;
      const result = await executeUpdateTheme(description, currentTheme);

      const action: ActionResult = {
        type: 'updateTheme',
        parameters: { description },
        result,
      };

      // Generate a friendly response
      let responseMessage = '';
      if (result.success) {
        responseMessage = `✨ Applied ${description}!`;
      }

      return NextResponse.json({
        message: responseMessage,
        action,
      });
    } else {
      // Model decided to just respond conversationally
      const textResponse = response.text || "I'm here to help with your theme! Try asking me to change colors or styles.";

      return NextResponse.json({
        message: textResponse,
      });
    }

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
