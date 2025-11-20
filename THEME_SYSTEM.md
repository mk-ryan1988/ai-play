# Theme System Documentation

A composable, CSS variable-based theming system with JavaScript API for dynamic theme updates.

## Overview

The theme system uses CSS variables integrated with Tailwind CSS, providing a flexible way to dynamically update the app's visual appearance at runtime. This is ideal for:
- User-customizable themes
- LLM-driven theme generation
- Per-organization branding
- Dark/light mode customization

## Architecture

### 1. CSS Variables (`app/globals.css`)
All themeable properties are defined as CSS variables with automatic light/dark mode support:

**Surface Colors:**
- `--color-primary` - Outermost layer
- `--color-secondary` - Mid-layer
- `--color-tertiary` - Top-layer

**Text Colors:**
- `--text-title`, `--text-subtitle`, `--text-body`, `--text-label`

**Accent/Brand Colors:**
- `--color-accent`, `--color-accent-hover`, `--color-accent-text`

**Semantic Colors:**
- `--color-success`, `--color-warning`, `--color-error`, `--color-info`
- Each with `-light` variant for backgrounds

**Border Radius:**
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-full`

**Shadows:**
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`

### 2. Tailwind Integration (`tailwind.config.ts`)
CSS variables are mapped to Tailwind classes:

```tsx
// Colors
className="bg-accent text-accent-text"  // Uses --color-accent
className="text-success"                  // Uses --color-success
className="border-error"                  // Uses --color-error

// Border Radius (existing classes now use CSS variables)
className="rounded-lg"    // Uses --radius-lg
className="rounded-xl"    // Uses --radius-xl

// Shadows
className="shadow-md"     // Uses --shadow-md
```

### 3. JavaScript Theme API (`utils/theme.ts`)
Programmatic access to update themes dynamically.

## Usage

### Using the Theme Context (Recommended)

Wrap your app with `ThemeProvider` and use the `useTheme` hook:

```tsx
// In your root layout (app/layout.tsx)
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider autoLoad={true}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// In any component
import { useTheme } from '@/contexts/ThemeContext';

export default function MyComponent() {
  const { updateTheme, resetTheme, saveTheme } = useTheme();

  const changeAccentColor = () => {
    updateTheme({
      colors: {
        accent: '#9333ea',        // purple-600
        accentHover: '#7e22ce',   // purple-700
      }
    });
  };

  return (
    <button onClick={changeAccentColor} className="bg-accent">
      Click me
    </button>
  );
}
```

### Direct API Usage (No Context)

```tsx
import { updateTheme, updateThemeVariable, resetTheme } from '@/utils/theme';

// Update entire theme
updateTheme({
  colors: {
    accent: '#ea580c',
    success: '#10b981',
  },
  borderRadius: {
    lg: '1rem',
  }
});

// Update single variable
updateThemeVariable('--color-accent', '#9333ea');

// Reset to defaults
resetTheme();
```

### Theme Persistence

```tsx
import { saveTheme, applySavedTheme } from '@/utils/theme';

// Save current theme to localStorage
saveTheme('my-theme-key');

// Load and apply saved theme
applySavedTheme('my-theme-key');
```

### Using with ThemeProvider (Auto-persistence)

```tsx
const { saveTheme, loadTheme } = useTheme();

// Save current state
saveTheme();

// Reload from storage
loadTheme();
```

## LLM Integration Example

Here's how to integrate with an LLM for natural language theme updates:

```tsx
import { updateTheme } from '@/utils/theme';

async function updateThemeFromPrompt(userPrompt: string) {
  // 1. Send prompt to your LLM
  const response = await fetch('/api/generate-theme', {
    method: 'POST',
    body: JSON.stringify({ prompt: userPrompt }),
  });

  const themeData = await response.json();

  // 2. Apply the LLM-generated theme
  updateTheme(themeData);
}

// Usage:
updateThemeFromPrompt("Make the app feel warm with orange accents");
// LLM might return:
// {
//   colors: {
//     accent: '#ea580c',
//     accentHover: '#c2410c',
//   },
//   borderRadius: {
//     lg: '1rem',
//   }
// }
```

