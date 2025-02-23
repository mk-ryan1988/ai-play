import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nameOrId = searchParams.get('name') || searchParams.get('id');

  if (!nameOrId) {
    return NextResponse.json({ error: 'name or id query parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`);
    if (!response.ok) {
      return NextResponse.json({ error: 'Pokémon not found' }, { status: 404 });
    }
    const data = await response.json();
    const pokemon = {
      name: data.name,
      id: data.id,
      height: data.height,
      image: data.sprites.front_default,
    };
    return NextResponse.json(pokemon);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
