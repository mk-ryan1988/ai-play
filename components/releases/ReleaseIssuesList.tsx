import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ReleaseIssuesList({ releaseId }: { releaseId: string }) {
  const mockIssues = [
    {
      id: '1',
      title: 'Issue 1',
      description: 'Description 1',
      status: 'ready_to_test',
    },
    {
      id: '2',
      title: 'Issue 2',
      description: 'Description 2',
      status: 'in_progress',
    },
    {
      id: '3',
      title: 'Issue 3',
      description: 'Description 3',
      status: 'ready_to_test',
    },

  ];

  return (
    <div className="space-y-px divide-y divide-tertiary">
      {mockIssues.map((issue) => (
            <div
            key={issue.id}
            className="flex items-center justify-between py-4 hover:bg-background/50 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {`${issue.title}`}
                </span>
              </div>

              <div className="text-sm text-gray-400">
                <p className="line-clamp-2 pr-4">{ issue.description }</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                issue.status === 'ready_to_test'
                  ? 'bg-purple-500/10 text-purple-400'
                  : 'bg-gray-700/50 text-gray-300'
              }`}>
                {issue.status}
              </span>
              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            </div>
          </div>
      ))}
    </div>
  );
}
