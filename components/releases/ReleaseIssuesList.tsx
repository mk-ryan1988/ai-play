import { IssueWithBuildStatus } from '@/types/buildStatus';
import Badge from '../ui/Badge';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';

const getIssueLink = (issueKey: string) => `${process.env.NEXT_PUBLIC_JIRA_URL}/browse/${issueKey}`;

const statusColorMap = {
  'unknown': 'gray',
  'in-build': 'green',
  'partially-in-build': 'yellow',
  'not-in-build': 'red',
  'removed': 'red'
} as const;

export default function ReleaseIssuesList({
  issues
}: {
  issues: IssueWithBuildStatus[]
}) {
  return (
    <div className="space-y-px divide-y divide-tertiary">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="flex items-center justify-between py-4 hover:bg-background/50 transition-colors"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {`${issue.key} - ${issue.fields.summary}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge color={issue.fields.status.statusCategory.colorName}>
              {issue.fields.status.name}
            </Badge>
            <Badge color={statusColorMap[issue.buildStatus]}>
              {issue.buildStatus.replace(/-/g, ' ')}
            </Badge>
            <a href={getIssueLink(issue.key)} target="_blank" rel="noreferrer" className='text-label hover:text-title'>
              <ArrowTopRightOnSquareIcon className="w-5 h-5 cursor-pointer" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
