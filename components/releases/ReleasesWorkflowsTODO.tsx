import Card from '../Card';
import { useState, useEffect } from 'react';
import { classNames } from '@/utils/classNames';
import { ChecklistItem } from '@/types/checklistItem';
import TextEditor from '@/components/editor/TextEditor';

export default function ReleasesWorkflows({ releaseId }: { releaseId: string }) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [environment, setEnvironment] = useState('Staging');
  let clickTimeout: NodeJS.Timeout | null = null;

  const handleSingleClick = async (itemId: string) => {
    const updatedChecklist = checklist.map((item) =>
      item.id === itemId
        ? {
            ...item,
            status: item.status === 'unchecked' ? 'checked' : 'unchecked',
          }
        : item
    );
    setChecklist(updatedChecklist);

    const updatedItem = updatedChecklist.find((item) => item.id === itemId);
    await fetch(`/api/releases/checklists`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: itemId, status: updatedItem?.status }),
    });
  };

  const handleDoubleClick = async (itemId: string) => {
    const updatedChecklist = checklist.map((item) =>
      item.id === itemId
        ? {
            ...item,
            status: 'skipped',
          }
        : item
    );
    setChecklist(updatedChecklist);

    const updatedItem = updatedChecklist.find((item) => item.id === itemId);
    await fetch(`/api/releases/checklists`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: itemId, status: updatedItem?.status }),
    });
  };

  const handleClick = (itemId: string) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
      handleDoubleClick(itemId);
    } else {
      clickTimeout = setTimeout(() => {
        handleSingleClick(itemId);
        clickTimeout = null;
      }, 200);
    }
  };

  const outstandingCount = 0;
  const environments = ['Staging', 'Production'];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <Card>
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-tertiary pb-4">
            <h2 className="font-semibold">
              <select
                className="bg-transparent border-none"
                defaultValue={environment}
                onChange={(e) => setEnvironment(e.target.value)}
              >
                {environments.map((env) => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
            </h2>


          </div>

          {/* {orderedCategories.map((category) => (
            <ReleaseWorkflowItem
              key={category.key}
              category={category}
              groupedChecklist={groupedChecklist}
              handleClick={handleClick}
            />
          ))} */}

          <TextEditor />
        </div>
      </Card>

      <Card
        className=""
      >
      </Card>
    </div>
  );
}
