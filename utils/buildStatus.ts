import { BuildStatus, IssueWithBuildStatus } from '@/types/buildStatus';
import { GithubPullRequestData } from '@/types/github/pullRequestTypes';
import { Issue } from '@/types/jira/issueTypes';

export const determineIssuesBuildStatus = (
  issues: Issue[],
  changes: GithubPullRequestData | null
): IssueWithBuildStatus[] => {
  if (!changes || !issues.length) {
    return issues.map(issue => ({ ...issue, buildStatus: 'unknown' as BuildStatus }));
  }

  return issues.map(issue => {
    // Check if issue has release label
    const hasReleaseLabel = issue.fields?.labels?.includes('release-current');
    if (!hasReleaseLabel) {
      return { ...issue, buildStatus: 'unknown' as BuildStatus };
    }

    // Check all repositories for commits containing the issue key
    const issueInRepos = Object.values(changes).reduce((count, repoData) => {
      if (!repoData.exists || !repoData.commits?.length) return count;

      const hasIssueCommit = repoData.commits.some(commit =>
        commit.commit.message.toUpperCase().includes(issue.key)
      );

      return hasIssueCommit ? count + 1 : count;
    }, 0);

    let buildStatus: BuildStatus = 'not-in-build';
    if (issueInRepos > 0) {
      buildStatus = issueInRepos === Object.keys(changes).length
        ? 'in-build'
        : 'partially-in-build';
    }

    return { ...issue, buildStatus };
  });
};
