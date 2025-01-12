'use client';

import GanttChart from "@/components/GanntChart";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Database } from "@/types/supabase";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Card from "@/components/Card";

type Release = Database['public']['Tables']['versions']['Row'] & {
  projects: {
    name: string;
  };
};

export default function ReleasesPage() {
  const router = useRouter();
  const { organization } = useOrganization();
  const [releases, setReleases] = useState<Release[]>([]);

  useEffect(() => {
    const fetchReleases = async () => {
      if (!organization) return;
      const response = await fetch('/api/releases?org_id=' + organization.id);
      if (!response.ok) {
        console.error('Failed to fetch releases:', response);
        return;
      }
      const data = await response.json();
      console.log(data);
      setReleases(data);
    };
    fetchReleases();
  }, [organization]);

  return (
    <PageWrapper
      title="Releases"
      description="Track your project releases and milestones"
      action={
        <Button onClick={() => router.push('/releases/create')}>
          Create Release
        </Button>
      }
    >
      <div className="flex flex-col w-full">
        <div className="flex-1">
          <Card className="mb-8">
            <GanttChart releases={releases} />
          </Card>
        </div>
      </div>

      {/* Releases data list */}
      <div className="flex flex-col w-full">
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-2">
            <span>Sort by</span>
            {/* Add your sort button/dropdown here */}
          </div>
        </div>

        <div className="space-y-px divide-y divide-tertiary">
          {releases.map((release) => (
            <div
              key={release.id}
              className="flex items-center justify-between py-4 hover:bg-background/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {`${release.projects.name} / ${release.name}`}
                  </span>
                </div>

                <div className="text-sm text-gray-400">
                  <p className="line-clamp-2 pr-4">{ release.description }</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  release.status === 'production'
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'bg-gray-700/50 text-gray-300'
                }`}>
                  {release.status}
                </span>
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
