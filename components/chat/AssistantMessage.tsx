import { Message, ActionMetadata } from '@/contexts/ChatContext';
import { CheckCircleIcon, XCircleIcon, PaintBrushIcon, SparklesIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid';
import { useThemeOptional } from '@/contexts/ThemeContext';

// Friendly names for function calls
const FUNCTION_DISPLAY_NAMES: Record<ActionMetadata['type'], string> = {
  updateTheme: 'Update Theme',
  suggestTheme: 'Suggest Theme',
  checkAccessibility: 'Check Accessibility',
};

interface AssistantMessageProps {
  message: Message;
}

export default function AssistantMessage({ message }: AssistantMessageProps) {
  const themeContext = useThemeOptional();
  const actions = message.actions || [];

  const themeAction = actions.find(a => a.type === 'updateTheme');
  const suggestionAction = actions.find(a => a.type === 'suggestTheme');
  const accessibilityAction = actions.find(a => a.type === 'checkAccessibility');

  const hasThemeAction = !!themeAction;
  const actionSuccess = themeAction?.result.success;
  const theme = themeAction?.result.theme;

  const handleSuggestionClick = () => {
    if (suggestionAction?.parameters.action === 'reset' && themeContext) {
      themeContext.resetTheme(); // Reset without persisting
    }
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[70%]">
        {/* Function Calls Badge */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-tertiary/50 border border-tertiary rounded-lg w-fit">
            <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-label" />
            <span className="text-xs text-label">
              Called: {actions.map(a => FUNCTION_DISPLAY_NAMES[a.type]).join(', ')}
            </span>
          </div>
        )}

        {/* Action Badge */}
        {hasThemeAction && themeAction && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-tertiary border border-tertiary rounded-lg w-fit">
            <PaintBrushIcon className="w-4 h-4 text-accent" />
            <span className="text-xs text-label font-medium">
              {themeAction.parameters.description}
            </span>
            {actionSuccess ? (
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
            ) : (
              <XCircleIcon className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}

        {/* Theme Preview */}
        {hasThemeAction && actionSuccess && theme && (
          <div className="mb-2 px-3 py-2 bg-tertiary border border-tertiary rounded-lg">
            <div className="text-xs text-label mb-2 font-medium">Theme Colors:</div>
            <div className="flex flex-wrap gap-2">
              {theme.colors?.accent && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded border border-tertiary"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                  <span className="text-xs text-body">Accent</span>
                </div>
              )}
              {theme.colors?.primary && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded border border-tertiary"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <span className="text-xs text-body">Primary</span>
                </div>
              )}
              {theme.colors?.secondary && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded border border-tertiary"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <span className="text-xs text-body">Secondary</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accessibility Check Results */}
        {accessibilityAction && (
          <div className="mb-2 px-3 py-2 bg-tertiary border border-tertiary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {accessibilityAction.result.passed ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-label font-medium">
                    Accessibility Check Passed
                  </span>
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-label font-medium">
                    Adjusted {accessibilityAction.result.adjustments?.length || 0} colors for accessibility
                  </span>
                </>
              )}
            </div>

            {/* Show adjustments if any */}
            {accessibilityAction.result.adjustments && accessibilityAction.result.adjustments.length > 0 && (
              <div className="space-y-1.5">
                {accessibilityAction.result.adjustments.map((adj, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-body">
                    <div
                      className="w-5 h-5 rounded border border-tertiary"
                      style={{ backgroundColor: adj.originalValue }}
                      title={adj.originalValue}
                    />
                    <span className="text-label">→</span>
                    <div
                      className="w-5 h-5 rounded border border-tertiary"
                      style={{ backgroundColor: adj.adjustedValue }}
                      title={adj.adjustedValue}
                    />
                    <span className="text-label">
                      {adj.colorKey}: {adj.originalRatio}:1 → {adj.adjustedRatio}:1
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Theme Suggestion */}
        {suggestionAction && (
          <button
            onClick={handleSuggestionClick}
            className="mb-2 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-full transition-colors flex items-center gap-2 w-fit"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs text-accent font-medium">
              {suggestionAction.parameters.prompt}
            </span>
          </button>
        )}

        {/* Message Content */}
        {(message.content || message.isStreaming) && (
          <div
            className="bg-secondary border border-tertiary px-4 py-2"
            style={{
              borderRadius: 'var(--radius-2xl)',
              borderTopLeftRadius: 'calc(var(--radius-2xl) * 0.15)',
            }}
          >
            <p className="text-sm text-body whitespace-pre-wrap">
              {message.content}
              {message.isStreaming && <span className="streaming-cursor" />}
            </p>
          </div>
        )}

        {/* Error Display */}
        {hasThemeAction && !actionSuccess && themeAction?.result.error && (
          <div className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400">{themeAction.result.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
