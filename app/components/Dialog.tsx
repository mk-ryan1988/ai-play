'use client';

import { useEffect, useRef, KeyboardEvent } from 'react';
import TextEditor from './TextEditor';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
}

export default function Dialog({ isOpen, onClose, type }: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const mainElement = useRef<HTMLElement | null>(null);

  function minusGap(value: number) {
    return value - 16;
  }

  useEffect(() => {
    mainElement.current = document.querySelector('main');

    if (isOpen) {
      dialog.current?.showModal();

      if (mainElement.current && dialog.current) {
        const rect = mainElement.current.getBoundingClientRect();

        dialog.current.style.width = `${minusGap(rect.width)}px`;
        dialog.current.style.height = `${minusGap(rect.height)}px`;
        dialog.current.style.top = `${minusGap(rect.top)}px`;
        dialog.current.style.left = `${minusGap(rect.left)}px`;
      }
    } else {
      dialog.current?.close();
    }
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialog.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialog}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      onClose={onClose}
      className={`
        fixed rounded-lg bg-dark-secondary backdrop:bg-black/10
        p-8 overflow-hidden border border-dark-tertiary
        transition-all duration-300 origin-bottom-right
        animate-[slide-in-from-bottom-right_0.3s_ease-out]
        [&[closing]]:animate-[slide-out-to-bottom-right_0.3s_ease-in]
      `}
    >
      <div className="w-full h-full flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 hover:bg-dark-tertiary rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400 hover:text-text-dark"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 className="text-2xl font-semibold text-text-dark capitalize mb-4 pr-12">
          {type.replace(/-/g, ' ')}
        </h2>

        <div className="flex-1 overflow-auto">
          <TextEditor />
        </div>
      </div>
    </dialog>
  );
}
