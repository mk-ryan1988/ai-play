import { Message } from '@/contexts/ChatContext';
import { CheckCircleIcon, XCircleIcon, PaintBrushIcon } from '@heroicons/react/24/solid';

interface AssistantMessageProps {
  message: Message;
}

export default function AssistantMessage({ message }: AssistantMessageProps) {
  const hasAction = message.action;
  const isThemeAction = message.action?.type === 'updateTheme';
  const actionSuccess = message.action?.result.success;
  const theme = message.action?.result.theme;

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[70%]">
        {/* Action Badge */}
        {hasAction && isThemeAction && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-tertiary border border-tertiary rounded-lg w-fit">
            <PaintBrushIcon className="w-4 h-4 text-accent" />
            <span className="text-xs text-label font-medium">
              {message.action.parameters.description}
            </span>
            {actionSuccess ? (
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
            ) : (
              <XCircleIcon className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}

        {/* Theme Preview */}
        {isThemeAction && actionSuccess && theme && (
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

        {/* Message Content */}
        <div className="bg-secondary border border-tertiary rounded-2xl rounded-tl-sm px-4 py-2">
          <p className="text-sm text-body whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Error Display */}
        {hasAction && !actionSuccess && message.action?.result.error && (
          <div className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400">{message.action.result.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
