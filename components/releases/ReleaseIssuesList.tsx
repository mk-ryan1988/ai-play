import Badge from '../ui/Badge';
import { useEffect, useState } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';

type Issue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string;
    status: {
      name: string;
      statusCategory: {
        colorName: 'blue-gray' | 'yellow' | 'green' | 'default';
        self: string;
      };
    };
  }
};

const getIssueLink = (issueKey: string) => `${process.env.NEXT_PUBLIC_JIRA_URL}/browse/${issueKey}`;

export default function ReleaseIssuesList({ releaseSlug }: { releaseSlug: string }) {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (!releaseSlug) {
      return;
    }

    const fetchIssues = async () => {
      try {
        const response = await fetch(`/api/jira?fixVersion=${releaseSlug}`);
        const data = await response.json();
        console.log('Issues:', data);

        if (data.errorMessages) {
          console.error('Error fetching issues:', data.errorMessages[0]);
          return;
        }

        if (data.issues.length > 0) {
          setIssues(data.issues);
          return;
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    }

    fetchIssues();
  }, [releaseSlug]);

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
              <a href={getIssueLink(issue.key)} target="_blank" rel="noreferrer" className='text-label hover:text-title'>
                <ArrowTopRightOnSquareIcon className="w-5 h-5 cursor-pointer" />
              </a>
            </div>
          </div>
      ))}
    </div>
  );
}
