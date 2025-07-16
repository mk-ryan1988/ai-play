import { IssueWithBuildStatus } from '@/types/buildStatus'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import Badge from '../ui/Badge'

const statusColorMap = {
  'unknown': 'gray',
  'in-build': 'green',
  'partially-in-build': 'yellow',
  'not-in-build': 'red',
  'removed': 'red'
} as const

const getIssueLink = (issueKey: string) =>
  `${process.env.NEXT_PUBLIC_JIRA_URL}/browse/${issueKey}`

export default function ReleaseIssuesTable({
  issues,
}: {
  issues: IssueWithBuildStatus[]
}) {
  return (
    <div className="bg-background py-8">
      <table className="w-full text-left text-sm">
        <colgroup>
          <col className="w-1/4" />
          <col className="w-1/4" />
          <col className="w-1/6" />
          <col className="w-1/6" />
          <col className="w-1/6" />
          <col className="w-6" />
        </colgroup>
        <thead className="border-b border-tertiary text-label font-mono uppercase text-xs">
          <tr>
            <th className="py-2 px-4">Issue</th>
            <th className="py-2 px-4">Assignee</th>
            <th className="py-2 px-4">Tester</th>
            <th className="py-2 px-4">Testing Status</th>
            <th className="py-2 px-4">Build</th>
            <th className="py-2 px-4 text-right">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tertiary text-foreground">
          {issues.map((issue) => (
            <tr key={issue.id} className="hover:bg-background/50 transition-colors">
              <td className="py-3 px-4">
                <div className="font-medium">{issue.key}</div>
                <div className="text-label text-xs truncate">{issue.fields.summary}</div>
              </td>
              <td className="py-3 px-4">
                {issue.fields.assignee && (
                  <div className="flex items-center gap-2">
                    <img
                      src={issue.fields.assignee.avatarUrls['24x24']}
                      alt={issue.fields.assignee.displayName}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{issue.fields.assignee.displayName}</span>
                  </div>
                )}
              </td>
              <td className="py-3 px-4">
                {issue.fields.customfield_10038 && (
                  <div className="flex items-center gap-2">
                    <img
                      src={issue.fields.customfield_10038[0].avatarUrls['24x24']}
                      alt={issue.fields.customfield_10038[0].displayName}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{issue.fields.customfield_10038[0].displayName}</span>
                  </div>
                )}
              </td>
              <td className="py-3 px-4">
                {/* <Badge color={issue.fields.status.statusCategory.colorName}>
                  {issue.fields.status.name}
                </Badge> */}
                {issue.fields.customfield_10037?.value && (
                  <Badge>
                    {issue.fields.customfield_10037.value}
                  </Badge>
                )}
              </td>
              <td className="py-3 px-4">
                <Badge color={statusColorMap[issue.buildStatus] ?? 'gray'}>
                  {issue.buildStatus.replace(/-/g, ' ')}
                </Badge>
              </td>
              <td className="py-3 px-4 text-right">
                <a
                  href={getIssueLink(issue.key)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-label hover:text-title"
                >
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 inline" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
