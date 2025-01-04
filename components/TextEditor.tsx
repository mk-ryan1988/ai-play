'use client';

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const TextEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start typing your prompt here...',
        emptyEditorClass: 'is-editor-empty animate-pulse',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[100px]',
      },
    },
  });

  return (
    <div className="relative">
      {editor && (
        <>
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="bg-dark-secondary border border-dark-tertiary rounded-lg shadow-lg overflow-hidden flex gap-0.5"
          >
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 hover:bg-dark-tertiary transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'text-white' : 'text-gray-400'
              }`}
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 hover:bg-dark-tertiary transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'text-white' : 'text-gray-400'
              }`}
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 hover:bg-dark-tertiary transition-colors ${
                editor.isActive('blockquote') ? 'text-white' : 'text-gray-400'
              }`}
            >
              "
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-2 hover:bg-dark-tertiary transition-colors text-gray-400"
            >
              ―
            </button>
          </BubbleMenu>

          <FloatingMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="bg-dark-secondary border border-dark-tertiary rounded-lg shadow-lg overflow-hidden flex gap-0.5"
            shouldShow={({ state }) => {
              const { selection } = state;
              const { $anchor } = selection;
              const isRootDepth = $anchor.depth === 1;
              return isRootDepth;
            }}
          >
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 hover:bg-dark-tertiary transition-colors ${
                editor.isActive('bulletList') ? 'text-white' : 'text-gray-400'
              }`}
            >
              •
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 hover:bg-dark-tertiary transition-colors ${
                editor.isActive('orderedList') ? 'text-white' : 'text-gray-400'
              }`}
            >
              1.
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 hover:bg-dark-tertiary transition-colors ${
                editor.isActive('bold') ? 'text-white' : 'text-gray-400'
              }`}
            >
              B
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 hover:bg-dark-tertiary transition-colors ${
                editor.isActive('italic') ? 'text-white' : 'text-gray-400'
              }`}
            >
              I
            </button>
          </FloatingMenu>
        </>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TextEditor;
