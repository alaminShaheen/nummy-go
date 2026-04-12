import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
      {
        headers: {
          'User-Agent': 'nummyGo-App/1.0',
        },
        // Don't cache geocoding in Next.js aggressive cache to prevent stale bounds
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Geocoding upstream error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocoding Proxy Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
