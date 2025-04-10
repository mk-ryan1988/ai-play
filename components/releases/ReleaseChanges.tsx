import { useEffect, useState } from 'react';
import Card from '../Card';
import { classNames } from '@/utils/classNames';
import { ChevronUpIcon } from '@heroicons/react/24/solid';

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
  const [expanded, setExpanded] = useState<string[] | null>(null);

  const handleToggle = (repo: string) => {
    if (expanded && expanded.includes(repo)) {
      setExpanded(expanded.filter((r) => r !== repo));
    } else {
      setExpanded(expanded ? [...expanded, repo] : [repo]);
    }
  };

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

        setExpanded(Object.keys(data));
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

            <button
              type="button"
              className="flex items-center gap-x-2 text-sm font-semibold leading-6 text-label hover:text-title"
              onClick={() => {handleToggle(repo)}}
            >
              {expanded && expanded.includes(repo) ? (
                <ChevronUpIcon className='w-4 h-4 font-bold ml-1.5 mr-3' />
              ) : (
                <ChevronUpIcon className='w-4 h-4 font-bold ml-1.5 mr-3 rotate-180' />
              )}
              <h2 className="text-title font-semibold">{repo}</h2>
            </button>
            {exists ? (
              <>
                {commits && commits.length > 0 && (
                  <>
                  <ul
                    role="list"
                    className={classNames(
                      'mt-6 space-y-6',
                      expanded && expanded.includes(repo) ? 'block' : 'hidden'
                    )}
                  >
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
                            <div className="w-px bg-tertiary" />
                          </div>
                          <>
                              <div className="relative flex size-6 mt-3 flex-none items-center justify-center">
                                <div className="size-1.5 rounded-full bg-tertiary ring-1 ring-tertiary" />
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
