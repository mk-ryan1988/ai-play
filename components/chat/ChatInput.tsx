'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useChat } from '@/contexts/ChatContext';
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState, useRef } from 'react';

export default function ChatInput() {
  const { sendMessage, isGenerating } = useChat();
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix

      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
        preview: base64, // Full data URL for preview
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!editor) return;

    const content = editor.getText().trim();

    if (!content && !selectedImage) {
      return;
    }

    // Send the message with optional image
    await sendMessage(content || 'What theme would this image inspire?', selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined);

    // Clear the editor and image
    editor.commands.clearContent();
    handleRemoveImage();
  };

  return (
    <div className="border-t-tertiary bg-secondary">
      {/* Image preview */}
      {selectedImage && (
        <div className="p-4 pb-0">
          <div className="relative inline-block">
            <img
              src={selectedImage.preview}
              alt="Selected"
              className="h-24 w-24 object-cover rounded-lg border-tertiary"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 hover:bg-error/80 transition-colors"
              aria-label="Remove image"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative flex items-end gap-2 p-4">
        <div className="flex-1 border-tertiary rounded-lg bg-primary">
          <EditorContent editor={editor} />
        </div>

        {/* Image upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isGenerating}
          className="flex items-center justify-center w-10 h-10 bg-secondary border-tertiary shadow-tertiary hover:bg-tertiary text-body rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Upload image"
        >
          <PhotoIcon className="w-5 h-5" />
        </button>

        <button
          onClick={handleSubmit}
          disabled={isGenerating || (!editor?.getText().trim() && !selectedImage)}
          className="flex items-center justify-center w-10 h-10 bg-accent border-secondary shadow-secondary hover:bg-accent-hover text-accent-text rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
