/**
 * Theme Configuration - Single Source of Truth
 *
 * All theme variables are defined here with metadata.
 * Everything else (types, property maps, LLM prompts, function schemas) is derived from this.
 *
 * To add a new variable:
 * 1. Add CSS variable to globals.css (light + dark mode)
 * 2. Add entry here in the appropriate category
 * 3. Done! Everything else is auto-generated.
 */

import { Type } from '@google/genai';

// Variable definition with metadata
interface ThemeVariableDefinition {
  cssVar: string;
  description: string;
}

// Theme variable definitions by category
export const THEME_COLORS = {
  // Surface colors
  primary: { cssVar: '--color-primary', description: 'Primary background/surface color (hex, e.g., "#f9fafb" for light, "#0a0a0a" for dark)' },
  secondary: { cssVar: '--color-secondary', description: 'Secondary background/surface color (hex)' },
  tertiary: { cssVar: '--color-tertiary', description: 'Tertiary background/surface color (hex)' },
  sidemenu: { cssVar: '--color-sidemenu', description: 'Sidebar/navigation menu background color (hex)' },

  // Text colors
  textTitle: { cssVar: '--text-title', description: 'Title text color (hex)' },
  textSubtitle: { cssVar: '--text-subtitle', description: 'Subtitle text color (hex)' },
  textBody: { cssVar: '--text-body', description: 'Body text color (hex)' },
  textLabel: { cssVar: '--text-label', description: 'Label text color (hex)' },

  // Accent colors
  accent: { cssVar: '--color-accent', description: 'Accent/brand color for interactive elements (hex)' },
  accentHover: { cssVar: '--color-accent-hover', description: 'Accent color on hover - slightly darker/lighter than accent (hex)' },
  accentText: { cssVar: '--color-accent-text', description: 'Text color on accent background - must be readable (hex)' },

  // Semantic colors
  success: { cssVar: '--color-success', description: 'Success state color (hex)' },
  successLight: { cssVar: '--color-success-light', description: 'Light success background color (hex)' },
  warning: { cssVar: '--color-warning', description: 'Warning state color (hex)' },
  warningLight: { cssVar: '--color-warning-light', description: 'Light warning background color (hex)' },
  error: { cssVar: '--color-error', description: 'Error state color (hex)' },
  errorLight: { cssVar: '--color-error-light', description: 'Light error background color (hex)' },
  info: { cssVar: '--color-info', description: 'Info state color (hex)' },
  infoLight: { cssVar: '--color-info-light', description: 'Light info background color (hex)' },
} as const satisfies Record<string, ThemeVariableDefinition>;

export const THEME_BORDER_RADIUS = {
  sm: { cssVar: '--radius-sm', description: 'Small border radius (e.g., "0.125rem", "0")' },
  md: { cssVar: '--radius-md', description: 'Medium border radius (e.g., "0.375rem")' },
  lg: { cssVar: '--radius-lg', description: 'Large border radius (e.g., "0.5rem")' },
  xl: { cssVar: '--radius-xl', description: 'Extra large border radius (e.g., "0.75rem")' },
  '2xl': { cssVar: '--radius-2xl', description: '2X large border radius (e.g., "1rem")' },
  full: { cssVar: '--radius-full', description: 'Full border radius for circles (e.g., "9999px")' },
} as const satisfies Record<string, ThemeVariableDefinition>;

export const THEME_SHADOWS = {
  primary: { cssVar: '--shadow-primary', description: 'Primary shadow for cards/panels (e.g., "0 4px 6px -1px rgb(0 0 0 / 0.1)" for modern, "6px 6px 0px #000000" for neubrutalism)' },
  secondary: { cssVar: '--shadow-secondary', description: 'Secondary shadow for buttons (e.g., "0 2px 4px -1px rgb(0 0 0 / 0.06)" for modern, "4px 4px 0px #000000" for neubrutalism)' },
  tertiary: { cssVar: '--shadow-tertiary', description: 'Tertiary shadow for inputs (e.g., "0 1px 2px 0 rgb(0 0 0 / 0.05)" for modern, "2px 2px 0px #000000" for neubrutalism)' },
} as const satisfies Record<string, ThemeVariableDefinition>;

export const THEME_TYPOGRAPHY = {
  fontFamily: { cssVar: '--font-family', description: 'Font family (e.g., "Inter, sans-serif", "Georgia, serif", "monospace")' },
} as const satisfies Record<string, ThemeVariableDefinition>;

export const THEME_BORDERS = {
  primary: { cssVar: '--border-primary', description: 'Primary border for cards/panels (e.g., "0 solid transparent" for modern, "3px solid #000000" for neubrutalism)' },
  secondary: { cssVar: '--border-secondary', description: 'Secondary border for buttons (e.g., "0 solid transparent" for modern, "2px solid #000000" for neubrutalism)' },
  tertiary: { cssVar: '--border-tertiary', description: 'Tertiary border for inputs (e.g., "1px solid #e5e5e5" for modern, "1px solid #000000" for neubrutalism)' },
} as const satisfies Record<string, ThemeVariableDefinition>;

