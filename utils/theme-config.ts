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
  sm: { cssVar: '--shadow-sm', description: 'Small shadow (e.g., "0 1px 2px 0 rgb(0 0 0 / 0.05)")' },
  md: { cssVar: '--shadow-md', description: 'Medium shadow' },
  lg: { cssVar: '--shadow-lg', description: 'Large shadow' },
  xl: { cssVar: '--shadow-xl', description: 'Extra large shadow' },
} as const satisfies Record<string, ThemeVariableDefinition>;

// ============================================================================
// Type Inference
// ============================================================================

export type ThemeColorKey = keyof typeof THEME_COLORS;
export type ThemeBorderRadiusKey = keyof typeof THEME_BORDER_RADIUS;
export type ThemeShadowKey = keyof typeof THEME_SHADOWS;

export type ThemeColors = { [K in ThemeColorKey]?: string };
export type ThemeBorderRadius = { [K in ThemeBorderRadiusKey]?: string };
export type ThemeShadows = { [K in ThemeShadowKey]?: string };

export interface Theme {
  colors?: ThemeColors;
  borderRadius?: ThemeBorderRadius;
  shadows?: ThemeShadows;
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
};

// ============================================================================
// Key Arrays for Iteration
// ============================================================================

export const colorKeys = Object.keys(THEME_COLORS) as ThemeColorKey[];
export const borderRadiusKeys = Object.keys(THEME_BORDER_RADIUS) as ThemeBorderRadiusKey[];
export const shadowKeys = Object.keys(THEME_SHADOWS) as ThemeShadowKey[];

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
- Shadows: ${Object.keys(THEME_SHADOWS).join(', ')}`;
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
  };
}

// ============================================================================
// Guidelines for LLM
// ============================================================================

export const THEME_GUIDELINES = `Theme Generation Guidelines:
- Use hex colors for all color values (e.g., "#9333ea" not "purple")
- For dark themes: use dark colors (#0a0a0a, #171717) for surfaces, light colors (#ffffff, #e5e5e5) for text
- For light themes: use light colors (#f9fafb, #ffffff) for surfaces, dark colors (#111827, #374151) for text
- ALWAYS include sidemenu color - it should complement the primary/secondary colors (same or slightly different shade)
- Accent colors should have sufficient contrast with backgrounds
- accentHover should be slightly darker (dark themes) or lighter (light themes) than accent for hover states
- accentText should be readable on accent background (usually white on dark accents, black on light accents)
- For "square" or "sharp" requests, use "0" for border radius
- For "rounded" requests, use larger radius values (0.5rem - 1rem)
- Only include properties that need to change; you can omit properties to keep them unchanged`;
