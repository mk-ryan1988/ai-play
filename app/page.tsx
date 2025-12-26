'use client';

import { ChatProvider, useChat } from '@/contexts/ChatContext';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';
import ShimmerOverlay from '@/components/ui/ShimmerOverlay';
import PromptCarousel from '../components/PromptCarousel';

function HomeContent() {
  const { messages, isUpdatingTheme } = useChat();
  const hasMessages = messages.length > 0;

  return (
    <>
      <ShimmerOverlay isVisible={isUpdatingTheme} />
      <div className="flex flex-col min-h-[calc(100vh-8rem)] w-full">
        {/* Content area */}
        <div className="flex-1 min-h-0">
          {hasMessages ? (
            <MessageList messages={messages} />
          ) : (
            <div className="w-full">
              <div className="mt-16 space-y-2">
                <h1
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    animation: 'typing 2s steps(40, end), blink-caret 0.75s step-end infinite',
                  }}
                  className="text-2xl max-w-fit font-thin"
                >
                  Hey Mark,
                </h1>
                <h1
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    animation: 'typing 2s steps(40, end) 0.4s, blink-caret 0.75s step-end infinite',
                    animationFillMode: 'both',
                  }}
                  className="text-2xl max-w-fit font-thin"
                >
                  what would you like to do today?
                </h1>
              </div>

              <PromptCarousel />
            </div>
          )}
        </div>

        {/* Input area */}
        <ChatInput />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <ChatProvider>
      <HomeContent />
    </ChatProvider>
  );
}
