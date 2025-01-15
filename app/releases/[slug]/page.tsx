'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper';
import ReleasesStats from '@/components/releases/ReleaseStats';
import ReleaseIssuesList from '@/components/releases/ReleaseIssuesList';
import ReleaseCheckList from '@/components/releases/ReleasesCheckList';

interface Release {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: string;
  projects: {
    name: string;
  };
}

export default function ReleasePage() {
  const { slug } = useParams();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      name: 'Overview',
      key: 'overview',
    },
    {
      name: 'Checks',
      key: 'checks',
    },
  ];

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const response = await fetch(`/api/releases/${slug}`);
        const data = await response.json();
        setRelease(data);
      } catch (error) {
        console.error('Error fetching release:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelease();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!release) {
    return <div>Release not found</div>;
  }

  return (
    <PageWrapper
      title={`Releases`}
      backTo="/releases"
    >
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${activeTab === tab.key ? 'font-bold' : ''} px-4 py-2 rounded-md`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'overview' && (
          <>
            <div className="flex flex-wrap gap-2 p-4 border border-tertiary rounded-tl rounded-tr border-b-0">
              <span className="text-title font-semibold">{release.projects.name}</span>
              <span className="text-subtitle">/</span>
              <span className="text-title font-semibold">{release.name}</span>
              <p className="w-full mt-2 mb-3">{release.description}</p>
              <div className="flex gap-2">
                <span className="text-subtitle">Status:</span>
                <span className="text-title font-semibold">{release.status}</span>
              </div>
            </div>

            <ReleasesStats />

            <div className="mt-4 p-4">
              <h2 className="text-title font-semibold mb-4">Issues</h2>
              <ReleaseIssuesList releaseSlug={release.slug} />
            </div>
          </>
        )}

        {activeTab === 'checks' && <ReleaseCheckList releaseId={release.id} />}
      </div>
    </PageWrapper>
  );
}
