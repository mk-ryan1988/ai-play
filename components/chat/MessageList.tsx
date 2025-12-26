'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/contexts/ChatContext';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      {messages.map((message) => (
        message.role === 'user' ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} />
        )
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
