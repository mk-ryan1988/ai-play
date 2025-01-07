'use client';

import GanttChart from "@/components/GanntChart";
import PageWrapper from "@/components/layout/PageWrapper";

export default function ReleasesPage() {
  return (
    <PageWrapper
      title="Releases"
      description="Track your project releases and milestones"
    >
      <div className="flex flex-col w-full">
        <div className="flex-1">
          <GanttChart />
        </div>
      </div>
    </PageWrapper>
  );
}
