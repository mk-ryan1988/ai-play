import { BuildStatus, IssueWithBuildStatus } from '@/types/buildStatus';
import { GithubPullRequestData } from '@/types/github/pullRequestTypes';
import { Issue } from '@/types/jira/issueTypes';
import { Database } from '@/types/supabase';

type VersionIssue = Database['public']['Tables']['version_issues']['Row'];

export const determineIssuesBuildStatus = (
  issues: Issue[],
  versionIssues: VersionIssue[],
  changes: GithubPullRequestData | null
): IssueWithBuildStatus[] => {
  if (!changes || !issues.length) {
    return issues.map(issue => ({ ...issue, buildStatus: 'unknown' as BuildStatus, statusOverridden: false }));
  }

  return issues.map(issue => {
    // First check if we have a stored build status for this issue
    const versionIssue = versionIssues.find(vi => vi.issue_key === issue.key);
    if (versionIssue?.build_status) {
      return {
        ...issue,
        buildStatus: versionIssue.build_status as BuildStatus,
        statusOverridden: true,
        versionIssueId: versionIssue.id
      };
    }

    const hasReleaseLabel = issue.fields?.labels?.includes('release-current');
    if (!hasReleaseLabel) {
      return { ...issue, buildStatus: 'unknown' as BuildStatus, statusOverridden: false, versionIssueId: versionIssue?.id };
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

    return {
      ...issue,
      buildStatus,
      statusOverridden: false,
      versionIssueId: versionIssue?.id
    };
  });
};
