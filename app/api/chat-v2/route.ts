import { NextRequest } from 'next/server';
import { GoogleGenAI, FunctionCallingConfigMode, Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';
import type { Theme } from '@/utils/theme';
import { checkAccessibility } from '@/utils/theme';
import { generateGeminiFunctionSchema, THEME_GUIDELINES } from '@/utils/theme-config';
import { sendSSE, SSE_HEADERS } from '@/utils/stream';

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

// Define the checkAccessibility function/tool for Gemini
const checkAccessibilityTool: FunctionDeclaration = {
  name: 'checkAccessibility',
  description: 'Checks the current theme for WCAG AA accessibility compliance and auto-adjusts colors that fail contrast requirements. Use this after applying a theme when the user mentions accessibility, readability, or contrast, or when you think the theme may have contrast issues.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

// System instruction for the model (uses guidelines from config)
const SYSTEM_INSTRUCTION = `You are a friendly theme customization assistant. You help users customize their application's visual appearance through natural conversation.

IMPORTANT: Always include a brief, friendly text response with every message, even when calling functions. For example, when updating a theme, say something like "Done! I've applied a purple theme for you." or "Here's a warm sunset-inspired look!" Do NOT ask follow-up questions like "Would you like me to adjust anything?" - just confirm what you did.

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
- Accessibility is automatically checked after every theme update - you don't need to call checkAccessibility manually
- When the user requests a LIGHT theme (e.g., "light theme", "flash bang", "bright"), call BOTH:
  1. updateTheme with the light theme values
  2. suggestTheme with prompt="Quick Sergio is here", action="reset"
- The checkAccessibility function is available if users explicitly ask about accessibility or contrast

When users are just chatting, greeting, asking questions, or thanking you, respond naturally and conversationally.

Be warm, helpful, and concise. Keep responses brief (1-2 sentences) unless the user asks for details.

Special commands:
- "flash bang" means make the theme light (bright, white backgrounds)

Examples:
- "make it purple" → Call updateTheme with purple accent colors
- "flash bang" → Call updateTheme (light theme) AND suggestTheme(prompt="Quick Sergio is here", action="reset")
- [User shares image of sunset] → Call updateTheme with warm orange/purple colors, rounded corners
- [User shares image with "red accents"] → Call updateTheme with image style + red accents
- "hi" → Respond conversationally (no function calls needed)`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: {
    data: string; // base64 encoded
    mimeType: string;
  };
}

interface ActionResult {
  type: 'updateTheme' | 'suggestTheme' | 'checkAccessibility';
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

export async function POST(request: NextRequest) {
  try {
    const { messages, currentTheme, model = 'gemini-2.5-flash' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Chat v2 streaming request:', { messageCount: messages.length, model });

    // Initialize Gemini client
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg: ChatMessage) => {
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      if (msg.content) {
        parts.push({ text: msg.content });
      }

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

    // Call Gemini with streaming enabled
    const streamResponse = await genAI.models.generateContentStream({
      model,
      contents: geminiMessages,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{
          functionDeclarations: [updateThemeTool, suggestThemeTool, checkAccessibilityTool]
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO
          }
        },
      },
    });

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const collectedFunctionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

        try {
          for await (const chunk of streamResponse) {
            // Stream text content
            if (chunk.text) {
              sendSSE(controller, encoder, { type: 'text', content: chunk.text });
            }

            // Collect function calls (typically arrive complete, not chunked)
            const functionCalls = chunk.functionCalls || [];
            for (const fc of functionCalls) {
              if (fc.name && fc.args) {
                collectedFunctionCalls.push({
                  name: fc.name,
                  args: fc.args as Record<string, unknown>,
                });
              }
            }
          }

          // Process collected function calls after stream completes
          // Track whether we've already run accessibility check
          let accessibilityChecked = false;

          for (const fc of collectedFunctionCalls) {
            if (fc.name === 'updateTheme') {
              const theme: Theme = {
                colors: fc.args.colors as Theme['colors'],
                borderRadius: fc.args.borderRadius as Theme['borderRadius'],
                shadows: fc.args.shadows as Theme['shadows'],
                typography: fc.args.typography as Theme['typography'],
                borders: fc.args.borders as Theme['borders'],
              };

              // Automatically run accessibility check on the new theme
              const accessibilityResult = checkAccessibility(theme);
              const finalTheme = accessibilityResult.adjustedTheme;

              const action: ActionResult = {
                type: 'updateTheme',
                parameters: theme,
                result: { success: true, theme: finalTheme },
              };

              sendSSE(controller, encoder, { type: 'action', action });

              // Send accessibility results if adjustments were made
              if (!accessibilityResult.passed) {
                const accessibilityAction: ActionResult = {
                  type: 'checkAccessibility',
                  parameters: {},
                  result: {
                    success: true,
                    passed: accessibilityResult.passed,
                    adjustments: accessibilityResult.adjustments,
                    theme: finalTheme,
                  },
                };
                sendSSE(controller, encoder, { type: 'action', action: accessibilityAction });
              }
              accessibilityChecked = true;
            } else if (fc.name === 'suggestTheme') {
              const action: ActionResult = {
                type: 'suggestTheme',
                parameters: {
                  prompt: fc.args.prompt as string,
                  action: fc.args.action as string,
                },
                result: { success: true },
              };

              sendSSE(controller, encoder, { type: 'action', action });
            } else if (fc.name === 'checkAccessibility') {
              // Skip if already checked (happens automatically after updateTheme)
              if (accessibilityChecked) continue;

              // Use the current theme from the request for manual accessibility checks
              if (currentTheme) {
                const result = checkAccessibility(currentTheme);

                const action: ActionResult = {
                  type: 'checkAccessibility',
                  parameters: {},
                  result: {
                    success: true,
                    passed: result.passed,
                    adjustments: result.adjustments,
                    theme: result.adjustedTheme,
                  },
                };

                sendSSE(controller, encoder, { type: 'action', action });
              }
            }
          }

          sendSSE(controller, encoder, { type: 'done' });
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const isRateLimited = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');

          sendSSE(controller, encoder, {
            type: 'error',
            error: isRateLimited ? 'RATE_LIMITED' : errorMessage,
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: SSE_HEADERS });

  } catch (error) {
    console.error('Chat v2 API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: 'Failed to process chat message', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
