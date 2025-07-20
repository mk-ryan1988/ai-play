import { IssueWithBuildStatus } from '@/types/buildStatus'
import { ArrowPathIcon, ArrowTopRightOnSquareIcon, WrenchIcon } from '@heroicons/react/24/solid'
import Badge from '../ui/Badge'
import { useState } from 'react'

const statusColorMap = {
  'unknown': 'gray',
  'in-build': 'green',
  'partially-in-build': 'yellow',
  'not-in-build': 'red',
  'removed': 'red'
} as const

const getIssueLink = (issueKey: string) =>
  `${process.env.NEXT_PUBLIC_JIRA_URL}/browse/${issueKey}`

interface ReleaseIssuesTableProps {
  issues: IssueWithBuildStatus[];
  versionId: string;
  onStatusUpdate?: () => void;
}

export default function ReleaseIssuesTable({
  issues,
  versionId,
  onStatusUpdate
}: ReleaseIssuesTableProps) {
  const [updatingIssue, setUpdatingIssue] = useState<string | null>(null);
  const [editingIssue, setEditingIssue] = useState<string | null>(null);
  const [resettingIssue, setResettingIssue] = useState<string | null>(null);

  const handleResetStatus = async (issue: IssueWithBuildStatus) => {
    try {
      setResettingIssue(issue.key);
      const response = await fetch('/api/version-issues/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          versionId,
          issueKey: issue.key,
          buildStatus: null,
          versionIssueId: issue.versionIssueId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reset status');
      }

      onStatusUpdate?.();
    } catch (error) {
      console.error('Error resetting build status:', error);
    } finally {
      setResettingIssue(null);
    }
  };

  const handleEditClick = (issueKey: string) => {
    setEditingIssue(editingIssue === issueKey ? null : issueKey);
  };

  const handleStatusChange = async (issue: IssueWithBuildStatus, newStatus: string) => {
    try {
      setUpdatingIssue(issue.key);
      const response = await fetch('/api/version-issues/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          versionId,
          issueKey: issue.key,
          buildStatus: newStatus,
          versionIssueId: issue.versionIssueId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      onStatusUpdate?.();
      setEditingIssue(null);
    } catch (error) {
      console.error('Error updating build status:', error);
    } finally {
      setUpdatingIssue(null);
    }
  };
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
            <th className="py-2 pr-4">Issue</th>
            <th className="py-2 px-4">Assignee</th>
            <th className="py-2 px-4">Tester</th>
            <th className="py-2 px-4">Testing Status</th>
            <th className="py-2 px-4">Build</th>
            <th className="py-2 pl-4 text-right">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tertiary text-foreground">
          {issues.map((issue) => (
            <tr key={issue.id} className="hover:bg-background/50 transition-colors">
              <td className="py-3 pr-4">
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
              <td className="py-3 px-4 flex items-center gap-2 w-fit">
                {/* <Badge color={statusColorMap[issue.buildStatus] ?? 'gray'}>
                  {issue.buildStatus.replace(/-/g, ' ')}
                </Badge> */}

                <select
                  className="form-input"
                  value={issue.buildStatus}
                  onChange={(e) => handleStatusChange(issue, e.target.value)}
                  disabled={updatingIssue === issue.key || editingIssue !== issue.key}
                >
                  <option value="">Magic</option>
                  <option value="in-build">In Build</option>
                  <option value="partially-in-build">Partially In Build</option>
                  <option value="not-in-build">Not In Build</option>
                  <option value="removed">Removed</option>
                  <option value="unknown">Unknown</option>
                </select>

                {updatingIssue === issue.key ? (
                  <svg className="animate-spin h-5 w-5 ml-2 text-label" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <WrenchIcon
                    onClick={() => handleEditClick(issue.key)}
                    className={`inline w-5 h-5 ml-2 cursor-pointer hover:text-title ${issue.statusOverridden ? 'text-title' : 'text-muted-foreground'}`}
                    title={issue.statusOverridden ? "Status Overridden" : "Computed Status"}
                  />
                )}

                {/* add an clickable refresh icon that reverts the status change and uses the computed logic */}
                { issue.statusOverridden && (
                  resettingIssue === issue.key ? (
                    <svg className="animate-spin h-5 w-5 ml-2 text-label" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <ArrowPathIcon
                      onClick={() => handleResetStatus(issue)}
                      className="inline w-5 h-5 ml-2 cursor-pointer hover:text-title text-muted-foreground"
                      title="Revert to Computed Status"
                    />
                  )
                )}
              </td>
              <td className="py-3 pl-4 text-right">
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
