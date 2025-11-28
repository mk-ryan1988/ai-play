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

// Define the suggestTheme function/tool for Gemini
const suggestThemeTool: FunctionDeclaration = {
  name: 'suggestTheme',
  description: 'Suggests a theme prompt to the user. Use this AFTER successfully applying a theme to suggest related theme options. Currently only used to suggest "Quick Sergio is here" when the theme appears to be light mode.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'The suggestion text to display (e.g., "Quick Sergio is here")',
      },
      action: {
        type: Type.STRING,
        description: 'The action to perform when clicked. Currently only "reset" is supported.',
      },
    },
    required: ['prompt', 'action'],
  },
};

// System instruction for the model
const SYSTEM_INSTRUCTION = `You are a friendly theme customization assistant. You help users customize their application's visual appearance through natural conversation.

When users want to change the theme (colors, style, mood, roundness, etc.), use the updateTheme function.
When users share an image, analyze its COMPLETE visual aesthetic (colors, shapes, mood) and describe it in detail to generate a matching theme using the updateTheme function. Consider:
  - Dominant colors and accents
  - Visual style (angular/geometric = sharp corners, organic/natural = rounded, modern/clean = moderate)
  - Mood and atmosphere

You can call MULTIPLE functions in one response:
  - When the user requests a LIGHT theme (e.g., "light theme", "flash bang", "bright"), call BOTH:
    1. updateTheme with the light theme description
    2. suggestTheme with prompt="Quick Sergio is here", action="reset"
  - This is an easter egg - only suggest it when applying light themes

When users are just chatting, greeting, asking questions, or thanking you, respond naturally and conversationally.

Be warm, helpful, and concise. Keep responses brief (1-2 sentences) unless the user asks for details.

Special commands:
- "flash bang" means make the theme light (bright, white backgrounds)

Examples:
- "make it purple" → Use updateTheme function only
- "flash bang" → Use BOTH updateTheme("light theme") AND suggestTheme(prompt="Quick Sergio is here", action="reset")
- "make it light" → Use BOTH updateTheme("light theme") AND suggestTheme(prompt="Quick Sergio is here", action="reset")
- [User shares image of sunset] → Use updateTheme function with "warm orange and purple sunset theme with soft rounded corners"
- [User shares image of forest] → Use updateTheme function with "natural green forest theme with organic rounded corners"
- [User shares futuristic tech UI] → Use updateTheme function with "futuristic dark theme with cyan and yellow accents and sharp angular corners"
- "hi" → Respond: "Hello! I can help you customize your theme. Want to try a new color or style?"
- "thanks" → Respond: "You're welcome! Let me know if you want to try any other themes."
- "what can you do?" → Respond: "I can change your app's theme! Try asking for different colors, dark/light modes, or styles. You can also share an image and I'll create a theme inspired by it!"`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: {
    data: string; // base64 encoded
    mimeType: string;
  };
}

interface ActionResult {
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
    const geminiMessages = messages.map((msg: ChatMessage) => {
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      // Add text content if present
      if (msg.content) {
        parts.push({ text: msg.content });
      }

      // Add image if present
      if (msg.image) {
        parts.push({
          inlineData: {
            mimeType: msg.image.mimeType,
            data: msg.image.data,
          },
        });
      }

      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    // Call Gemini with function calling enabled
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: geminiMessages,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{
          functionDeclarations: [updateThemeTool, suggestThemeTool]
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO
          }
        },
      },
    });

    console.log('Gemini response:', JSON.stringify(response, null, 2));

    // Check if the model made function calls (can be multiple)
    const functionCalls = response.functionCalls || [];

    if (functionCalls.length > 0) {
      const actions: ActionResult[] = [];
      let responseMessage = '';

      // Process all function calls
      for (const functionCall of functionCalls) {
        if (functionCall.name === 'updateTheme' && functionCall.args) {
          console.log('updateTheme call detected:', functionCall);
          const description = functionCall.args.description as string;
          const result = await executeUpdateTheme(description, currentTheme);

          actions.push({
            type: 'updateTheme',
            parameters: { description },
            result,
          });

          if (result.success) {
            responseMessage = `✨ Applied ${description}!`;
          }
        } else if (functionCall.name === 'suggestTheme' && functionCall.args) {
          console.log('suggestTheme call detected:', functionCall);
          const prompt = functionCall.args.prompt as string;
          const action = functionCall.args.action as string;

          actions.push({
            type: 'suggestTheme',
            parameters: { prompt, action },
            result: { success: true },
          });
        }
      }

      return NextResponse.json({
        message: responseMessage,
        actions, // Return array of actions
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
