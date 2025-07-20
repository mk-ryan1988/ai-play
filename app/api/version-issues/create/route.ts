import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { version_id, issue_key } = await request.json();

    if (!version_id) {
      return NextResponse.json({ error: 'Version ID is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Check if version issue already exists
    const { data: existingIssue } = await supabase
      .from('version_issues')
      .select('*')
      .eq('version_id', version_id)
      .eq('issue_key', issue_key)
      .single();

    if (existingIssue) {
      return NextResponse.json({ issue: existingIssue });
    }

    // Create new version issue
    const { data: newIssue, error } = await supabase
      .from('version_issues')
      .insert([
        {
          version_id: version_id,
          issue_key
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ issue: newIssue });
  } catch (error) {
    console.error('Error creating version issue:', error);
    return NextResponse.json(
      { error: 'Failed to create version issue' },
      { status: 500 }
    );
  }
}
