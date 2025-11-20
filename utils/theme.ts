/**
 * Theme API - Programmatic access to CSS variable-based theming
 *
 * This utility provides a JavaScript API to dynamically update the app's visual appearance
 * by manipulating CSS variables. Supports light/dark modes and all themeable properties.
 */

// Type definitions for theme properties
export interface ThemeColors {
  // Surface colors
  primary?: string;
  secondary?: string;
  tertiary?: string;

  // Text colors
  textTitle?: string;
  textSubtitle?: string;
  textBody?: string;
  textLabel?: string;

  // Accent colors
  accent?: string;
  accentHover?: string;
  accentText?: string;

  // Semantic colors
  success?: string;
  successLight?: string;
  warning?: string;
  warningLight?: string;
  error?: string;
  errorLight?: string;
  info?: string;
  infoLight?: string;
}

export interface ThemeBorderRadius {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  full?: string;
}

export interface ThemeShadows {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}

export interface Theme {
  colors?: ThemeColors;
  borderRadius?: ThemeBorderRadius;
  shadows?: ThemeShadows;
}

// Map theme object keys to CSS variable names
const themePropertyMap: Record<string, string> = {
  // Colors
  'colors.primary': '--color-primary',
  'colors.secondary': '--color-secondary',
  'colors.tertiary': '--color-tertiary',
  'colors.textTitle': '--text-title',
  'colors.textSubtitle': '--text-subtitle',
  'colors.textBody': '--text-body',
  'colors.textLabel': '--text-label',
  'colors.accent': '--color-accent',
  'colors.accentHover': '--color-accent-hover',
  'colors.accentText': '--color-accent-text',
  'colors.success': '--color-success',
  'colors.successLight': '--color-success-light',
  'colors.warning': '--color-warning',
  'colors.warningLight': '--color-warning-light',
  'colors.error': '--color-error',
  'colors.errorLight': '--color-error-light',
  'colors.info': '--color-info',
  'colors.infoLight': '--color-info-light',

  // Border Radius
  'borderRadius.sm': '--radius-sm',
  'borderRadius.md': '--radius-md',
  'borderRadius.lg': '--radius-lg',
  'borderRadius.xl': '--radius-xl',
  'borderRadius.2xl': '--radius-2xl',
  'borderRadius.full': '--radius-full',

  // Shadows
  'shadows.sm': '--shadow-sm',
  'shadows.md': '--shadow-md',
  'shadows.lg': '--shadow-lg',
  'shadows.xl': '--shadow-xl',
};

/**
 * Get the root element for CSS variable manipulation
 */
function getRoot(): HTMLElement {
  return document.documentElement;
}


/**
 * Update a single CSS variable
 * @param property - The CSS variable name (e.g., '--color-primary')
 * @param value - The new value
 */
export function updateThemeVariable(property: string, value: string): void {
  if (typeof window === 'undefined') return;

  const root = getRoot();
  root.style.setProperty(property, value);
}

/**
 * Update multiple theme properties at once
 * @param theme - Theme object with properties to update
 */
export function updateTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  const root = getRoot();

  // Process colors
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (value !== undefined) {
        const cssVar = themePropertyMap[`colors.${key}`];
        if (cssVar) {
          root.style.setProperty(cssVar, value);
        }
      }
    });
  }

  // Process border radius
  if (theme.borderRadius) {
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      if (value !== undefined) {
        const cssVar = themePropertyMap[`borderRadius.${key}`];
        if (cssVar) {
          root.style.setProperty(cssVar, value);
        }
      }
    });
  }

  // Process shadows
  if (theme.shadows) {
    Object.entries(theme.shadows).forEach(([key, value]) => {
      if (value !== undefined) {
        const cssVar = themePropertyMap[`shadows.${key}`];
        if (cssVar) {
          root.style.setProperty(cssVar, value);
        }
      }
    });
  }
}

/**
 * Get the current value of a CSS variable
 * @param property - The CSS variable name (e.g., '--color-primary')
 * @returns The current value of the CSS variable
 */
export function getThemeVariable(property: string): string {
  if (typeof window === 'undefined') return '';

  const root = getRoot();
  return getComputedStyle(root).getPropertyValue(property).trim();
}

/**
 * Get the current theme as an object
 * @returns Theme object with all current values
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') {
    return {};
  }

  const theme: Theme = {
    colors: {},
    borderRadius: {},
    shadows: {},
  };

  // Get all color values
  const colorKeys: (keyof ThemeColors)[] = [
    'primary', 'secondary', 'tertiary',
    'textTitle', 'textSubtitle', 'textBody', 'textLabel',
    'accent', 'accentHover', 'accentText',
    'success', 'successLight', 'warning', 'warningLight',
    'error', 'errorLight', 'info', 'infoLight'
  ];

  colorKeys.forEach(key => {
    const cssVar = themePropertyMap[`colors.${key}`];
    if (cssVar && theme.colors) {
      theme.colors[key] = getThemeVariable(cssVar);
    }
  });

  // Get all border radius values
  const radiusKeys: (keyof ThemeBorderRadius)[] = ['sm', 'md', 'lg', 'xl', '2xl', 'full'];
  radiusKeys.forEach(key => {
    const cssVar = themePropertyMap[`borderRadius.${key}`];
    if (cssVar && theme.borderRadius) {
      theme.borderRadius[key] = getThemeVariable(cssVar);
    }
  });

  // Get all shadow values
  const shadowKeys: (keyof ThemeShadows)[] = ['sm', 'md', 'lg', 'xl'];
  shadowKeys.forEach(key => {
    const cssVar = themePropertyMap[`shadows.${key}`];
    if (cssVar && theme.shadows) {
      theme.shadows[key] = getThemeVariable(cssVar);
    }
  });

  return theme;
}

/**
 * Reset theme to default values by removing all inline styles
 * This will restore the values defined in globals.css
 */
