import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const versionId = searchParams.get('versionId');

  if (!versionId) {
    return NextResponse.json({ error: 'Version ID is required' }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: versionIssues, error } = await supabase
      .from('version_issues')
      .select('*')
      .eq('version_id', versionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ issues: versionIssues });
  } catch (error) {
    console.error('Error fetching version issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch version issues' },
      { status: 500 }
    );
  }
}
