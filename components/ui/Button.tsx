import { ButtonProps, Button as HeadlessButton } from '@headlessui/react';

export default function Button({ children, ...props }: ButtonProps) {
  return <HeadlessButton {...props} className="bg-primary text-white rounded-md px-4 py-2">{children}</HeadlessButton>;
}
