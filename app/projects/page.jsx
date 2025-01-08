'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import PageWrapper from '@/components/layout/PageWrapper';
import ProjectCard from '@/components/projects/ProjectCard';

const CreateButton = () => {
  return <Link href="/projects/create">
    <Button>Create Project</Button>
  </Link>;
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <PageWrapper
      title="Projects"
      action={<CreateButton />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects found. Create your first project!</p>
        ) : (
          projects.map((project) => (
            <ProjectCard
              project={project}
              key={project.id}
            />
          ))
        )}
      </div>
    </PageWrapper>
  );
}
