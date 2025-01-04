'use client';

import GanttChart from "@/components/GanntChart";

export default function ReleasesPage() {
  return (
    <div className="flex flex-col w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-thin mb-2">Releases</h1>
        <p className="text-gray-400">Track your project releases and milestones</p>
      </div>

      <div className="flex-1">
        <GanttChart />
      </div>
    </div>
  );
}
