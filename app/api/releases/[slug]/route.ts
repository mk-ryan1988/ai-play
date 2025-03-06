import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient();
  const slug = params.slug;

  const { data, error } = await supabase
    .from('versions')
    .select(`
      *,
      projects (
        name,
        repositories
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Release not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
