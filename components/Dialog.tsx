'use client';

import { useEffect, useRef, KeyboardEvent } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const mainElement = useRef<HTMLElement | null>(null);

  function minusGap(value: number) {
    return value - 16;
  }

  useEffect(() => {
    mainElement.current = document.querySelector('main');

    if (isOpen) {
      dialog.current?.showModal();
      document.body.style.overflow = 'hidden';

      if (mainElement.current && dialog.current) {
        const rect = mainElement.current.getBoundingClientRect();

        dialog.current.style.width = `${minusGap(rect.width)}px`;
        dialog.current.style.height = `${minusGap(rect.height)}px`;
        dialog.current.style.top = `${minusGap(rect.top)}px`;
        dialog.current.style.left = `${minusGap(rect.left)}px`;
      }
    } else {
      dialog.current?.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
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
        fixed rounded-lg bg-secondary backdrop:bg-black/10
        p-8 overflow-hidden border border-tertiary
        transition-all duration-300 origin-bottom-right
        animate-[slide-in-from-bottom-right_0.3s_ease-out]
        [&[closing]]:animate-[slide-out-to-bottom-right_0.3s_ease-in]
      `}
    >
      <div className="w-full h-full flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 hover:bg-tertiary rounded-lg transition-colors"
        >
          <XMarkIcon className="w-6 h-6 text-label hover:text-title" />
        </button>

        {title && (
          <h2 className="text-2xl font-semibold text-title capitalize mb-4 pr-12">
            {title}
          </h2>
        )}

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </dialog>
  );
}
