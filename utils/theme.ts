/**
 * Theme API - Programmatic access to CSS variable-based theming
 *
 * This utility provides a JavaScript API to dynamically update the app's visual appearance
 * by manipulating CSS variables. Supports light/dark modes and all themeable properties.
 */

// Import from single source of truth
import {
  themePropertyMap,
  colorKeys,
  borderRadiusKeys,
  shadowKeys,
  typographyKeys,
  borderKeys,
  themeCategories,
  generateSystemPromptVariables,
  generateJsonSchemaForPrompt,
  THEME_GUIDELINES,
} from './theme-config';

// Re-export types and map from config
export type { Theme, ThemeColors, ThemeBorderRadius, ThemeShadows, ThemeTypography, ThemeBorders } from './theme-config';
export { themePropertyMap } from './theme-config';

// Import types for internal use
import type { Theme } from './theme-config';

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

  // Process typography
  if (theme.typography) {
    Object.entries(theme.typography).forEach(([key, value]) => {
      if (value !== undefined) {
        const cssVar = themePropertyMap[`typography.${key}`];
        if (cssVar) {
          root.style.setProperty(cssVar, value);
        }
      }
    });
  }

  // Process borders
  if (theme.borders) {
    Object.entries(theme.borders).forEach(([key, value]) => {
      if (value !== undefined) {
        const cssVar = themePropertyMap[`borders.${key}`];
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
 * Check if a hex color is light or dark using luminance calculation
 * Uses the relative luminance formula for accessibility (WCAG)
 * @param hex - Hex color string (e.g., "#ffffff" or "ffffff")
 * @returns true if the color is light, false if dark
 */
export function isLightColor(hex: string): boolean {
  if (!hex || hex === 'transparent') return true;
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ============================================================================
// WCAG 2.1 Contrast Utilities
// ============================================================================

/**
 * Convert hex color to RGB values (0-255)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

/**
 * Linearize an sRGB channel value per WCAG 2.1 spec
 * @param channel - Channel value (0-255)
 */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance per WCAG 2.1
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Calculate WCAG contrast ratio between two colors
 * Ratio = (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter color
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h, s, l };
}

/**
 * Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Adjust a foreground color to meet minimum contrast ratio against a background
 * Uses binary search on HSL lightness to find the minimal adjustment
 */
function adjustColorForContrast(
  foreground: string,
  background: string,
  minRatio: number
): string {
  const currentRatio = getContrastRatio(foreground, background);
  if (currentRatio >= minRatio) return foreground;

  const { r, g, b } = hexToRgb(foreground);
  const { h, s } = rgbToHsl(r, g, b);
  const bgLuminance = getRelativeLuminance(background);

  // Determine direction: if bg is dark, make fg lighter; if bg is light, make fg darker
  const shouldLighten = bgLuminance < 0.5;

  let low = shouldLighten ? 0.5 : 0;
  let high = shouldLighten ? 1 : 0.5;
  let bestL = shouldLighten ? 1 : 0;

  // Binary search for the minimum adjustment that meets the contrast requirement
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    const testColor = hslToHex(h, s, mid);
    const ratio = getContrastRatio(testColor, background);

    if (ratio >= minRatio) {
      bestL = mid;
      if (shouldLighten) {
        high = mid; // Try darker (closer to original)
      } else {
        low = mid; // Try lighter (closer to original)
      }
    } else {
      if (shouldLighten) {
        low = mid; // Need to go lighter
      } else {
        high = mid; // Need to go darker
      }
    }
  }

  return hslToHex(h, s, bestL);
}

// ============================================================================
// Accessibility Check
// ============================================================================

export interface AccessibilityAdjustment {
  colorKey: string;
  originalValue: string;
  adjustedValue: string;
  contrastWith: string;
  originalRatio: number;
  adjustedRatio: number;
  requirement: number;
}

export interface AccessibilityCheckResult {
  passed: boolean;
  adjustments: AccessibilityAdjustment[];
  adjustedTheme: Theme;
}

/**
 * Color pairs to check for WCAG AA compliance
 * Format: [foregroundKey, backgroundKey, minRatio]
 */
const CONTRAST_PAIRS: [string, string, number][] = [
  ['textTitle', 'primary', 4.5],
  ['textSubtitle', 'secondary', 4.5],
  ['textBody', 'primary', 4.5],
  ['textBody', 'secondary', 4.5],
  ['textLabel', 'tertiary', 4.5],
  ['accentText', 'accent', 4.5],
  ['success', 'primary', 3],
  ['warning', 'primary', 3],
  ['error', 'primary', 3],
  ['accent', 'primary', 3],
];

/**
 * Check theme colors for WCAG AA accessibility compliance
 * and auto-adjust colors that fail contrast requirements
 */
export function checkAccessibility(theme: Theme): AccessibilityCheckResult {
  const adjustments: AccessibilityAdjustment[] = [];
  const adjustedTheme: Theme = JSON.parse(JSON.stringify(theme));
  const colors = theme.colors || {};
  const adjustedColors = adjustedTheme.colors || {};

  for (const [fgKey, bgKey, minRatio] of CONTRAST_PAIRS) {
    const fgColor = colors[fgKey as keyof typeof colors];
    const bgColor = colors[bgKey as keyof typeof colors];

    if (!fgColor || !bgColor) continue;

    const originalRatio = getContrastRatio(fgColor, bgColor);

    if (originalRatio < minRatio) {
      const adjustedColor = adjustColorForContrast(fgColor, bgColor, minRatio);
      const adjustedRatio = getContrastRatio(adjustedColor, bgColor);

      (adjustedColors as Record<string, string>)[fgKey] = adjustedColor;

      adjustments.push({
        colorKey: fgKey,
        originalValue: fgColor,
        adjustedValue: adjustedColor,
        contrastWith: bgKey,
        originalRatio: Math.round(originalRatio * 100) / 100,
        adjustedRatio: Math.round(adjustedRatio * 100) / 100,
        requirement: minRatio,
      });
    }
  }

  return {
    passed: adjustments.length === 0,
    adjustments,
    adjustedTheme,
  };
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
    typography: {},
    borders: {},
  };

  // Get all color values (using keys from config)
  colorKeys.forEach(key => {
    const cssVar = themePropertyMap[`colors.${key}`];
    if (cssVar && theme.colors) {
      (theme.colors as Record<string, string>)[key] = getThemeVariable(cssVar);
    }
  });

  // Get all border radius values (using keys from config)
  borderRadiusKeys.forEach(key => {
    const cssVar = themePropertyMap[`borderRadius.${key}`];
    if (cssVar && theme.borderRadius) {
      (theme.borderRadius as Record<string, string>)[key] = getThemeVariable(cssVar);
    }
  });

  // Get all shadow values (using keys from config)
  shadowKeys.forEach(key => {
    const cssVar = themePropertyMap[`shadows.${key}`];
    if (cssVar && theme.shadows) {
      (theme.shadows as Record<string, string>)[key] = getThemeVariable(cssVar);
    }
  });

  // Get all typography values (using keys from config)
  typographyKeys.forEach(key => {
    const cssVar = themePropertyMap[`typography.${key}`];
    if (cssVar && theme.typography) {
      (theme.typography as Record<string, string>)[key] = getThemeVariable(cssVar);
    }
  });

  // Get all border values (using keys from config)
  borderKeys.forEach(key => {
    const cssVar = themePropertyMap[`borders.${key}`];
    if (cssVar && theme.borders) {
      (theme.borders as Record<string, string>)[key] = getThemeVariable(cssVar);
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
 * System prompt for LLM-based theme generation (JSON style)
 * Auto-generated from theme-config.ts
 */
export const THEME_SYSTEM_PROMPT = `You are a theme generation assistant. Based on user requests, you generate theme configurations for a web application.

CRITICAL: Your response must be ONLY valid, complete JSON - no explanations, no other text before or after. Start with { and end with }.

${generateSystemPromptVariables()}

Response Format:
Return ONLY a valid JSON object matching this structure:
${generateJsonSchemaForPrompt()}

${THEME_GUIDELINES}

Image Analysis Guidelines:
When analyzing an image to generate a theme, consider the COMPLETE visual aesthetic:
- Colors: Extract dominant colors, accent colors, and background tones
- Border Radius: Match the visual style
  * Angular/geometric/tech/futuristic imagery → sharp corners (0 or minimal radius)
  * Organic/natural/friendly imagery → rounded corners (0.5rem - 1rem)
  * Modern/clean UI → moderate rounds (0.25rem - 0.5rem)
- Borders: Look at card/button borders in UI screenshots
  * Thin/invisible borders → modern style ("1px solid #e5e5e5" or transparent)
  * Thick black borders (2-3px) → brutalist style ("2px solid #000000")
- Shadows: Match the mood AND style
  * Soft blurred shadows → modern ("0 4px 6px -1px rgb(0 0 0 / 0.1)")
  * Hard offset shadows (no blur) → brutalist ("4px 4px 0px #000000")
  * Soft/minimal imagery → subtle or no shadows
- CRITICAL: Detect borders, shadows, and corners INDEPENDENTLY!
  * Thick borders + hard shadows + rounded corners = "soft brutalism" (Gumroad, Figma style)
  * Don't assume thick borders require sharp corners
- Always include borderRadius when analyzing images - it's a key part of the aesthetic!

Examples:
Request: "Make it purple, square, and light mode"
Response: {"colors":{"accent":"#9333ea","accentHover":"#7e22ce","accentText":"#ffffff","primary":"#f5f5f5","secondary":"#fafafa","tertiary":"#ffffff","sidemenu":"#fafafa","textTitle":"#171717","textSubtitle":"#404040","textBody":"#525252","textLabel":"#737373"},"borderRadius":{"sm":"0","md":"0","lg":"0.125rem","xl":"0.125rem","2xl":"0.25rem"},"shadows":{"primary":"0 4px 6px -1px rgb(0 0 0 / 0.1)","secondary":"0 2px 4px -1px rgb(0 0 0 / 0.06)","tertiary":"0 1px 2px 0 rgb(0 0 0 / 0.05)"},"borders":{"primary":"0 solid transparent","secondary":"0 solid transparent","tertiary":"1px solid #e5e5e5"}}

Request: "Neubrutalism theme"
Response: {"colors":{"accent":"#ff5252","accentHover":"#e64545","accentText":"#000000","primary":"#ffffff","secondary":"#f5f5f5","tertiary":"#ffffff","sidemenu":"#ffde59","textTitle":"#000000","textSubtitle":"#1a1a1a","textBody":"#262626","textLabel":"#525252"},"borderRadius":{"sm":"0","md":"0","lg":"0","xl":"0","2xl":"0"},"shadows":{"primary":"6px 6px 0px #000000","secondary":"4px 4px 0px #000000","tertiary":"2px 2px 0px #000000"},"borders":{"primary":"3px solid #000000","secondary":"2px solid #000000","tertiary":"1px solid #000000"}}

Request: "Soft brutalism / Gumroad style with pink accent"
Response: {"colors":{"accent":"#ff90e8","accentHover":"#ff6ad5","accentText":"#000000","primary":"#f5f5f5","secondary":"#ffffff","tertiary":"#f0f0f0","sidemenu":"#fde047","textTitle":"#000000","textSubtitle":"#1f2937","textBody":"#374151","textLabel":"#6b7280"},"borderRadius":{"sm":"0.375rem","md":"0.5rem","lg":"0.75rem","xl":"1rem","2xl":"1.5rem"},"shadows":{"primary":"4px 4px 0px #000000","secondary":"3px 3px 0px #000000","tertiary":"none"},"borders":{"primary":"2px solid #000000","secondary":"2px solid #000000","tertiary":"1px solid #d1d5db"}}`;

/**
 * Parse LLM response into a Theme object
 * @param response - Raw response from LLM
 * @returns Parsed Theme object or null if parsing fails
 */
export function parseThemeResponse(response: string): Theme | null {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Extract JSON from response (in case LLM includes explanation text)
    const jsonMatch = cleaned.match(/\{[\s\S]*?\}(?=\s*$|$)/);
    if (!jsonMatch) {
      console.error('No JSON found in response');
      console.error('Response:', response.substring(0, 500));
      return null;
    }

    let jsonStr = jsonMatch[0];

    // Try to fix incomplete JSON (missing closing braces)
    const openBraces = (jsonStr.match(/\{/g) || []).length;
    const closeBraces = (jsonStr.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      console.log('Attempting to fix incomplete JSON...');
      jsonStr += '}'.repeat(openBraces - closeBraces);
    }

    const parsed = JSON.parse(jsonStr) as Theme;

    // Basic validation - check if at least one valid theme category exists (derived from config)
    const hasValidProperty = themeCategories.some(
      category => parsed[category] && Object.keys(parsed[category] as object).length > 0
    );

    if (!hasValidProperty) {
      console.error('Invalid theme structure: no valid properties found');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse theme response:', error);
    console.error('Response:', response.substring(0, 500));
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
