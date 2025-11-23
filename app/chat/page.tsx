'use client';

import { ChatProvider } from '@/contexts/ChatContext';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';
import { useChat } from '@/contexts/ChatContext';

function ChatContent() {
  const { messages } = useChat();

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] w-full">
      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>

      {/* Input area */}
      <ChatInput />
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
}
