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

const releaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  version: z.string().optional(),
  description: z.string().optional(),
  project_id: z.string().min(1, 'Project is required'),
  release_at: z.string().optional(),
});

type FormData = z.infer<typeof releaseSchema>;

export default function NewRelease() {
  const router = useRouter();
  const { organization, isLoading: orgLoading } = useOrganization();
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
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

  const onSubmit = async (data: FormData) => {
    if (!organization) return;

    try {
      const response = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nullifyEmptyStrings(data),
          org_id: organization.id
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

        {/* <div className="form-group">
          <label htmlFor="pokemonSearch">Search Pokémon</label>
          <input
            type="text"
            id="pokemonSearch"
            value={pokemonName}
            className="form-input"
            onChange={(e) => setPokemonName(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        {searchResult && (
          <div className="flex items-center space-x-4">
            <Image
              src={searchResult.image}
              alt={searchResult.name}
              width={100}
              height={100}
            />
            <div>
              <h3>{searchResult.name}</h3>
            </div>
            <button onClick={handleSelectPokemon}>Select</button>
          </div>
        )} */}

        {/*
          TODO: Add config to enable versioning
        */}
        {/* <div className="form-group">
          <label className="form-label">Version</label>
          <input
            {...register('version')}
            placeholder="e.g., 1.0.0"
            className="form-input"
          />
          {errors.version && (
            <p className="form-error">{errors.version.message}</p>
          )}
        </div> */}

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
