'use client';

import Card from '@/components/Card';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Issue } from '@/types/jira/issueTypes';
import PageWrapper from '@/components/layout/PageWrapper';
import ReleasesStats from '@/components/releases/ReleaseStats';
import ReleaseChanges from '@/components/releases/ReleaseChanges';
import ReleaseIssuesList from '@/components/releases/ReleaseIssuesList';
import { GithubPullRequestData } from '@/types/github/pullRequestTypes';
import { determineIssuesBuildStatus } from '@/utils/buildStatus';
import { IssueWithBuildStatus } from '@/types/buildStatus';
import { Database } from '@/types/supabase';

type VersionIssue = Database['public']['Tables']['version_issues']['Row'];

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

export default function ReleasePage() {
  const { slug } = useParams();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [versionIssues, setVersionIssues] = useState<VersionIssue[]>([]);
  const [changes, setChanges] = useState<GithubPullRequestData | null>(null);
  const [processedIssues, setProcessedIssues] = useState<IssueWithBuildStatus[]>([]);

  const tabs = [
    {
      name: 'Overview',
      key: 'overview',
    },
    {
      name: 'Changes',
      key: 'changes',
    },
  ];

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

      // Fetch or create version issues after we have the release data
      if (releaseData?.id) {
        const versionIssuesResponse = await fetch(`/api/version-issues?versionId=${releaseData.id}`);
        const versionIssuesData = await versionIssuesResponse.json();
        const issues = versionIssuesData.issues || [];

        if (issues.length > 0) {
          setVersionIssues(issues);
        }

        // issuesData loop and create version issues
        for (const issue of issuesData.issues || []) {
          const existingIssue = versionIssues.find(v => v.issue_key === issue.key);
          if (!existingIssue) {
            await fetch('/api/version-issues/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                version_id: releaseData.id,
                issue_key: issue.key,
              }),
            });
          }
        }
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

  useEffect(() => {
    console.log('projects:', release);
  }, [release]);

  useEffect(() => {
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (issues.length && changes) {
      const processedIssues = determineIssuesBuildStatus(
        issues,
        versionIssues,
        changes
      );
      setProcessedIssues(processedIssues);
    }
  }, [issues, changes, versionIssues]);

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
            <Card className="rounded-b-none">
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
              <ReleaseIssuesList issues={processedIssues} versionId={release.id} onStatusUpdate={() => fetchData()} />
            </div>
          </>
        )}

        {activeTab === 'changes' &&
          <ReleaseChanges
            changes={changes}
          />}
      </div>
    </PageWrapper>
  );
}
