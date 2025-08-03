import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSlug } from '@/utils/slugify';

export async function POST(request: Request) {
  const supabase = createClient();
  let versionId: string | null = null;

  try {
    const {project_name, ...data} = await request.json();
    const slug = generateSlug(project_name, data.name);

    // Get the first status of the org ordered by order_index
    const { data: status, error: statusError } = await supabase
      .from('org_statuses')
      .select('name')
      .eq('org_id', data.org_id)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    if (statusError || !status) throw statusError;

    // Create version in Supabase
    const { data: versionData, error: versionError } = await supabase
      .from('versions')
      .insert({
        ...data,
        slug,
        status: status.name,
        version_number: data.version ?? null,
        description: data.description ?? null,
        prepared_at: data.release_date ?? null,
        released_at: data.release_date ?? null,
      })
      .select()
      .single();

    if (versionError) throw versionError;
    if (!versionData) throw new Error('No version data returned');

    versionId = versionData.id;

    // Create version in Jira
    const JIRA_URL = process.env.NEXT_PUBLIC_JIRA_URL;
    const API_TOKEN = process.env.NEXT_PUBLIC_JIRA_API_KEY;
    const EMAIL = process.env.NEXT_PUBLIC_JIRA_EMAIL;
    const PROJECT_KEY = process.env.NEXT_PUBLIC_JIRA_PROJECT_KEY;
    const auth = Buffer.from(`${EMAIL}:${API_TOKEN}`).toString('base64');

    // First, get the project ID using the project key
    const projectResponse = await fetch(`${JIRA_URL}/rest/api/3/project/${PROJECT_KEY}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!projectResponse.ok) {
      console.log(`Jira project error: ${JSON.stringify(await projectResponse.json())}`);
      throw new Error('Failed to get Jira project');
    }

    const project = await projectResponse.json();

    // Create the version using the project ID
    const response = await fetch(`${JIRA_URL}/rest/api/3/version`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description || '',
        projectId: project.id,
        released: false,
        archived: false,
        releaseDate: data.release_at ? new Date(data.release_at).toISOString().split('T')[0] : null,
      })
    });

    if (!response.ok) {
      console.log(`Jira error: ${JSON.stringify(await response.json())}`);

      // If Jira creation fails, roll back Supabase changes
      if (versionId) {
        await supabase
          .from('versions')
          .delete()
          .eq('id', versionId);
      }
      throw new Error('Failed to create Jira version');
    }

    return NextResponse.json({ message: 'Release created successfully' });
  } catch (error) {
    // If we have a version ID and something failed after Supabase insert, clean up
    if (versionId) {
      await supabase
        .from('versions')
        .delete()
        .eq('id', versionId);
    }

    console.error('Error creating release:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create release' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('org_id');

  if (!orgId) return NextResponse.json({ error: 'Org ID is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('versions')
    .select(`
      *,
      projects (
        name
      )
    `)
    .eq('projects.org_id', orgId)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return NextResponse.json(data);
}
