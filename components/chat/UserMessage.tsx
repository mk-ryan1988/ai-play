import { Message } from '@/contexts/ChatContext';

interface UserMessageProps {
  message: Message;
}

export default function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[70%]">
        {/* Image preview */}
        {message.image && (
          <div className="mb-2">
            <img
              src={`data:${message.image.mimeType};base64,${message.image.data}`}
              alt="Uploaded"
              className="max-w-full h-auto rounded-lg border border-accent/20"
            />
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <div className="bg-accent text-accent-text rounded-2xl rounded-tr-sm px-4 py-2">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
      </div>
    </div>
  );
}
