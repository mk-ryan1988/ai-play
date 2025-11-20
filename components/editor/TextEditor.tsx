'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Commands from './suggestion/commands';
import getSuggestionItems from './suggestion/items';
import renderItems from './suggestion/renderItems';
import { updateTheme, generateThemeFromPrompt } from '@/utils/theme';
import { useState } from 'react';
import ShimmerOverlay from '@/components/ui/ShimmerOverlay';

const TextEditor = () => {
  const [isGenerating, setIsGenerating] = useState(false);

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

    // Get the text content from the editor
    const prompt = editor.getText();

    if (!prompt.trim()) {
      console.warn('No prompt provided');
      return;
    }

    console.log('Generating theme from prompt:', prompt);
    setIsGenerating(true);

    try {
      // Generate theme from the prompt
      const theme = await generateThemeFromPrompt(prompt);

      // Apply the generated theme
      if (theme && (theme.colors || theme.borderRadius || theme.shadows)) {
        updateTheme(theme);
        console.log('Theme applied successfully:', theme);
      } else {
        console.warn('No valid theme generated');
      }
    } catch (error) {
      console.error('Error generating theme:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="relative">
        {editor && (
          <>
            {/* submit button */}
            <button
              onClick={handleSubmit}
              disabled={isGenerating}
              className="absolute top-2 right-2 bg-accent hover:bg-accent-hover text-accent-text px-3 py-1 rounded-md z-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Submit'}
            </button>
          </>
        )}

        <EditorContent editor={editor} />
      </div>

      {/* Shimmer overlay covering whole app */}
      <ShimmerOverlay isVisible={isGenerating} />
    </>
  );
};

export default TextEditor;
