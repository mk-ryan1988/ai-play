import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSlug } from '@/utils/slugify';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const data = await request.json();
    const slug = generateSlug(data.project_name, data.name);

    // Get the first status of the org ordered by order_index
    const { data: status, error: statusError } = await supabase
      .from('org_statuses')
      .select('name')
      .eq('org_id', data.org_id)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    if (statusError || !status) throw statusError;

    const { error } = await supabase
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

    if (error) throw error;

    return NextResponse.json({ message: 'Release created successfully' });
  } catch (error) {
    console.error('Error creating release:', error);
    return NextResponse.json(
      { error: 'Failed to create release' },
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
