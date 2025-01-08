import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { name, description, repository_url } = json

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get user's organization
    const { data: orgData, error: orgError } = await supabase
      .from('org_members')
      .select('org_id')
      .single()

    if (orgError) {
      return NextResponse.json(
        { error: 'Failed to get organization' },
        { status: 400 }
      )
    }

    // Create the project
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        description: description || null,
        repository_url: repository_url || null,
        org_id: orgData.org_id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase.from('projects').select('*')
  return NextResponse.json(data)
}