export function resetTheme(): void {
  if (typeof window === 'undefined') return;

  const root = getRoot();

  // Remove all theme-related CSS variables
  Object.values(themePropertyMap).forEach(cssVar => {
    root.style.removeProperty(cssVar);
  });
}

/**
 * Save the current theme to localStorage
 * @param key - The storage key (default: 'app-theme')
 */
export function saveTheme(key: string = 'app-theme'): void {
  if (typeof window === 'undefined') return;

  const theme = getTheme();
  localStorage.setItem(key, JSON.stringify(theme));
}

/**
 * Load a theme from localStorage
 * @param key - The storage key (default: 'app-theme')
 * @returns The loaded theme or null if not found
 */
export function loadTheme(key: string = 'app-theme'): Theme | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as Theme;
  } catch {
    return null;
  }
}

/**
 * Apply a saved theme from localStorage
 * @param key - The storage key (default: 'app-theme')
 * @returns true if a theme was loaded and applied, false otherwise
 */
export function applySavedTheme(key: string = 'app-theme'): boolean {
  const theme = loadTheme(key);
  if (theme) {
    updateTheme(theme);
    return true;
  }
  return false;
}

/**
 * System prompt for LLM-based theme generation
 * This teaches the LLM about available CSS variables and expected response format
 */
export const THEME_SYSTEM_PROMPT = `You are a theme generation assistant. Based on user requests, you generate theme configurations for a web application.

Available CSS Variables:
- Colors:
  - primary, secondary, tertiary (surface/background colors)
  - textTitle, textSubtitle, textBody, textLabel (text colors)
  - accent, accentHover, accentText (brand/interactive colors)
  - success, successLight, warning, warningLight, error, errorLight, info, infoLight (semantic colors)
- Border Radius:
  - sm, md, lg, xl, 2xl, full (sizing: 0.125rem to 9999px)
- Shadows:
  - sm, md, lg, xl (box shadows)

Response Format:
Return ONLY a valid JSON object matching this TypeScript interface:
{
  "colors": {
    "primary"?: string,      // hex color (e.g., "#f5f5f5")
    "secondary"?: string,
    "tertiary"?: string,
    "textTitle"?: string,
    "textSubtitle"?: string,
    "textBody"?: string,
    "textLabel"?: string,
    "accent"?: string,
    "accentHover"?: string,
    "accentText"?: string,
    "success"?: string,
    "successLight"?: string,
    "warning"?: string,
    "warningLight"?: string,
    "error"?: string,
    "errorLight"?: string,
    "info"?: string,
    "infoLight"?: string
  },
  "borderRadius": {
    "sm"?: string,          // CSS value (e.g., "0.125rem", "0")
    "md"?: string,
    "lg"?: string,
    "xl"?: string,
    "2xl"?: string,
    "full"?: string
  },
  "shadows": {
    "sm"?: string,          // CSS box-shadow value
    "md"?: string,
    "lg"?: string,
    "xl"?: string
  }
}

Guidelines:
- Use hex colors for all color values (e.g., "#9333ea" not "purple")
- For dark themes: use dark colors (900s) for surfaces, light colors (50-300) for text
- For light themes: use light colors (50-100) for surfaces, dark colors (700-900) for text
- Accent colors should have sufficient contrast with backgrounds
- accentHover should be slightly darker/lighter than accent for hover states
- accentText should be readable on accent background
- For "square" or "sharp" requests, use "0" for border radius
- For "rounded" requests, use larger radius values (0.5rem - 1rem)
- Only include properties that need to change; omit unchanged properties

Examples:
Request: "Make it purple, square, and light mode"
Response: {"colors":{"accent":"#9333ea","accentHover":"#7e22ce","accentText":"#ffffff","primary":"#f5f5f5","secondary":"#fafafa","tertiary":"#ffffff","textTitle":"#171717","textSubtitle":"#404040","textBody":"#525252","textLabel":"#737373"},"borderRadius":{"sm":"0","md":"0","lg":"0.125rem","xl":"0.125rem","2xl":"0.25rem"}}

Request: "Dark mode with blue accents and rounded corners"
Response: {"colors":{"accent":"#3b82f6","accentHover":"#2563eb","accentText":"#ffffff","primary":"#0a0a0a","secondary":"#171717","tertiary":"#262626","textTitle":"#ffffff","textSubtitle":"#e5e5e5","textBody":"#d4d4d4","textLabel":"#a3a3a3"},"borderRadius":{"sm":"0.375rem","md":"0.5rem","lg":"0.75rem","xl":"1rem","2xl":"1.5rem"}}`;

/**
 * Parse LLM response into a Theme object
 * @param response - Raw response from LLM
 * @returns Parsed Theme object or null if parsing fails
 */
export function parseThemeResponse(response: string): Theme | null {
  try {
    // Extract JSON from response (in case LLM includes explanation text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as Theme;

    // Basic validation
    if (!parsed.colors && !parsed.borderRadius && !parsed.shadows) {
      console.error('Invalid theme structure: no valid properties found');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse theme response:', error);
    return null;
  }
}

/**
 * Generate and apply a theme from a natural language prompt
 * @param prompt - User's natural language description (e.g., "make it purple and dark")
 * @returns The generated Theme object
 */
export async function generateThemeFromPrompt(prompt: string): Promise<Theme> {
  console.log('Theme generation prompt:', prompt);

  try {
    // Call our API route
    const response = await fetch('/api/theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.theme || {};
  } catch (error) {
    console.error('Failed to generate theme:', error);
    return {};
  }
}
