'use client';

import { ChatProvider } from '@/contexts/ChatContext';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';
import ShimmerOverlay from '@/components/ui/ShimmerOverlay';
import { useChat } from '@/contexts/ChatContext';

function ChatContent() {
  const { messages, isUpdatingTheme } = useChat();

  return (
    <>
      <ShimmerOverlay isVisible={isUpdatingTheme} />
      <div className="flex flex-col h-[calc(100vh-2rem)] w-full">
        {/* Messages area */}
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} />
        </div>

        {/* Input area */}
        <ChatInput />
      </div>
    </>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
}
