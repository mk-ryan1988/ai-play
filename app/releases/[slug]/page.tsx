'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper';
import ReleasesStats from '@/components/releases/ReleaseStats';
import ReleaseChanges from '@/components/releases/ReleaseChanges';
import ReleaseIssuesList from '@/components/releases/ReleaseIssuesList';
import ReleaseWorkflows from '@/components/releases/ReleasesWorkflows';
import Card from '@/components/Card';

interface Release {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: string;
  projects: {
    name: string;
    repositories: string[];
  };
}

interface ReleaseData {
  [repoName: string]: GitHubResponse;
}

export default function ReleasePage() {
  const { slug } = useParams();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [changes, setChanges] = useState<ReleaseData | null>(null);

  const tabs = [
    {
      name: 'Overview',
      key: 'overview',
    },
    {
      name: 'Changes',
      key: 'changes',
    },
    {
      name: 'Workflows',
      key: 'workflows',
    },
  ];

  useEffect(() => {
    console.log('projects:', release);
  }, [release]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [releaseResponse, issuesResponse] = await Promise.all([
          fetch(`/api/releases/${slug}`),
          fetch(`/api/jira?fixVersion=${slug}`)
        ]);

        const [releaseData, issuesData] = await Promise.all([
          releaseResponse.json(),
          issuesResponse.json()
        ]);

        setRelease(releaseData);

        if (issuesData.issues?.length > 0) {
          setIssues(issuesData.issues);
        }

        // Fetch changes after we have the release data
        if (releaseData?.projects?.repositories) {
          const repos = releaseData.projects.repositories.join(',');
          const changesResponse = await fetch(
            `/api/github/compare?release=${releaseData.name}&repositories=${repos}`
          );
          const changesData = await changesResponse.json();

          if (!changesData.error && Object.keys(changesData).length > 0) {
            setChanges(changesData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
            <Card>
              <span className="text-title font-semibold">{release.projects.name}</span>
              <span className="text-subtitle">/</span>
              <span className="text-title font-semibold">{release.name}</span>
              <p className="w-full mt-2 mb-3">{release.description}</p>
              <div className="flex gap-2">
                <span className="text-subtitle">Status:</span>
                <span className="text-title font-semibold">{release.status}</span>
              </div>
            </Card>

            <ReleasesStats />

            <div className="mt-4 p-4">
              <h2 className="text-title font-semibold mb-4">Issues</h2>
              <ReleaseIssuesList issues={issues} />
            </div>
          </>
        )}

        {activeTab === 'changes' &&
          <ReleaseChanges
            changes={changes}
          />}
        {activeTab === 'workflows' &&
          <ReleaseWorkflows releaseId={release.id} />
        }
      </div>
    </PageWrapper>
  );
}
