import { useEffect, useState } from 'react';
import { classNames } from '@/utils/classNames';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { GithubPullRequestData, CommitInfo } from '@/types/github/pullRequestTypes';
import CommitRow from './CommitRow';

interface ReleaseChangesProps {
  changes: GithubPullRequestData | null;
  unlinkedCommits: Array<{ repo: string; commit: CommitInfo }>;
  versionId: string;
}

type Annotation = {
  id: string;
  version_id: string;
  repository: string;
  commit_sha: string;
  note: string;
  reviewed_by: string;
  reviewed_at: string;
};

export default function ReleaseChanges({ changes, unlinkedCommits, versionId }: ReleaseChangesProps) {
  const [expanded, setExpanded] = useState<string[] | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const handleToggle = (repo: string) => {
    if (expanded && expanded.includes(repo)) {
      setExpanded(expanded.filter((r) => r !== repo));
    } else {
      setExpanded(expanded ? [...expanded, repo] : [repo]);
    }
  };

  useEffect(() => {
    if (changes) {
      setExpanded(Object.keys(changes));
    }
  }, [changes]);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const response = await fetch(`/api/version-commit-checks?version_id=${versionId}`);
        const data = await response.json();
        setAnnotations(data.data || []);
      } catch (error) {
        console.error('Error fetching annotations:', error);
      }
    };

        console.log('Fetching annotations for versionId:', versionId);


    if (versionId) {
      fetchAnnotations();
    }
  }, [versionId]);

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
                        <CommitRow
                          key={commit.sha}
                          commit={commit}
                          isLast={commitIdx === commits.length - 1}
                          versionId={versionId}
                          repository={repo}
                          annotation={annotations.find(a => a.commit_sha === commit.sha)}
                        />
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
