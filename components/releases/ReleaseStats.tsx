
import { IssueWithBuildStatus } from '@/types/buildStatus';

interface ReleasesStatsProps {
  issues: IssueWithBuildStatus[];
}

export default function ReleasesStats({ issues }: ReleasesStatsProps) {
  // Calculate statistics
  const totalIssues = issues.length;
  const issuesInBuild = issues.filter(issue => issue.buildStatus === 'in-build').length;
  const issuesTested = issues.filter(issue => 
    issue.fields.status.statusCategory.colorName === 'green'
  ).length;
  const issuesInTesting = issues.filter(issue => 
    issue.fields.status.statusCategory.colorName === 'yellow'
  ).length;

  const buildPercentage = totalIssues > 0 ? Math.round((issuesInBuild / totalIssues) * 100) : 0;
  const testProgress = totalIssues > 0 ? Math.round(((issuesTested + (issuesInTesting * 0.5)) / totalIssues) * 100) : 0;

  const Stats = [
    {
      title: 'Total Issues',
      stats: totalIssues.toString(),
    },
    {
      title: 'Build Coverage',
      stats: `${buildPercentage}%`,
    },
    {
      title: 'Testing Progress',
      stats: `${testProgress}%`,
    },
    {
      title: 'Ready for Release',
      stats: issuesTested.toString(),
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
