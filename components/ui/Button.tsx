import { ButtonProps, Button as HeadlessButton } from '@headlessui/react';

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <HeadlessButton
      {...props}
      className="bg-accent text-accent-text rounded-lg px-4 py-2 border-secondary shadow-secondary hover:bg-accent-hover transition-colors"
    >
      {children}
    </HeadlessButton>
  );
}