## API Reference

### `updateTheme(theme: Theme)`
Updates multiple theme properties at once.

```tsx
updateTheme({
  colors: {
    primary: '#f3f4f6',
    accent: '#3b82f6',
  },
  borderRadius: {
    lg: '0.75rem',
  },
  shadows: {
    md: '0 4px 6px rgba(0,0,0,0.1)',
  }
});
```

### `updateThemeVariable(property: string, value: string)`
Updates a single CSS variable.

```tsx
updateThemeVariable('--color-accent', '#9333ea');
```

### `getTheme(): Theme`
Returns the current theme as an object.

```tsx
const currentTheme = getTheme();
console.log(currentTheme.colors?.accent); // Current accent color
```

### `resetTheme()`
Resets all theme variables to defaults defined in `globals.css`.

```tsx
resetTheme();
```

### `saveTheme(key?: string)`
Saves current theme to localStorage.

```tsx
saveTheme('user-custom-theme');
```

### `loadTheme(key?: string): Theme | null`
Loads a theme from localStorage.

```tsx
const theme = loadTheme('user-custom-theme');
if (theme) {
  updateTheme(theme);
}
```

### `applySavedTheme(key?: string): boolean`
Loads and applies a saved theme. Returns true if successful.

```tsx
const loaded = applySavedTheme('user-custom-theme');
```

## TypeScript Types

```tsx
interface Theme {
  colors?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
    textTitle?: string;
    textSubtitle?: string;
    textBody?: string;
    textLabel?: string;
    accent?: string;
    accentHover?: string;
    accentText?: string;
    success?: string;
    successLight?: string;
    warning?: string;
    warningLight?: string;
    error?: string;
    errorLight?: string;
    info?: string;
    infoLight?: string;
  };
  borderRadius?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    full?: string;
  };
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}
```

## Demo Component

Check out `/components/ThemeDemo.tsx` for a complete working example with interactive buttons that demonstrate all features.

To use the demo:
1. Import and render the component in any page
2. Click the buttons to see dynamic theme changes
3. Test persistence by saving and reloading

## Common Patterns

### Per-Organization Branding
```tsx
function applyOrganizationTheme(orgId: string) {
  const orgTheme = await fetchOrganizationTheme(orgId);
  updateTheme(orgTheme);
  saveTheme(`org-${orgId}`);
}
```

### User Preferences
```tsx
function UserThemeSettings() {
  const { updateTheme, saveTheme } = useTheme();

  const handleColorChange = (color: string) => {
    updateTheme({ colors: { accent: color } });
    saveTheme('user-preferences');
  };

  return <ColorPicker onChange={handleColorChange} />;
}
```

### LLM Theme Generator
```tsx
function ThemeAssistant() {
  const { updateTheme } = useTheme();
  const [prompt, setPrompt] = useState('');

  const generateTheme = async () => {
    const theme = await generateThemeFromLLM(prompt);
    updateTheme(theme);
  };

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your ideal theme..."
      />
      <button onClick={generateTheme}>Generate</button>
    </div>
  );
}
```

## Best Practices

1. **Always validate color values** when accepting user input
2. **Provide theme presets** as fallbacks for LLM failures
3. **Test in both light and dark mode** when creating themes
4. **Use semantic colors** (success, error, etc.) for consistency
5. **Save themes after updates** to preserve user choices
6. **Reset gracefully** if a theme causes issues

## Migrating Existing Components

Components using hardcoded colors should migrate to the theme system:

**Before:**
```tsx
<div className="bg-blue-600 text-white">
```

**After:**
```tsx
<div className="bg-accent text-accent-text">
```

This makes the component themeable and consistent with the design system.
