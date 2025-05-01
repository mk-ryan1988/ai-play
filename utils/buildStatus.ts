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
    const hasReleaseLabel = issue.fields?.labels?.includes('release-current');
    if (!hasReleaseLabel) {
      return { ...issue, buildStatus: 'unknown' as BuildStatus };
    }

    // Check all repositories for commits and reverts
    const issueInRepos = Object.values(changes).reduce((acc, repoData) => {
      if (!repoData.exists || !repoData.commits?.length) return acc;

      // Sort commits by date in descending order (newest first)
      const sortedCommits = [...repoData.commits].sort((a, b) => {
        return new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime();
      });

      // Find the latest commit that mentions this issue
      const latestRelevantCommit = sortedCommits.find(commit => {
        const message = commit.commit.message.toUpperCase();
        return message.includes(issue.key);
      });

      if (latestRelevantCommit) {
        const message = latestRelevantCommit.commit.message.toUpperCase();
        const isRevert = message.startsWith('REVERT');

        if (isRevert) {
          acc.hasReverts = true;
        } else {
          acc.count++;
        }
      }

      return acc;
    }, { count: 0, hasReverts: false });

    let buildStatus: BuildStatus;

    if (issueInRepos.hasReverts) {
      buildStatus = 'removed';
    } else if (issueInRepos.count === 0) {
      buildStatus = 'not-in-build';
    } else if (issueInRepos.count === Object.keys(changes).length) {
      buildStatus = 'in-build';
    } else {
      buildStatus = 'partially-in-build';
    }

    return { ...issue, buildStatus };
  });
};
