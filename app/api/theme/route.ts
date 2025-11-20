import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { THEME_SYSTEM_PROMPT, parseThemeResponse } from '@/utils/theme';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
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

    console.log('Generating theme for prompt:', prompt);

    // Initialize Gemini client
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Generate theme using Gemini
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${THEME_SYSTEM_PROMPT}\n\nUser request: ${prompt}`,
    });

    const text = response.text;

    if (!text) {
      console.error('No text in Gemini response');
      return NextResponse.json(
        { error: 'No text in response from LLM' },
        { status: 500 }
      );
    }

    console.log('Gemini response:', text);

    // Parse the LLM response into a Theme object
    const theme = parseThemeResponse(text);

    if (!theme) {
      console.error('Failed to parse theme from LLM response');
      return NextResponse.json(
        { error: 'Failed to parse theme from LLM response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ theme });
  } catch (error) {
    console.error('Theme API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate theme', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
