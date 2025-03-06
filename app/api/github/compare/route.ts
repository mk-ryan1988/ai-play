import { type NextRequest } from 'next/server'
import NodeRSA from 'node-rsa';
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

const initOctokit = () => {
  const APP_ID = process.env.NEXT_PUBLIC_GITHUB_APP_ID;
  const PRIVATE_KEY = process.env.NEXT_PUBLIC_GITHUB_PRIVATE_KEY ?? '';
  const INSTALLATION_ID = 50343804;

  const key = new NodeRSA(PRIVATE_KEY, 'pkcs1-private-pem');
  const PKCS8_PRIVATE_KEY = key.exportKey('pkcs8-private-pem');

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: APP_ID,
      privateKey: PKCS8_PRIVATE_KEY,
      installationId: INSTALLATION_ID
    }
  });

  return octokit;
};

const fetchChangesForRelease = async (releaseName: string, repository: string) => {
  const data: {
    exists: boolean,
    pullRequest: unknown,
    commits: unknown[]
  } = {
    exists: false,
    pullRequest: null,
    commits: []
  }

  const octokit = initOctokit();

  // E.g https://github.com/mk-ryan1988/release-current
  // Get owner and repo name
  const [repo, owner] = repository.split('/').reverse();

  console.log('owner', owner);
  console.log('repo', repo);


  // First, find the PR for this release
  const prs = await octokit.pulls.list({
    owner,
    repo,
    state: 'all',
    head: `release/${releaseName}`
  });

  if (prs.data.length === 0) {
    return data;
  }

  const pr = prs.data[0];

  // Get the commits for this PR
  const commits = await octokit.pulls.listCommits({
    owner,
    repo,
    pull_number: pr.number
  });

  data.exists = true;
  data.pullRequest = pr;
  data.commits = commits.data;

  return data;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const releaseName = searchParams.get('release');
    const repositories = searchParams.get('repositories')?.split(',');

    if (!releaseName) {
      return new Response('Release name is required', { status: 400 });
    }

    if (!repositories || repositories.length === 0) {
      return new Response('Repositories are required', { status: 400 });
    }

    const data = await Promise.all(repositories.map(repository => fetchChangesForRelease(releaseName, repository)));

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    return new Response(`github error: ${error.message}`, {
      status: 500,
    })
  }
}


