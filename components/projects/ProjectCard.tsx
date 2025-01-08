import Card from "../Card";
import { Database } from "@/types/supabase";
import FlyoutMenu from '@/components/ui/Menu';

interface ProjectCardProps {
  project: Database['public']['Tables']['projects']['Row'];
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <div className="flex flex-row items-center gap-4 mb-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="bg-primary w-14 h-14 rounded-lg"></div>
          <h3 className="text-lg font-semibold">{project.name}</h3>
        </div>

        <FlyoutMenu
          items={[
            { label: 'View', href: `/projects/${project.id}` },
            { label: 'Edit', href: `/projects/${project.id}/edit` },
            { label: 'Delete', href: `/projects/${project.id}/delete` },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(project.repositories ?? []).map((repository) => (
          <div key={`${project.id}-${repository}`} className="border-t border-tertiary pt-4 hover:underline cursor-pointer">
            <span>{repository ?? ''}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
