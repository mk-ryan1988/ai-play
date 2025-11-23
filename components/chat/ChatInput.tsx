'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useChat } from '@/contexts/ChatContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

export default function ChatInput() {
  const { sendMessage, isGenerating } = useChat();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable some features we don't need for chat
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: 'Type your message...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[60px] max-h-[200px] overflow-y-auto px-4 py-3',
      },
      handleKeyDown: (view, event) => {
        // Submit on Enter key (without Shift)
        if (event.key === 'Enter' && !event.shiftKey && !isGenerating) {
          event.preventDefault();
          handleSubmit();
          return true;
        }
        return false;
      },
    },
  });

  const handleSubmit = async () => {
    if (!editor) return;

    const content = editor.getText().trim();

    if (!content) {
      return;
    }

    // Send the message
    await sendMessage(content);

    // Clear the editor
    editor.commands.clearContent();
  };

  return (
    <div className="border-t border-tertiary bg-secondary">
      <div className="relative flex items-end gap-2 p-4">
        <div className="flex-1 border border-tertiary rounded-lg bg-primary">
          <EditorContent editor={editor} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isGenerating || !editor?.getText().trim()}
          className="flex items-center justify-center w-10 h-10 bg-accent hover:bg-accent-hover text-accent-text rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
