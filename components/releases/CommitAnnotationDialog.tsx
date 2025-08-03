import { useState } from 'react';
import { CommitInfo } from '@/types/github/pullRequestTypes';

type Annotation = {
  id: string;
  version_id: string;
  repository: string;
  commit_sha: string;
  note: string;
  reviewed_by: string;
  reviewed_at: string;
};

interface CommitAnnotationDialogProps {
  commit: CommitInfo;
  annotation?: Annotation;
  onSave: (note: string) => Promise<void>;
}

export default function CommitAnnotationDialog({ commit, annotation, onSave }: CommitAnnotationDialogProps) {
  const [note, setNote] = useState(annotation?.note || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(note);
    } catch (error) {
      console.error('Error saving annotation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-label mb-2">Commit Message</h3>
        <div className="bg-tertiary/20 rounded-md p-3">
          <p className="text-sm text-title">{commit.commit.message}</p>
        </div>
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-label mb-2">
          Explanation
        </label>
        <textarea
          id="note"
          rows={4}
          className="w-full rounded-md border border-tertiary bg-secondary p-3 text-sm text-title"
          placeholder="Explain why this commit doesn't need a Jira reference..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!note.trim() || isSaving}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
