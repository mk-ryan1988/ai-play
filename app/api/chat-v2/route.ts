import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, FunctionCallingConfigMode, Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';
import type { Theme } from '@/utils/theme';
import { generateGeminiFunctionSchema, THEME_GUIDELINES } from '@/utils/theme-config';

// Generate the updateTheme function schema from config
const themeSchema = generateGeminiFunctionSchema();

const updateThemeTool: FunctionDeclaration = {
  name: 'updateTheme',
  description: 'Updates the application theme based on user preferences. Use this when the user wants to change colors, appearance, mood, or visual style of the application.',
  parameters: {
    type: Type.OBJECT,
    properties: themeSchema,
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

// System instruction for the model (uses guidelines from config)
const SYSTEM_INSTRUCTION = `You are a friendly theme customization assistant. You help users customize their application's visual appearance through natural conversation.

When users want to change the theme (colors, style, mood, roundness, etc.), use the updateTheme function with COMPLETE theme values.

${THEME_GUIDELINES}

When users share an image:
- ALWAYS analyze the image's COMPLETE visual aesthetic in detail
- Look at the image carefully and determine if it's a LIGHT or DARK theme based on the background brightness
- Extract and generate theme values based on:
  * Light/dark mode - Look at the actual background brightness in the image
    - If backgrounds are bright/light colored → Generate LIGHT theme (light backgrounds #f9fafb/#f0f0f0, dark text #111827)
    - If backgrounds are dark colored → Generate DARK theme (dark backgrounds #0a0a0a/#171717, light text #ffffff)
  * The COMPLETE color palette with specific hex values:
    - For backgrounds: Look carefully - are they pure white (#ffffff), off-white (#fafafa), or light gray (#e5e5e5, #f0f0f0)?
    - For dark themes: pure black (#000000), near-black (#0a0a0a), or dark gray (#1a1a1a, #262626)?
    - Extract the actual color tones: warm beiges, cool grays, muted pastels, vibrant neons, etc.
  * Text colors should match the mode - dark text for light backgrounds, light text for dark backgrounds
  * Accent colors from the image (extract the vibrant/interactive colors you see)
  * Visual style - shapes and corners (sharp geometric = 0 radius, very rounded organic = 0.75rem+, moderate modern = 0.375rem)
  * Mood and atmosphere (professional, playful, minimal, bold, soft, etc.)
  * Shadow style (subtle soft shadows, dramatic hard shadows, or flat with no shadows)
  * Border style - CRITICAL for UI screenshots:
    - Thin/subtle/invisible borders → modern (borders.primary: "1px solid #e5e5e5")
    - Thick black lines (2-3px) on cards → brutalist (borders.primary: "2px solid #000000")
  * For shadows in UI screenshots:
    - Soft blurred shadows → modern (shadows.primary: "0 4px 6px -1px rgb(0 0 0 / 0.1)")
    - Hard offset with NO blur → brutalist (shadows.primary: "4px 4px 0px #000000")
  * IMPORTANT: Borders/shadows are INDEPENDENT from corners!
    - Thick borders + hard shadows + rounded corners = "soft brutalism" (Gumroad, Figma style)
    - Detect each property separately
  * Sidemenu color (text is auto-computed for accessibility):
    - For playful/bold UIs: use accent from illustrations (e.g., sidemenu="#fde047" yellow)
    - For minimal/clean UIs: sidemenu should match primary background
- If the user ALSO mentions a specific color preference in text (e.g., "red accents", "blue primary"):
  * Use ALL the image details (light/dark mode, background tones, style, mood, shadows)
  * When generating accent/interactive colors, use ONLY the user's requested color, not what appears in the image
  * Generate the exact color they requested (e.g., "red" → #dc2626 or #ef4444, NOT orange or similar colors)

CRITICAL - Color Accuracy:
- When users specify a color (e.g., "red accents"), use that EXACT color
- DO NOT substitute similar colors (e.g., don't use orange when user said red)
- The user's explicit color choice REPLACES what you see in the image for that element

You can call MULTIPLE functions in one response:
- When the user requests a LIGHT theme (e.g., "light theme", "flash bang", "bright"), call BOTH:
  1. updateTheme with the light theme values
  2. suggestTheme with prompt="Quick Sergio is here", action="reset"
- This is an easter egg - only suggest it when applying light themes

When users are just chatting, greeting, asking questions, or thanking you, respond naturally and conversationally.

Be warm, helpful, and concise. Keep responses brief (1-2 sentences) unless the user asks for details.

Special commands:
- "flash bang" means make the theme light (bright, white backgrounds)

Examples:
- "make it purple" → Use updateTheme function with purple accent colors
- "flash bang" → Use BOTH updateTheme (light theme values) AND suggestTheme(prompt="Quick Sergio is here", action="reset")
- [User shares image of sunset] → Use updateTheme with warm orange/purple colors, rounded corners matching the soft organic mood
- [User shares image with "red accents"] → Use updateTheme with colors/style from image BUT use red (#dc2626) for accent colors
- [User shares Gumroad/playful UI] → Detect thick black borders + hard shadows + rounded corners → Generate soft brutalism theme with borders.primary: "2px solid #000000", shadows.primary: "4px 4px 0px #000000", borderRadius.lg: "0.75rem"
- "hi" → Respond: "Hello! I can help you customize your theme. Want to try a new color or style?"`;

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
    colors?: Theme['colors'];
    borderRadius?: Theme['borderRadius'];
    shadows?: Theme['shadows'];
    typography?: Theme['typography'];
    borders?: Theme['borders'];
    prompt?: string; // for suggestTheme
    action?: string; // for suggestTheme
  };
  result: {
    success: boolean;
    theme?: Theme;
    error?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, currentTheme, model = 'gemini-2.5-flash' } = await request.json();

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

    console.log('Chat v2 request:', { messageCount: messages.length, hasCurrentTheme: !!currentTheme });

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
      model,
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

    console.log('Gemini v2 response:', JSON.stringify(response, null, 2));

    // Check if the model made function calls (can be multiple)
    const functionCalls = response.functionCalls || [];

    if (functionCalls.length > 0) {
      const actions: ActionResult[] = [];
      let responseMessage = '';

      // Process all function calls
      for (const functionCall of functionCalls) {
        if (functionCall.name === 'updateTheme' && functionCall.args) {
          console.log('updateTheme call detected (v2):', functionCall);

          // Extract theme directly from function call parameters
          const theme: Theme = {
            colors: functionCall.args.colors as Theme['colors'],
            borderRadius: functionCall.args.borderRadius as Theme['borderRadius'],
            shadows: functionCall.args.shadows as Theme['shadows'],
            typography: functionCall.args.typography as Theme['typography'],
            borders: functionCall.args.borders as Theme['borders'],
          };

          actions.push({
            type: 'updateTheme',
            parameters: theme,
            result: {
              success: true,
              theme,
            },
          });

          responseMessage = `✨ Theme updated!`;
        } else if (functionCall.name === 'suggestTheme' && functionCall.args) {
          console.log('suggestTheme call detected (v2):', functionCall);
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
    console.error('Chat v2 API error:', error);

    // Check for rate limit error (429)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isRateLimited = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');

    if (isRateLimited) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          errorCode: 'RATE_LIMITED',
          details: errorMessage,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
