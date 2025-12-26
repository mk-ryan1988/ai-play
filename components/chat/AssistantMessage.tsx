import { Message } from '@/contexts/ChatContext';
import { CheckCircleIcon, XCircleIcon, PaintBrushIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useThemeOptional } from '@/contexts/ThemeContext';

interface AssistantMessageProps {
  message: Message;
}

export default function AssistantMessage({ message }: AssistantMessageProps) {
  const themeContext = useThemeOptional();
  const actions = message.actions || [];

  const themeAction = actions.find(a => a.type === 'updateTheme');
  const suggestionAction = actions.find(a => a.type === 'suggestTheme');

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
        {message.content && (
          <div
            className="bg-secondary border border-tertiary px-4 py-2"
            style={{
              borderRadius: 'var(--radius-2xl)',
              borderTopLeftRadius: 'calc(var(--radius-2xl) * 0.15)',
            }}
          >
            <p className="text-sm text-body whitespace-pre-wrap">{message.content}</p>
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
