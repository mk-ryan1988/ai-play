import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const JIRA_URL = process.env.NEXT_PUBLIC_JIRA_URL;
  const API_TOKEN = process.env.NEXT_PUBLIC_JIRA_API_KEY;
  const EMAIL = process.env.NEXT_PUBLIC_JIRA_EMAIL;
  const PROJECT_KEY = process.env.NEXT_PUBLIC_JIRA_PROJECT_KEY;

  const auth = Buffer.from(`${EMAIL}:${API_TOKEN}`).toString('base64');

  const generateEndpoint = (entity: string, key?: string) => {
    return `${JIRA_URL}/rest/api/3/${entity}/${key ? key : ''}`;
  }

  try {
    console.log(generateEndpoint('issue', 'GMERGE-1'));

    console.log('jira', JIRA_URL, API_TOKEN, EMAIL, PROJECT_KEY, auth);

    // get some issues from JIRA
    const response = await fetch(generateEndpoint('issue', 'GMERGE-1'), {
      method: 'GET',
      headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Accept-Language': 'en-US',
      }
  });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (error: any) {
    return new Response(`jira error: ${error.message}`, {
      status: 500,
    })
  }

}
