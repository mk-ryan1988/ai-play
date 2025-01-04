'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, Input, Label, Button } from '@headlessui/react';
import FormLayout from '@/components/FormLayout';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const organisationSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 255 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
});

type FormData = z.infer<typeof organisationSchema>;

export default function NewOrganisation() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError
  } = useForm<FormData>({
    resolver: zodResolver(organisationSchema),
    defaultValues: {
      name: '',
      slug: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('organisations')
      .insert([data]);

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        setError('slug', {
          type: 'manual',
          message: 'This slug is already taken'
        });
      } else {
        console.error('Error creating organisation:', error);
      }
    } else {
      router.push('/organisations');
      router.refresh();
    }
  };

  return (
    <FormLayout
      title="Create Organisation"
      description="Set up a new organisation to manage your releases"
      isSubmitting={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Field>
          <Label className="block text-sm font-medium text-label mb-2">
            Organisation Name
          </Label>
          <Input
            type="text"
            {...register('name')}
            onChange={(e) => {
              const value = e.target.value;
              setValue('name', value);
              // Auto-generate slug from name
              setValue(
                'slug',
                value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
              );
            }}
            className={`w-full p-2 bg-primary border rounded-lg ${
              errors.name ? 'border-red-500' : 'border-tertiary'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </Field>

        <Field>
          <Label className="block text-sm font-medium text-label mb-2">
            Slug
          </Label>
          <Input
            type="text"
            {...register('slug')}
            onChange={(e) => {
              setValue(
                'slug',
                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
              );
            }}
            className={`w-full p-2 bg-primary border rounded-lg ${
              errors.slug ? 'border-red-500' : 'border-tertiary'
            }`}
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
          )}
        </Field>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
        >
          Create Organisation
        </Button>
      </form>
    </FormLayout>
  );
}
