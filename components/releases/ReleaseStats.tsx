
export default function ReleasesStats() {

  const Stats: { title: string; stats: string }[] = [
    {
      title: 'Number of Issues',
      stats: '15',
    },
    {
      title: 'Number of Issues Tested',
      stats: '10',
    },
    {
      title: 'Number of Push Backs',
      stats: '3',
    },
    {
      title: 'Pass Percentage',
      stats: '90%',
    },
  ];

  return (
    <div className="border border-tertiary rounded-bl rounded-br grid grid-cols-4 divide-x font-mono text-sm text-left font-bold leading-6 overflow-hidden dark:divide-tertiary p-0 rounded-t-none">
      {Stats.map((stat) => (
        <div key={stat.title} className="flex flex-col gap-2 p-4">
          <p className="text-label text-lg font-thin">
            {stat.title}
          </p>
          <p className="text-body text-3xl font-bold">
            {stat.stats}
          </p>
        </div>
      ))}
    </div>
  );
}
