import { useEffect, useState } from 'react';

interface CommitInfo {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
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

export default function ReleaseChecks({ releaseName, repositories}: { releaseName: string, repositories: string[] }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GitHubResponse | null>(null);

  useEffect(() => {
    async function checkRelease() {
      try {
        const repos = repositories ? repositories.join(',') : '';
        const response = await fetch(`/api/github/compare?release=${releaseName}${repos ? `&repositories=${repos}` : ''}`);
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error checking release:', error);
      } finally {
        setLoading(false);
      }
    }

    checkRelease();
  }, [releaseName]);

  if (loading) {
    return <div>Loading release information...</div>;
  }

  if (!data) {
    return <div>Error loading release information</div>;
  }

  if (!data.exists) {
    return (
      <div className="text-red-500">
        No pull request found for release/{releaseName}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold">Pull Request</h3>
        <a
          href={data.pullRequest?.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          #{data.pullRequest?.number} - {data.pullRequest?.title}
        </a>
        <span className={`ml-2 px-2 py-1 rounded text-sm ${
          data.pullRequest?.state === 'open' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {data.pullRequest?.state}
        </span>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Commits</h3>
        <ul className="space-y-2">
          {data.commits?.map((commit) => (
            <li key={commit.sha} className="border-l-2 border-gray-200 pl-3">
              <p className="font-medium">{commit.commit.message}</p>
              <p className="text-sm text-gray-500">
                {commit.commit.author.name} - {new Date(commit.commit.author.date).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
