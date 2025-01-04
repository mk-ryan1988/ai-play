import { Fieldset } from '@headlessui/react'

interface FormLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isSubmitting?: boolean;
}

export default function FormLayout({
  title,
  description,
  children,
  isSubmitting = false
}: FormLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-thin mb-2">{title}</h1>
        {description && (
          <p className="text-gray-400">{description}</p>
        )}
      </div>

      <Fieldset
        disabled={isSubmitting}
        className="space-y-8 data-[disabled]:opacity-50"
      >
        <div className="bg-secondary border border-tertiary rounded-lg p-6">
          {children}
        </div>
      </Fieldset>
    </div>
  )
}
