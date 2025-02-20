'use client';

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Commands from './suggestion/commands';
import getSuggestionItems from './suggestion/items';
import renderItems from './suggestion/renderItems';

const TextEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start typing your prompt here...',
        emptyEditorClass: 'is-editor-empty animate-pulse',
      }),
      Commands.configure({
        suggestion: {
          items: getSuggestionItems,
          render: renderItems
        }
      }),
      TaskItem,
      TaskList,
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
          {/* submit button */}
          <button
            onClick={() => {
              console.log(editor.getHTML());
              editor.setEditable(!editor.isEditable);
            }}
            className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-md z-50"
          >
            Submit
          </button>
        </>
      )}

      <EditorContent editor={editor} />
    </div>
  );
};

export default TextEditor;