// ============================================================================
// Type Inference
// ============================================================================

export type ThemeColorKey = keyof typeof THEME_COLORS;
export type ThemeBorderRadiusKey = keyof typeof THEME_BORDER_RADIUS;
export type ThemeShadowKey = keyof typeof THEME_SHADOWS;
export type ThemeTypographyKey = keyof typeof THEME_TYPOGRAPHY;
export type ThemeBorderKey = keyof typeof THEME_BORDERS;

export type ThemeColors = { [K in ThemeColorKey]?: string };
export type ThemeBorderRadius = { [K in ThemeBorderRadiusKey]?: string };
export type ThemeShadows = { [K in ThemeShadowKey]?: string };
export type ThemeTypography = { [K in ThemeTypographyKey]?: string };
export type ThemeBorders = { [K in ThemeBorderKey]?: string };

export interface Theme {
  colors?: ThemeColors;
  borderRadius?: ThemeBorderRadius;
  shadows?: ThemeShadows;
  typography?: ThemeTypography;
  borders?: ThemeBorders;
}

// ============================================================================
// Property Map Generation
// ============================================================================

function buildPropertyMapForCategory(
  config: Record<string, ThemeVariableDefinition>,
  prefix: string
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    result[`${prefix}.${key}`] = value.cssVar;
  }
  return result;
}

export const themePropertyMap: Record<string, string> = {
  ...buildPropertyMapForCategory(THEME_COLORS, 'colors'),
  ...buildPropertyMapForCategory(THEME_BORDER_RADIUS, 'borderRadius'),
  ...buildPropertyMapForCategory(THEME_SHADOWS, 'shadows'),
  ...buildPropertyMapForCategory(THEME_TYPOGRAPHY, 'typography'),
  ...buildPropertyMapForCategory(THEME_BORDERS, 'borders'),
};

// ============================================================================
// Key Arrays for Iteration
// ============================================================================

export const colorKeys = Object.keys(THEME_COLORS) as ThemeColorKey[];
export const borderRadiusKeys = Object.keys(THEME_BORDER_RADIUS) as ThemeBorderRadiusKey[];
export const shadowKeys = Object.keys(THEME_SHADOWS) as ThemeShadowKey[];
export const typographyKeys = Object.keys(THEME_TYPOGRAPHY) as ThemeTypographyKey[];
export const borderKeys = Object.keys(THEME_BORDERS) as ThemeBorderKey[];

// All theme categories (for validation)
export const themeCategories = ['colors', 'borderRadius', 'shadows', 'typography', 'borders'] as const;
export type ThemeCategory = typeof themeCategories[number];

// ============================================================================
// LLM System Prompt Generation
// ============================================================================

function buildVariableListForPrompt(
  config: Record<string, ThemeVariableDefinition>,
  categoryName: string
): string {
  const keys = Object.keys(config).join(', ');
  return `  - ${categoryName}: ${keys}`;
}

function buildJsonSchemaForPrompt(
  config: Record<string, ThemeVariableDefinition>
): string {
  return Object.keys(config)
    .map(key => `    "${key}"?: string,`)
    .join('\n');
}

export function generateSystemPromptVariables(): string {
  return `Available CSS Variables:
- Colors:
${buildVariableListForPrompt(THEME_COLORS, 'Surface')} (primary, secondary, tertiary, sidemenu)
${buildVariableListForPrompt({ textTitle: THEME_COLORS.textTitle, textSubtitle: THEME_COLORS.textSubtitle, textBody: THEME_COLORS.textBody, textLabel: THEME_COLORS.textLabel }, 'Text')}
${buildVariableListForPrompt({ accent: THEME_COLORS.accent, accentHover: THEME_COLORS.accentHover, accentText: THEME_COLORS.accentText }, 'Accent')}
- Border Radius: ${Object.keys(THEME_BORDER_RADIUS).join(', ')}
- Shadows: ${Object.keys(THEME_SHADOWS).join(', ')}
- Typography: ${Object.keys(THEME_TYPOGRAPHY).join(', ')}
- Borders: ${Object.keys(THEME_BORDERS).join(', ')}`;
}

export function generateJsonSchemaForPrompt(): string {
  return `{
  "colors": {
${buildJsonSchemaForPrompt(THEME_COLORS)}
  },
  "borderRadius": {
${buildJsonSchemaForPrompt(THEME_BORDER_RADIUS)}
  },
  "shadows": {
${buildJsonSchemaForPrompt(THEME_SHADOWS)}
  },
  "typography": {
${buildJsonSchemaForPrompt(THEME_TYPOGRAPHY)}
  },
  "borders": {
${buildJsonSchemaForPrompt(THEME_BORDERS)}
  }
}`;
}

// ============================================================================
// Gemini Function Schema Generation
// ============================================================================

