import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const json = await request.json();
    const { version_id, repository, commit_sha, note } = json;

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('unlinked_commits')
      .upsert({
        version_id,
        repository,
        commit_sha,
        note,
        reviewed_by: session.session.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const version_id = searchParams.get('version_id');

    if (!version_id) {
      return NextResponse.json({ error: 'Version ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('unlinked_commits')
      .select('*')
      .eq('version_id', version_id);

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
