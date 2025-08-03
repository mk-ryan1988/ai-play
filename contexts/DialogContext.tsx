'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Dialog from '@/components/Dialog';

interface DialogContextType {
  openDialog: (props: DialogProps) => void;
  closeDialog: () => void;
}

export interface DialogProps {
  title?: string;
  content: ReactNode;
  onClose?: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogProps, setDialogProps] = useState<DialogProps | null>(null);

  const openDialog = (props: DialogProps) => {
    setDialogProps(props);
  };

  const closeDialog = () => {
    if (dialogProps?.onClose) {
      dialogProps.onClose();
    }
    setDialogProps(null);
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      {dialogProps && (
        <Dialog
          isOpen={true}
          onClose={closeDialog}
          title={dialogProps.title}
        >
          {dialogProps.content}
        </Dialog>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
