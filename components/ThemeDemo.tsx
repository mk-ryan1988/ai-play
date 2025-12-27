'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Badge from '@/components/ui/Badge';

/**
 * ThemeDemo - Example component showing how to use the Theme API
 *
 * This component demonstrates:
 * 1. Using the ThemeContext hook
 * 2. Updating individual colors
 * 3. Updating entire themes
 * 4. Saving/loading themes
 * 5. Resetting to defaults
 */
export default function ThemeDemo() {
  const { updateTheme, resetTheme, saveTheme, updateVariable } = useTheme();

  // Example: Update accent color to purple
  const makeItPurple = () => {
    updateTheme({
      colors: {
        accent: '#9333ea', // purple-600
        accentHover: '#7e22ce', // purple-700
      },
    });
  };

  // Example: Update accent color to orange
  const makeItOrange = () => {
    updateTheme({
      colors: {
        accent: '#ea580c', // orange-600
        accentHover: '#c2410c', // orange-700
      },
    });
  };

  // Example: Make everything more rounded
  const makeItRounded = () => {
    updateTheme({
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },
    });
  };

  // Example: Make everything sharp (no border radius)
  const makeItSharp = () => {
    updateTheme({
      borderRadius: {
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
      },
    });
  };

  // Example: Update individual CSS variable
  const updatePrimaryBackground = () => {
    updateVariable('--color-primary', '#fef3c7'); // yellow-100
  };

  // Example: Create a "forest" theme
  const applyForestTheme = () => {
    updateTheme({
      colors: {
        accent: '#059669', // green-600
        accentHover: '#047857', // green-700
        success: '#10b981', // green-500
        warning: '#f59e0b', // amber-500
        error: '#dc2626', // red-600
        info: '#3b82f6', // blue-500
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
    });
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold text-title mb-4">Theme API Demo</h2>
        <p className="text-body mb-6">
          This component demonstrates the theme API. Try clicking the buttons below to see
          dynamic theme changes.
        </p>
      </div>

      {/* Color Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-subtitle">Accent Colors</h3>
        <div className="flex gap-4">
          <button
            onClick={makeItPurple}
            className="px-4 py-2 bg-accent text-accent-text rounded-lg border-secondary shadow-secondary hover:bg-accent-hover transition-colors"
          >
            Make it Purple
          </button>
          <button
            onClick={makeItOrange}
            className="px-4 py-2 bg-accent text-accent-text rounded-lg border-secondary shadow-secondary hover:bg-accent-hover transition-colors"
          >
            Make it Orange
          </button>
          <button
            onClick={updatePrimaryBackground}
            className="px-4 py-2 bg-secondary text-title border-secondary shadow-secondary rounded-lg hover:bg-tertiary transition-colors"
          >
            Update Background
          </button>
        </div>
      </div>

      {/* Border Radius Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-subtitle">Border Radius</h3>
        <div className="flex gap-4">
          <button
            onClick={makeItRounded}
            className="px-4 py-2 bg-secondary text-title border-secondary shadow-secondary rounded-lg hover:bg-tertiary transition-colors"
          >
            More Rounded
          </button>
          <button
            onClick={makeItSharp}
            className="px-4 py-2 bg-secondary text-title border-secondary shadow-secondary rounded-lg hover:bg-tertiary transition-colors"
          >
            Sharp Corners
          </button>
        </div>
        <div className="p-4 bg-secondary border-primary rounded-lg shadow-primary">
          <p className="text-body">This card will change its border radius</p>
        </div>
      </div>

      {/* Complete Theme Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-subtitle">Complete Themes</h3>
        <div className="flex gap-4">
          <button
            onClick={applyForestTheme}
            className="px-4 py-2 bg-accent text-accent-text rounded-lg border-secondary shadow-secondary hover:bg-accent-hover transition-colors"
          >
            Apply Forest Theme
          </button>
          <button
            onClick={resetTheme}
            className="px-4 py-2 bg-secondary text-title border-secondary shadow-secondary rounded-lg hover:bg-tertiary transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Badge Examples (Semantic Colors) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-subtitle">Semantic Colors (Badges)</h3>
        <div className="flex gap-2">
          <Badge color="success">Success</Badge>
          <Badge color="warning">Warning</Badge>
          <Badge color="error">Error</Badge>
          <Badge color="info">Info</Badge>
          <Badge color="default">Default</Badge>
        </div>
      </div>

      {/* Persistence Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-subtitle">Theme Persistence</h3>
        <div className="flex gap-4">
          <button
            onClick={saveTheme}
            className="px-4 py-2 bg-success text-white rounded-lg border-secondary shadow-secondary hover:opacity-90 transition-opacity"
          >
            Save Current Theme
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-title border-secondary shadow-secondary rounded-lg hover:bg-tertiary transition-colors"
          >
            Reload Page (Test Persistence)
          </button>
        </div>
        <p className="text-sm text-label">
          Click &quot;Save Current Theme&quot; to persist your changes to localStorage,
          then reload the page to see them restored.
        </p>
      </div>

      {/* LLM Integration Example */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-subtitle">LLM Theme Generation</h3>
        <div className="p-4 bg-secondary border-primary rounded-lg shadow-primary space-y-3">
          <p className="text-body">Describe your ideal theme and let AI generate it:</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const input = form.elements.namedItem('prompt') as HTMLInputElement;
              const prompt = input.value.trim();
              const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;

              if (!prompt) return;

              button.disabled = true;
              button.textContent = 'Generating...';

              try {
                const response = await fetch('/api/theme', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt }),
                });

                if (!response.ok) {
                  const error = await response.json();
                  alert(`Error: ${error.error}`);
                  return;
                }

                const { theme } = await response.json();
                updateTheme(theme);
                input.value = '';
              } catch (error) {
                alert(`Failed to generate theme: ${error}`);
              } finally {
                button.disabled = false;
                button.textContent = 'Generate Theme';
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              name="prompt"
              placeholder="e.g., dark mode with purple accents and rounded corners"
              className="flex-1 px-3 py-2 bg-tertiary text-body rounded-lg border-tertiary shadow-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-accent-text rounded-lg border-secondary shadow-secondary hover:bg-accent-hover transition-colors whitespace-nowrap"
            >
              Generate Theme
            </button>
          </form>
          <div className="text-sm text-label">
            <p className="font-medium mb-1">Try these prompts:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>&quot;Make it purple, square, and light mode&quot;</li>
              <li>&quot;Dark mode with blue accents and rounded corners&quot;</li>
              <li>&quot;Warm and inviting with orange colors&quot;</li>
              <li>&quot;Professional corporate theme with green accents&quot;</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Manual JSON Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-subtitle">Manual JSON Input</h3>
        <div className="p-4 bg-secondary border-primary rounded-lg shadow-primary space-y-3">
          <p className="text-body">Paste theme JSON directly to apply:</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const textarea = form.elements.namedItem('themeJson') as HTMLTextAreaElement;
              const jsonStr = textarea.value.trim();

              if (!jsonStr) return;

              try {
                const theme = JSON.parse(jsonStr);
                updateTheme(theme);
                textarea.classList.remove('ring-2', 'ring-error');
                textarea.classList.add('ring-2', 'ring-success');
                setTimeout(() => {
                  textarea.classList.remove('ring-2', 'ring-success');
                }, 1000);
              } catch (error) {
                textarea.classList.add('ring-2', 'ring-error');
                alert(`Invalid JSON: ${error}`);
              }
            }}
            className="space-y-2"
          >
            <textarea
              name="themeJson"
              rows={6}
              placeholder='{"borders": {"primary": "3px solid #000000"}, "shadows": {"primary": "6px 6px 0px #000000"}}'
              className="w-full px-3 py-2 bg-tertiary text-body rounded-lg border-tertiary shadow-tertiary focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-accent-text rounded-lg border-secondary shadow-secondary hover:bg-accent-hover transition-colors"
            >
              Apply JSON Theme
            </button>
          </form>
        </div>
      </div>

      {/* Direct API Usage */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-subtitle">Direct API Usage (No Context)</h3>
        <div className="p-4 bg-secondary border-primary shadow-primary rounded-lg">
          <p className="text-body mb-2">You can also use the theme utilities directly:</p>
          <code className="block p-2 bg-tertiary rounded text-sm text-label">
            {`import { updateTheme, updateThemeVariable } from '@/utils/theme';

// Update a theme
updateTheme({
  colors: { accent: '#9333ea' }
});

// Update a single variable
updateThemeVariable('--color-accent', '#9333ea');`}
          </code>
        </div>
      </div>
    </div>
  );
}
