'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrganization } from '@/contexts/OrganizationContext';
import { nullifyEmptyStrings } from '@/utils/nullify';
import ReleasePokedex from '@/components/releases/ReleasePokedex';
import Toggle from '@/components/ui/Toggle';

const releaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  version: z.string().optional(),
  description: z.string().optional(),
  project_id: z.string().min(1, 'Project is required'),
  release_at: z.string().optional(),
  hotfix: z.boolean().optional(),
  caused_by: z.string().optional(),
});

type FormData = z.infer<typeof releaseSchema>;

export default function NewRelease() {
  const router = useRouter();
  const { organization, isLoading: orgLoading } = useOrganization();
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [releases, setReleases] = useState<Array<{ id: string; name: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    watch,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(releaseSchema)
  });


  useEffect(() => {
    async function fetchProjects() {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data || []);
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    async function fetchReleases() {
      if (!organization) return;
      const response = await fetch('/api/releases?org_id=' + organization.id);
      if (!response.ok) {
        console.error('Failed to fetch releases:', response);
        return;
      }
      const data = await response.json();
      setReleases(data || []);
    }
    fetchReleases();
  }, [organization]);

  const onSubmit = async (data: FormData) => {
    if (!organization) return;

    try {
      const response = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nullifyEmptyStrings(data),
          org_id: organization.id,
          project_name: projects.find((p) => p.id === data.project_id)?.name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message);
        return;
      }

      router.push('/releases');
      router.refresh();
    } catch (error) {
      console.error('Error creating release:', error);
    }
  };

  if (orgLoading) {
    return (
      <PageWrapper title="Create Release">
        <div className="flex items-center justify-center h-64">
          <div className="text-label">Loading...</div>
        </div>
      </PageWrapper>
    );
  }

  if (!organization) {
    router.push('/organizations/new');
    return null;
  }

  return (
    <PageWrapper
      title="Create Release"
      description={`Create a new release for ${organization.name}`}
      backTo="/releases"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="form-group w-full sm:w-1/2 md:w-1/3">
          <label className="form-label">Project</label>
          <select
            {...register('project_id')}
            className="form-input"
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.project_id && (
            <p className="form-error">{errors.project_id.message}</p>
          )}
        </div>

        <div className='flex flex-wrap gap-3'>
          <div className="form-group flex-1">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              {...register('name')}
              className="form-input"
              id="name"
            />
            {errors.name && (
              <p className="form-error">{errors.name.message}</p>
            )}
          </div>

          <ReleasePokedex
            onSelect={(name) => {setValue('name', name)}}
          />
        </div>

        <div className="form-group">
          <Toggle
            label="Hotfix release?"
            value={getValues('hotfix')}
            onChange={(value) => {setValue('hotfix', value)}}
          />
        </div>

        { watch('hotfix') &&
          <div className="form-group">
            <label className="form-label">Caused By</label>
            <select
              {...register('caused_by')}
              className="form-input"
            >
              <option value="">Select a release</option>
              {releases.map((release) => (
                <option key={release.id} value={release.id}>
                  {release.name}
                </option>
              ))}
            </select>
            {errors.caused_by && (
              <p className="form-error">{errors.caused_by.message}</p>
            )}
          </div>
        }

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Planned Release Date</label>
          <input
            type="date"
            {...register('release_at')}
            className="form-input"
          />
          {errors.release_at && (
            <p className="form-error">{errors.release_at.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          Create Release
        </Button>
      </form>
    </PageWrapper>
  );
}
