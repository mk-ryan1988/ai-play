import { type NextRequest } from 'next/server'
// import { App, Octokit } from "octokit";

import NodeRSA from 'node-rsa';
import githubAppJwt from "universal-github-app-jwt";

import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export async function GET(request: NextRequest) {
  try {
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

    // const response = await octokit.repos.get({
    //   owner: 'mk-ryan1988',
    //   repo: 'voodoo'
    // });

    const response = await octokit.pulls.list({
      owner: 'mk-ryan1988',
      repo: 'voodoo'
    });
    console.log(response.data);

    return new Response(JSON.stringify(response.data), {
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (error: any) {
    return new Response(`github error: ${error.message}`, {
      status: 500,
    })
  }
}


// if (!APP_ID || !PRIVATE_KEY) {
//   return new Response('missing env variables', {
//     status: 500,
//   });
// }

// const APP_INSTALLATION_ID = 50343804;

// const key = new NodeRSA(PRIVATE_KEY, 'pkcs1-private-pem');
// const PKCS8_PRIVATE_KEY = key.exportKey('pkcs8-private-pem');

// const { token, appId, expiration } = await githubAppJwt({
//   id: Number(APP_ID),
//   privateKey: PKCS8_PRIVATE_KEY,
// });

// const app = new App({ appId, privateKey: PKCS8_PRIVATE_KEY });
// const { data: slug } = await app.octokit.rest.apps.getAuthenticated();
// const octokit = await app.getInstallationOctokit(APP_INSTALLATION_ID);

// const { data: { login } } = await octokit.rest.users.getAuthenticated();

// return Response.json({ login });