function buildGeminiFunctionProperties(
  config: Record<string, ThemeVariableDefinition>
): Record<string, { type: typeof Type.STRING; description: string }> {
  const result: Record<string, { type: typeof Type.STRING; description: string }> = {};
  for (const [key, value] of Object.entries(config)) {
    result[key] = {
      type: Type.STRING,
      description: value.description,
    };
  }
  return result;
}

export function generateGeminiFunctionSchema() {
  return {
    colors: {
      type: Type.OBJECT,
      description: 'Color scheme for the theme. Use hex color values.',
      properties: buildGeminiFunctionProperties(THEME_COLORS),
    },
    borderRadius: {
      type: Type.OBJECT,
      description: 'Border radius values for rounded corners. Use CSS units like "0.375rem" or "0" for sharp corners.',
      properties: buildGeminiFunctionProperties(THEME_BORDER_RADIUS),
    },
    shadows: {
      type: Type.OBJECT,
      description: 'Box shadow values for depth. Use CSS box-shadow syntax.',
      properties: buildGeminiFunctionProperties(THEME_SHADOWS),
    },
    typography: {
      type: Type.OBJECT,
      description: 'Typography settings. Use CSS font-family syntax.',
      properties: buildGeminiFunctionProperties(THEME_TYPOGRAPHY),
    },
    borders: {
      type: Type.OBJECT,
      description: 'Border settings for elements. Use for neubrutalism style with thick black borders.',
      properties: buildGeminiFunctionProperties(THEME_BORDERS),
    },
  };
}

// ============================================================================
// Guidelines for LLM
// ============================================================================

export const THEME_GUIDELINES = `Theme Generation Guidelines:
- Use hex colors for all color values (e.g., "#9333ea" not "purple")
- For dark themes: use dark colors (#0a0a0a, #171717) for surfaces, light colors (#ffffff, #e5e5e5) for text
- For light themes: use light colors (#f9fafb, #ffffff) for surfaces, dark colors (#111827, #374151) for text
- ALWAYS include sidemenu color based on the UI style:
  * Playful/bold UIs (like Gumroad): Look for accent colors in illustrations, icons, or decorative elements - use these for sidemenu (e.g., yellow from illustrations → sidemenu: "#fde047")
  * Minimal/clean UIs with uniform backgrounds: sidemenu should MATCH the primary background color for a cohesive look (e.g., if primary is "#e5e5e5", sidemenu should also be "#e5e5e5")
  * DO NOT default to white (#ffffff) or black (#000000) unless that matches the actual UI aesthetic
- Accent colors should have sufficient contrast with backgrounds
- accentHover should be slightly darker (dark themes) or lighter (light themes) than accent for hover states
- accentText should be readable on accent background (usually white on dark accents, black on light accents)
- For "square" or "sharp" requests, use "0" for border radius
- For "rounded" requests, use larger radius values (0.5rem - 1rem)
- Only include properties that need to change; you can omit properties to keep them unchanged

Hierarchical Shadows & Borders:
- Both shadows and borders use a hierarchical system: primary (cards/panels), secondary (buttons), tertiary (inputs)
- primary = most prominent (largest shadow, thickest border)
- secondary = medium prominence
- tertiary = subtle (smallest shadow, thinnest border)

Shadow Styles:
- Modern/soft: use blur shadows (e.g., primary: "0 4px 6px -1px rgb(0 0 0 / 0.1)", secondary: "0 2px 4px -1px rgb(0 0 0 / 0.06)")
- Neubrutalism: use hard offset shadows with NO blur (e.g., primary: "6px 6px 0px #000000", secondary: "4px 4px 0px #000000")

Border Styles (CSS shorthand: width style color):
- Modern: use transparent or subtle borders (e.g., primary: "0 solid transparent", tertiary: "1px solid #e5e5e5")
- Neubrutalism: use thick black borders (e.g., primary: "3px solid #000000", secondary: "2px solid #000000")
- Classic neubrutalism: sharp corners (borderRadius: 0) + bold colors + hard offset shadows + thick black borders
- Soft brutalism / playful neubrutalism: thick black borders + hard offset shadows BUT WITH rounded corners (0.5rem - 1rem). Common in modern playful brands like Gumroad, Figma, Notion.

CRITICAL - Image Analysis for UI Screenshots:
- When analyzing UI screenshots, detect borders and shadows INDEPENDENTLY from corner style
- A UI can have thick borders AND rounded corners - this is "soft brutalism"
- Look for these visual cues:
  * Border thickness: Are card/button borders visible and thick (2-3px black)? → Use brutalist borders
  * Shadow style: Are shadows hard offsets with no blur? → Use brutalist shadows (e.g., "4px 4px 0px #000000")
  * Corner style: Are corners sharp or rounded? → Set borderRadius accordingly (independent from border/shadow choice)
- Do NOT assume that thick borders require sharp corners - detect each property separately`;
