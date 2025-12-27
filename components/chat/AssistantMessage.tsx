'use client';

import { useState } from 'react';
import { Message, ActionMetadata } from '@/contexts/ChatContext';
import { CheckCircleIcon, XCircleIcon, PaintBrushIcon, SparklesIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
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
  const [isExpanded, setIsExpanded] = useState(false);
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
      themeContext.resetTheme();
    }
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[70%]">
        {/* Collapsible Actions Card */}
        {actions.length > 0 && (
          <div className="mb-2 bg-tertiary/50 border border-tertiary rounded-lg overflow-hidden">
            {/* Header - always visible, clickable */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-tertiary/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-label" />
                <span className="text-xs text-label">
                  {actions.map(a => FUNCTION_DISPLAY_NAMES[a.type]).join(', ')}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 text-label transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Expandable content */}
            {isExpanded && (
              <div className="px-3 pb-3 space-y-3 border-t border-tertiary pt-2">
                {/* Theme Action Details */}
                {hasThemeAction && themeAction && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
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

                    {/* Theme Preview Swatches */}
                    {actionSuccess && theme && (
                      <div className="flex flex-wrap gap-2">
                        {theme.colors?.accent && (
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded border border-tertiary"
                              style={{ backgroundColor: theme.colors.accent }}
                            />
                            <span className="text-xs text-body">Accent</span>
                          </div>
                        )}
                        {theme.colors?.primary && (
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded border border-tertiary"
                              style={{ backgroundColor: theme.colors.primary }}
                            />
                            <span className="text-xs text-body">Primary</span>
                          </div>
                        )}
                        {theme.colors?.secondary && (
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded border border-tertiary"
                              style={{ backgroundColor: theme.colors.secondary }}
                            />
                            <span className="text-xs text-body">Secondary</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error Display */}
                    {!actionSuccess && themeAction?.result.error && (
                      <p className="text-xs text-red-400">{themeAction.result.error}</p>
                    )}
                  </div>
                )}

                {/* Accessibility Check Results */}
                {accessibilityAction && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
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
                            Adjusted {accessibilityAction.result.adjustments?.length || 0} colors
                          </span>
                        </>
                      )}
                    </div>

                    {/* Adjustments */}
                    {accessibilityAction.result.adjustments && accessibilityAction.result.adjustments.length > 0 && (
                      <div className="space-y-1">
                        {accessibilityAction.result.adjustments.map((adj, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-body">
                            <div
                              className="w-4 h-4 rounded border border-tertiary"
                              style={{ backgroundColor: adj.originalValue }}
                            />
                            <span className="text-label">→</span>
                            <div
                              className="w-4 h-4 rounded border border-tertiary"
                              style={{ backgroundColor: adj.adjustedValue }}
                            />
                            <span className="text-label">
                              {adj.colorKey}: {adj.originalRatio}→{adj.adjustedRatio}
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
                    className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-full transition-colors flex items-center gap-2 w-fit"
                  >
                    <SparklesIcon className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs text-accent font-medium">
                      {suggestionAction.parameters.prompt}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Message Content - always visible */}
        {(message.content || message.isStreaming) && (
          <p className={`text-sm text-body whitespace-pre-wrap ${message.isStreaming ? 'typing-text' : ''}`}>
            {message.content}
            {message.isStreaming && <span className="streaming-cursor" />}
          </p>
        )}
      </div>
    </div>
  );
}
