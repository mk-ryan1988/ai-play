import { useEffect, useState } from 'react';
import Card from '../Card';
import { classNames } from '@/utils/classNames';

interface CommitInfo {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

interface PullRequestInfo {
  number: number;
  title: string;
  html_url: string;
  state: string;
}

interface GitHubResponse {
  exists: boolean;
  pullRequest?: PullRequestInfo;
  commits?: CommitInfo[];
  error?: string;
}

// data structure
interface ReleaseData {
  [repoName: string]: GitHubResponse;
}

export default function ReleaseChanges({ releaseName, repositories}: { releaseName: string, repositories: string[] }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReleaseData | null>(null);

  const activity = [
    { id: 1, type: 'created', person: { name: 'Chelsea Hagon' }, date: '7d ago', dateTime: '2023-01-23T10:32' },
    { id: 2, type: 'edited', person: { name: 'Chelsea Hagon' }, date: '6d ago', dateTime: '2023-01-23T11:03' },
    { id: 3, type: 'sent', person: { name: 'Chelsea Hagon' }, date: '6d ago', dateTime: '2023-01-23T11:24' },
    {
      id: 4,
      type: 'commented',
      person: {
        name: 'Chelsea Hagon',
        imageUrl:
          'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      comment: 'Called client, they reassured me the invoice would be paid by the 25th.',
      date: '3d ago',
      dateTime: '2023-01-23T15:56',
    },
    { id: 5, type: 'viewed', person: { name: 'Alex Curren' }, date: '2d ago', dateTime: '2023-01-24T09:12' },
    { id: 6, type: 'paid', person: { name: 'Alex Curren' }, date: '1d ago', dateTime: '2023-01-24T09:20' },
  ];

  useEffect(() => {
    async function checkRelease() {
      try {
        const repos = repositories ? repositories.join(',') : '';
        const response = await fetch(`/api/github/compare?release=${releaseName}${repos ? `&repositories=${repos}` : ''}`);
        const data = await response.json();

        if (data.error) {
          setData(null);
          return;
        }

        if (!Object.keys(data).length) {
          setData(null);
          return;
        }

        setData(data);
      } catch (error) {
        console.error('Error checking release:', error);
      } finally {
        setLoading(false);
      }
    }

    checkRelease();
  }, [releaseName, repositories]);

  if (loading) {
    return <div>Loading release information...</div>;
  }

  if (!data) {
    return <div>Error loading release information</div>;
  }

  return (
    <div className="space-y-4">
      { Object.keys(data).map((repo, index) => {
        const repoData = data[repo];
        const { exists, pullRequest, commits } = repoData;

        return (
          <div key={index}>
            <h2 className="text-title font-semibold mb-4">{repo}</h2>
            {exists ? (
              <>
                {/* {pullRequest && (
                  <div>
                    <p>Pull Request: <a href={pullRequest.html_url} target="_blank" rel="noopener noreferrer">{pullRequest.title}</a></p>
                    <p>Status: {pullRequest.state}</p>
                  </div>
                )} */}
                {commits && commits.length > 0 && (
                  <>
                  <ul role="list" className="mt-6 space-y-6">
                      {commits.map((commit, commitIdx) => (
                        <li
                          key={commit.sha}
                          className="relative flex gap-x-4"
                        >
                          <div
                            className={classNames(
                              commitIdx === commits.length - 1 ? 'h-6' : '-bottom-6',
                              'absolute left-0 top-0 flex w-6 justify-center'
                            )}
                          >
                            <div className="w-px bg-gray-200" />
                          </div>
                          <>
                              <div className="relative flex size-6 flex-none items-center justify-center">
                                <div className="size-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                              </div>
                              <Card className="flex w-full justify-between items-center py-3 px-4">
                                <div className="text-title">
                                  {commit.commit.message}

                                  <div className="mt-1 flex gap-x-2">
                                    <p className="text-xs leading-5 text-label">
                                      {commit.commit.author.name} on {new Date(commit.commit.author.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex-shrink-0 font-mono text-xs">
                                  <a
                                    href={commit.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-label hover:text-title"
                                  >
                                  {commit.sha.substring(0, 6)}
                                  </a>
                                </div>
                              </Card>
                            </>
                        </li>
                      ))}
                    </ul></>
                )}
              </>
            ) : (
              <p>No changes found for this release.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
