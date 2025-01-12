'use client';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import '@/app/global.css';
import { Database } from '@/types/supabase';
import { Button } from '@headlessui/react';

type Release = Database['public']['Tables']['versions']['Row'] & {
  projects: {
    name: string;
  };
};

interface Props {
  releases?: Release[];
}

interface Marker {
  id: string;
  title: string;
  deadline: string;
}

const exampleMarkers: Marker[] = [
  {
    id: "m1",
    title: "Milestone 1",
    deadline: dayjs().subtract(4, 'month').format()
  },
  {
    id: "m2",
    title: "Milestone 2",
    deadline: dayjs().add(1, 'month').format()
  }
];

const getEndDate = (release: Release, lastDay: dayjs.Dayjs) => {
  return {
    date: release.released_at ? dayjs(release.released_at) : release.release_at ? dayjs(release.release_at) : lastDay,
    date_used: release.released_at ? 'released_at' : release.release_at ? 'planned release_at' : 'last_day',
  }
};

const calculateWidthPercentage = (release: Release, lastDay: dayjs.Dayjs, totalDays: number) => {
  const startDate = dayjs(release.created_at);
  const endDate = getEndDate(release, lastDay).date;

  // Ensure we have valid dates
  if (!startDate.isValid() || !endDate.isValid()) {
    return 0;
  }
  if (release.name === 'Planned Release') {
    console.log('startDate', startDate.format('YYYY-MM-DD'));
    console.log('endDate', endDate.format('YYYY-MM-DD'));
  }

  const duration = endDate.diff(startDate, 'day');
  return Math.max(duration / totalDays * 100, 1); // Ensure width is never negative
};

const calculateLeftOffsetPercentage = (start: string, firstDate: string, totalDays: number) => {
  const startDate = dayjs(start);
  const offset = startDate.diff(firstDate, 'day');
  return (offset / totalDays) * 100;
};

const Tooltip = ({ title, x, y }: { title: string, x: number, y: number }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      backgroundColor: 'black',
      color: 'white',
      padding: '5px',
      borderRadius: '3px',
      pointerEvents: 'none',
      transform: 'translate(-50%, -100%)',
      whiteSpace: 'nowrap',
    }}
  >
    {title}
  </div>
);

const GanttChart = ({ releases = [] }: Props) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [tooltip, setTooltip] = useState({ visible: false, title: '', x: 0, y: 0 });

  // Get current date and generate 3 months before and after
  const currentMonth = dayjs().add(monthOffset, 'month');
  const startMonth = currentMonth.subtract(3, 'month').startOf('month');
  const endMonth = startMonth.add(6, 'month').endOf('month');

  const months = Array.from({ length: 6 }, (_, i) => startMonth.add(i, 'month'));
  const monthNames = months.map(month => month.format('MMM'));
  const quarters = months.map(month => `Q${Math.ceil((month.month() + 1) / 3)}`);
  const years = Array.from(new Set(months.map(month => month.year())));

  // Calculate total days in our 6-month window
  const totalDays = endMonth.diff(startMonth, 'day');
  const lastDay = endMonth.endOf('month');


  return (
    <div className="w-full text-text-dark rounded-lg">
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => setMonthOffset(prev => prev - 1)}
          className="p-1 rounded hover:bg-gray-700/50"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <Button
          onClick={() => setMonthOffset(0)}
        >
          Today
        </Button>

        <button
          onClick={() => setMonthOffset(prev => prev + 1)}
          className="p-1 rounded hover:bg-gray-700/50"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0">
        <div className="col-span-1"></div>
        <div className="col-span-6">
          {/* Year Headers */}
          <div className="flex justify-between mb-2">
            {years.map((year, i) => (
              <div key={i}>{year}</div>
            ))}
          </div>

          {/* Quarter Headers */}
          <div className="flex border-b border-gray-700 mb-2">
            {quarters.map((quarter, idx) => (
              <div key={idx} className="w-1/6 text-center font-semibold text-gray-200">
                {quarter}
              </div>
            ))}
          </div>

          {/* Month Headers */}
          <div className="flex border-b border-gray-700 mb-4">
            {monthNames.map((month, idx) => (
              <div key={idx} className="w-1/6 text-center font-semibold text-gray-200">
                {month}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {/* Release Names */}
        <div className="col-span-1">
          {releases.map((release) => (
            <div key={release.id} className="mb-4 text-gray-300 font-medium">
              {`${release.projects?.name} / ${release.name}`}
            </div>
          ))}
        </div>

        {/* Gantt Chart */}
        <div className="col-span-6 relative">
          <svg className="absolute top-0 left-0 w-full h-full">
            {/* Month divider lines */}
            {monthNames.map((_, idx) => (
              <line
                key={idx}
                x1={`${(idx + 1) * 16.67}%`}
                y1="0"
                x2={`${(idx + 1) * 16.67}%`}
                y2="100%"
                stroke="#4a5568"
              />
            ))}

            {/* Markers */}
            {exampleMarkers.map((marker) => {
              const leftOffset = calculateLeftOffsetPercentage(
                marker.deadline,
                startMonth.format('YYYY-MM-DD'),
                totalDays
              );
              return (
                <g key={marker.id}>
                  <line
                    x1={`${leftOffset}%`}
                    y1="0"
                    x2={`${leftOffset}%`}
                    y2="100%"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                  <circle
                    cx={`${leftOffset}%`}
                    cy="100%"
                    r="4"
                    fill="#ef4444"
                  />
                  <text
                    x={`${leftOffset}%`}
                    y="calc(100% + 40px)"
                    fill="#ef4444"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    {marker.title}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Release Rows */}
          <div className="relative">
            {releases.map((release) => {
              const leftOffset = calculateLeftOffsetPercentage(
                release.created_at,
                startMonth.format('YYYY-MM-DD'),
                totalDays
              );

              const width = calculateWidthPercentage(release, lastDay, totalDays);

              return (
                <div key={release.id} className="flex items-center mb-4">
                  <svg className="relative w-full h-6">
                    <rect
                      className={`${release.status === 'scheduled' ? 'fill-gray-500' : 'fill-blue-500'}`}
                      x={`${leftOffset}%`}
                      y="0"
                      width={`${width}%`}
                      height="100%"
                    />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {tooltip.visible && <Tooltip title={tooltip.title} x={tooltip.x} y={tooltip.y} />}
    </div>
  );
};

export default GanttChart;
