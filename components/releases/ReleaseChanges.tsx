import { useEffect, useState } from 'react';
import Card from '../Card';
import { classNames } from '@/utils/classNames';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { GithubPullRequestData } from '@/types/github/pullRequestTypes';

export default function ReleaseChanges({ changes }: { changes: GithubPullRequestData | null }) {
  const [expanded, setExpanded] = useState<string[] | null>(null);

  useEffect(() => {
    if (changes) {
      setExpanded(Object.keys(changes));
    }
  }, [changes]);

  if (!changes) {
    return <div>No changes found for this release.</div>;
  }

  return (
    <div className="space-y-4">
      { Object.keys(changes).map((repo, index) => {
        const repoData = changes[repo];
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
