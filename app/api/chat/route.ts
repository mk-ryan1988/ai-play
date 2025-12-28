import { NextRequest } from 'next/server';
import { GoogleGenAI, FunctionCallingConfigMode, Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';
import type { Theme } from '@/utils/theme';
import { THEME_SYSTEM_PROMPT, parseThemeResponse, checkAccessibility } from '@/utils/theme';
import { sendSSE, SSE_HEADERS } from '@/utils/stream';

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

// Define the checkAccessibility function/tool for Gemini
const checkAccessibilityTool: FunctionDeclaration = {
  name: 'checkAccessibility',
  description: 'Checks the current theme for WCAG AA accessibility compliance and auto-adjusts colors that fail contrast requirements. Use this after applying a theme when the user mentions accessibility, readability, or contrast, or when you think the theme may have contrast issues.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

// System instruction for the model
const SYSTEM_INSTRUCTION = `You are a friendly theme customization assistant. You help users customize their application's visual appearance through natural conversation.

When users want to change the theme (colors, style, mood, roundness, etc.), use the updateTheme function.

When users share an image:
- ALWAYS analyze the image's COMPLETE visual aesthetic in detail
- Extract and describe specifically with APPROXIMATE HEX VALUES:
  * Light/dark mode (is it bright and airy, or dark and moody?)
  * The COMPLETE color palette with approximate hex references (e.g., "light gray backgrounds around #e5e5e5, NOT pure white", "warm beige ~#f5f0eb", "dark charcoal ~#1a1a1a")
  * Background colors - be VERY specific about whether they are:
    - Pure white (#ffffff) vs off-white (#fafafa, #f9f9f9) vs light gray (#f0f0f0, #e5e5e5)
    - Pure black (#000000) vs near-black (#0a0a0a) vs dark gray (#1a1a1a, #262626)
  * Text color style (high contrast black/white, or muted/subtle tones?)
  * Visual style - be specific about shapes and corners (sharp geometric corners, very rounded organic shapes, moderate rounded modern style)
  * Mood and atmosphere (professional, playful, minimal, bold, soft, etc.)
  * Shadow style (subtle soft shadows, dramatic hard shadows, or flat with no shadows)
  * Border style - IMPORTANT: Look carefully at card/button borders:
    - Thin/subtle/invisible borders → modern style (use "1px solid #e5e5e5" or transparent)
    - Thick black lines (2-3px) on cards/buttons → brutalist style (use "2px solid #000000" or "3px solid #000000")
  * For shadows, distinguish between:
    - Soft blurred shadows → modern (use "0 4px 6px -1px rgb(0 0 0 / 0.1)")
    - Hard offset shadows with NO blur → brutalist (use "4px 4px 0px #000000")
  * CRITICAL: Borders and shadows are INDEPENDENT from corner style!
    - A UI can have thick black borders + hard shadows WITH rounded corners = "soft brutalism" (like Gumroad, Figma)
    - Detect each property separately - don't assume thick borders mean sharp corners
  * Sidemenu color (text is auto-computed for accessibility):
    - For playful/bold UIs: use accent from illustrations (e.g., yellow)
    - For minimal/clean UIs: sidemenu should match primary background
- If the user ALSO mentions a specific color preference in text (e.g., "red accents", "blue primary"):
  * Describe ALL the image details above (the full color palette, specific background tones, style, mood)
  * When you reach the part about accent/interactive colors, use ONLY the user's requested color
  * DO NOT mention any other similar colors that appear in the image (e.g., if user says "red accents" and image has orange, DO NOT say "red and orange" - say only "red")
  * DO NOT say "gradient" unless user explicitly requested it
- If no color preference in text, use the image's colors exactly as they appear

CRITICAL - Color Accuracy When User Specifies:
- When users specify a color (e.g., "red accents"), you MUST use ONLY that exact color name in your description
- DO NOT mention similar/nearby colors from the image (e.g., if user says "red" and image has orange, DO NOT say "red and orange gradient" - say "red accents" only)
- DO NOT add "gradient" or color combinations unless user explicitly asked for them
- The user's color choice REPLACES what you see in the image for that specific element
- Consider:
  - Dominant colors and accents
  - Visual style (angular/geometric = sharp corners, organic/natural = rounded, modern/clean = moderate)
  - Mood and atmosphere

You can call MULTIPLE functions in one response:
- Accessibility is automatically checked after every theme update - you don't need to call checkAccessibility manually
- When the user requests a LIGHT theme (e.g., "light theme", "flash bang", "bright"), call BOTH:
  1. updateTheme with the light theme description
  2. suggestTheme with prompt="Quick Sergio is here", action="reset"
- The checkAccessibility function is available if users explicitly ask about accessibility or contrast

When users are just chatting, greeting, asking questions, or thanking you, respond naturally and conversationally.

Be warm, helpful, and concise. Keep responses brief (1-2 sentences) unless the user asks for details.

Special commands:
- "flash bang" means make the theme light (bright, white backgrounds)

Examples:
- "make it purple" → Call updateTheme with "purple theme"
- "flash bang" → Call updateTheme("light theme") AND suggestTheme(prompt="Quick Sergio is here", action="reset")
- [User shares image of sunset] → Call updateTheme with "warm orange and purple sunset theme"
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

async function executeUpdateTheme(description: string, currentTheme?: Theme, modelId: string = 'gemini-2.5-flash-lite'): Promise<ActionResult['result']> {
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
      model: modelId,
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
    const { messages, currentTheme, model = 'gemini-2.5-flash-lite' } = await request.json();

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

    console.log('Chat streaming request:', { messageCount: messages.length, model });

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

            // Collect function calls
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
          // This route uses a second LLM call to generate theme JSON
          // Track whether we've already run accessibility check
          let accessibilityChecked = false;

          for (const fc of collectedFunctionCalls) {
            if (fc.name === 'updateTheme') {
              const description = fc.args.description as string;
              const result = await executeUpdateTheme(description, currentTheme, model);

              // Automatically run accessibility check if theme was generated
              let accessibilityAction: ActionResult | null = null;
              if (result.success && result.theme) {
                const accessibilityResult = checkAccessibility(result.theme);
                result.theme = accessibilityResult.adjustedTheme;

                // Prepare accessibility results if adjustments were made
                if (!accessibilityResult.passed) {
                  accessibilityAction = {
                    type: 'checkAccessibility',
                    parameters: {},
                    result: {
                      success: true,
                      passed: accessibilityResult.passed,
                      adjustments: accessibilityResult.adjustments,
                      theme: accessibilityResult.adjustedTheme,
                    },
                  };
                }
                accessibilityChecked = true;
              }

              const action: ActionResult = {
                type: 'updateTheme',
                parameters: { description },
                result,
              };

              sendSSE(controller, encoder, { type: 'action', action });

              // Send accessibility results after updateTheme
              if (accessibilityAction) {
                sendSSE(controller, encoder, { type: 'action', action: accessibilityAction });
              }
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
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: 'Failed to process chat message', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
