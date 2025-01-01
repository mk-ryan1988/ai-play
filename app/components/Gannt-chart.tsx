'use client';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import '../global.css';

interface Release {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  tested_at: string;
  deployed_at: string;
  status: string;
  pokedex_id: string;
}

interface Marker {
  id: string;
  title: string;
  deadline: string;
}

const exampleReleases: Release[] = [
  // Past deployed releases
  {
    id: "1",
    name: "Initial Release",
    created_at: dayjs().subtract(6, 'month').format(),
    updated_at: dayjs().subtract(5, 'month').format(),
    tested_at: dayjs().subtract(4, 'month').format(),
    deployed_at: dayjs().subtract(3, 'month').format(),
    status: "deployed",
    pokedex_id: "001"
  },
  {
    id: "2",
    name: "Bug Fix Release",
    created_at: dayjs().subtract(5, 'month').format(),
    updated_at: dayjs().subtract(4, 'month').format(),
    tested_at: dayjs().subtract(3, 'month').format(),
    deployed_at: dayjs().subtract(2, 'month').format(),
    status: "deployed",
    pokedex_id: "002"
  },
  // Currently in testing releases
  {
    id: "3",
    name: "Feature Update",
    created_at: dayjs().subtract(2, 'month').format(),
    updated_at: dayjs().subtract(1, 'month').format(),
    tested_at: dayjs().add(1, 'week').format(),
    deployed_at: dayjs().add(2, 'week').format(),
    status: "in testing",
    pokedex_id: "003"
  },
  {
    id: "4",
    name: "Security Patch",
    created_at: dayjs().subtract(1, 'month').format(),
    updated_at: dayjs().subtract(2, 'week').format(),
    tested_at: dayjs().add(2, 'week').format(),
    deployed_at: dayjs().add(1, 'month').format(),
    status: "in testing",
    pokedex_id: "004"
  },
  // Scheduled releases
  {
    id: "5",
    name: "Performance Improvement",
    created_at: dayjs().add(1, 'month').format(),
    updated_at: dayjs().add(2, 'month').format(),
    tested_at: dayjs().add(3, 'month').format(),
    deployed_at: dayjs().add(4, 'month').format(),
    status: "scheduled",
    pokedex_id: "005"
  },
  {
    id: "6",
    name: "New Feature Release",
    created_at: dayjs().add(2, 'month').format(),
    updated_at: dayjs().add(3, 'month').format(),
    tested_at: dayjs().add(4, 'month').format(),
    deployed_at: dayjs().add(5, 'month').format(),
    status: "scheduled",
    pokedex_id: "006"
  }
];

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

const calculateWidthPercentage = (start, end, totalDays) => {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  const duration = endDate.diff(startDate, 'day');
  return (duration / totalDays) * 100;
};

const calculateLeftOffsetPercentage = (start, firstDate, totalDays) => {
  const startDate = dayjs(start);
  const offset = startDate.diff(firstDate, 'day');
  return (offset / totalDays) * 100;
};

const Tooltip = ({ title, x, y }) => (
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

const GanttChart = () => {
  const [tooltip, setTooltip] = useState({ visible: false, title: '', x: 0, y: 0 });

  // Get current date and generate the next 6 months
  const currentMonth = dayjs();
  const months = Array.from({ length: 6 }, (_, i) => currentMonth.add(i, 'month'));
  const monthNames = months.map(month => month.format('MMM'));
  const quarters = months.map(month => `Q${Math.ceil((month.month() + 1) / 3)}`);
  const year = currentMonth.year();

  // Calculate the first and last date in the exampleReleases
  const firstDate = dayjs(Math.min(...exampleReleases.map(release => new Date(release.created_at).getTime())));
  const lastDate = dayjs(Math.max(...exampleReleases.map(release => new Date(release.deployed_at).getTime())));
  const totalDays = lastDate.diff(firstDate, 'day');

  return (
    <div className="w-full p-4 bg-dark-secondary text-text-dark rounded-lg">
      <div className="grid grid-cols-7 gap-0">
        <div className="col-span-1"></div>
        <div className="col-span-6">
          {/* Year Headers */}
          <div className="flex justify-between mb-2">
            <div>{year}</div>
            <div>{year}</div>
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
          {exampleReleases.map((release) => (
            <div key={release.id} className="mb-4 text-gray-300 font-medium">
              {release.name}
            </div>
          ))}
        </div>

        {/* Gantt Chart */}
        <div className="col-span-6 relative">
          <svg className="absolute top-0 left-0 w-full h-full">
            {monthNames.map((_, idx) => (
              <line key={idx} x1={`${(idx + 1) * 16.67}%`} y1="0" x2={`${(idx + 1) * 16.67}%`} y2="100%" stroke="#4a5568" />
            ))}
            {exampleMarkers.map((marker) => {
              const markerOffset = calculateLeftOffsetPercentage(marker.deadline, firstDate, totalDays);
              return (
                <React.Fragment key={marker.id}>
                  <line x1={`${markerOffset}%`} y1="0" x2={`${markerOffset}%`} y2="100%" stroke="red" strokeDasharray="4" />
                  <circle
                    cx={`${markerOffset}%`}
                    cy="100%"
                    r="6"
                    fill="red"
                    onMouseEnter={(e) => setTooltip({ visible: true, title: marker.title, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setTooltip({ visible: false, title: '', x: 0, y: 0 })}
                  />
                </React.Fragment>
              );
            })}
          </svg>

          {/* Release Rows */}
          <div className="relative">
            {exampleReleases.map((release) => {
              const createdWidth = calculateWidthPercentage(release.created_at, release.tested_at ?? '', totalDays);
              const testedWidth = calculateWidthPercentage(release.tested_at ?? '', release.deployed_at, totalDays);
              const leftOffset = calculateLeftOffsetPercentage(release.created_at, firstDate, totalDays);

              return (
                <div key={release.id} className="flex items-center mb-4">
                  <svg className="relative w-full h-6">
                    {/* Created to Tested */}
                    <rect
                      className={`${release.status === 'scheduled' ? 'fill-gray-500' : 'fill-blue-500'}`}
                      x={`${leftOffset}%`}
                      y="0"
                      width={`${release.status === 'scheduled' ? 100 : createdWidth}%`}
                      height="100%"
                    />
                    {/* Tested to Deployed */}
                    {release.status !== 'scheduled' && (
                      <rect
                        className="fill-green-500"
                        x={`${leftOffset + createdWidth}%`}
                        y="0"
                        width={`${testedWidth}%`}
                        height="100%"
                      />
                    )}
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
