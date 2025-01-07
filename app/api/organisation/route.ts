import { NextResponse } from 'next/server'
import { createClient, getAuthUser } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const {
      data: org_member,
      error: org_error
    } = await supabase.from('org_members').select('*').eq('user_id', user.id).single();

    if (!org_member?.org_id || org_error) {
      return NextResponse.json({ error: org_error?.message || 'Organization ID not found' }, { status: 400 });
    }

    const {
      data: organisation,
      error: org_id_error
    } = await supabase.from('organisations').select('*').eq('id', org_member.org_id).single();

    if (!organisation) {
      return NextResponse.json({ error: org_id_error?.message || 'Organization not found' }, { status: 400 })
    }

    return NextResponse.json({ organisation })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
