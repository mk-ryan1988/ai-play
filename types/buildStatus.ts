import { Issue } from "./jira/issueTypes";

export type BuildStatus = 'unknown' | 'not-in-build' | 'partially-in-build' | 'in-build' | 'removed';

export interface IssueWithBuildStatus extends Issue {
  buildStatus: BuildStatus;
  statusOverridden: boolean;
  versionIssueId?: string;
}
