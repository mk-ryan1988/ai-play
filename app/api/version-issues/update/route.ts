import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const { versionIssueId, versionId, issueKey, buildStatus } = await request.json();

    if (!versionId || !issueKey || !versionIssueId) {
      return NextResponse.json({
        error: 'Version ID, issue key, and version issue ID are required'
      }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Update or create the version issue
    const { data: updatedIssue, error } = await supabase
      .from('version_issues')
      .upsert({
        id: versionIssueId,
        version_id: versionId,
        issue_key: issueKey,
        build_status: buildStatus,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ issue: updatedIssue });
  } catch (error) {
    console.error('Error updating version issue:', error);
    return NextResponse.json(
      { error: 'Failed to update version issue' },
      { status: 500 }
    );
  }
}
