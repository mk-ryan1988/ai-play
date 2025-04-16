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

      const commits = repoData.commits.reduce((commitAcc, commit) => {
        const message = commit.commit.message.toUpperCase();
        const isRevert = message.startsWith('REVERT') && message.includes(issue.key);
        const isCommit = message.includes(issue.key);

        if (isRevert) {
          commitAcc.reverted = true;
        } else if (isCommit && !commitAcc.reverted) {
          commitAcc.hasCommit = true;
        }

        return commitAcc;
      }, { hasCommit: false, reverted: false });

      // Only count repository if it has non-reverted commits
      if (commits.hasCommit && !commits.reverted) {
        acc.count++;
      } else if (commits.reverted) {
        acc.hasReverts = true;
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
