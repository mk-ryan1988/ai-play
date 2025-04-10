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
export interface GithubPullRequestData {
  [repoName: string]: GitHubResponse;
}
