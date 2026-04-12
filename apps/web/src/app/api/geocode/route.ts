import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Geocoding upstream error' }, { status: response.status });
    }

    const data = await response.json();
    
    // Map Photon GeoJSON features to Nominatim format to keep frontend unchanged
    const transformed = (data.features || []).map((f: any, i: number) => {
      const p = f.properties;
      const parts = [
        p.housenumber && (p.street || p.name) ? `${p.housenumber} ${p.street || p.name}` : (p.name || p.street),
        p.district,
        p.city || p.locality,
        p.state,
        p.country
      ];
      const displayName = Array.from(new Set(parts.filter(Boolean))).join(', ');
      
      return {
        place_id: p.osm_id || i,
        lat: f.geometry.coordinates[1].toString(),
        lon: f.geometry.coordinates[0].toString(),
        display_name: displayName || 'Unknown Location'
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Geocoding Proxy Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
