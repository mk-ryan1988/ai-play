import { ChatBubbleOvalLeftEllipsisIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { CommitInfo } from '@/types/github/pullRequestTypes';
import { classNames } from '@/utils/classNames';
import Card from '../Card';
import { useDialog } from '@/contexts/DialogContext';
import CommitAnnotationDialog from './CommitAnnotationDialog';

type Annotation = {
  id: string;
  version_id: string;
  repository: string;
  commit_sha: string;
  note: string;
  reviewed_by: string;
  reviewed_at: string;
};

interface CommitRowProps {
  commit: CommitInfo;
  isLast: boolean;
  versionId: string;
  repository: string;
  annotation?: Annotation;
}

export default function CommitRow({ commit, isLast, versionId, repository, annotation }: CommitRowProps) {
  const { openDialog } = useDialog();

  return (
    <li className="relative flex gap-x-4">
      <div
        className={classNames(
          isLast ? 'h-6' : '-bottom-6',
          'absolute left-0 top-0 flex w-6 justify-center'
        )}
      >
        <div className="w-px bg-tertiary" />
      </div>
      <div className="relative flex size-6 mt-3 flex-none items-center justify-center">
        <div className="size-1.5 rounded-full bg-tertiary ring-1 ring-tertiary" />
      </div>
      <Card
        className={classNames(
          "flex w-full justify-between items-start py-3 px-4",
          commit.untracked && !annotation ? "border-red-500 border" : "",
          annotation ? "border-green-500 border" : ""
        )}
      >
        <div className="text-title flex items-start gap-2">
          {commit.untracked && !annotation && (
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div>
            {commit.commit.message}
            <div className="mt-1 space-y-1">
              <p className="text-xs leading-5 text-label">
                {commit.commit.author.name} on {new Date(commit.commit.author.date).toLocaleDateString()}
              </p>
              {annotation && (
                <p className="text-xs leading-5 text-green-500 bg-green-500/10 px-2 py-1 rounded">
                  {annotation.note}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {(commit.untracked || annotation) && (
            <button
              onClick={() => {
                openDialog({
                  title: 'Annotate Commit',
                  content: (
                    <CommitAnnotationDialog
                      commit={commit}
                      annotation={annotation}
                      onSave={async (note) => {
                        await fetch('/api/version-commit-checks', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            version_id: versionId,
                            repository,
                            commit_sha: commit.sha,
                            note,
                          }),
                        });
                      }}
                    />
                  ),
                });
              }}
              className="p-1 hover:bg-tertiary rounded-md transition-colors"
            >
              <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-label hover:text-title" />
            </button>
          )}
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
        </div>
      </Card>
    </li>
  );
}
