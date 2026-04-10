'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';

interface SearchResult {
  slug: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  acceptsOrders?: boolean | null;
  closedUntil?: Date | string | number | null;
  logoUrl?: string | null;
}

/** Auto-fits the map viewport to show all markers */
function MapBounds({ markers }: { markers: SearchResult[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = markers.filter((m) => m.latitude && m.longitude);
    if (valid.length === 0) return;
    const bounds = L.latLngBounds(valid.map((m) => [m.latitude!, m.longitude!]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
  }, [map, markers]);
  return null;
}

interface GlobalSearchMapProps {
  results: SearchResult[];
}

export default function GlobalSearchMap({ results }: GlobalSearchMapProps) {
  const router = useRouter();

  // Default centre — Toronto; will be overridden by MapBounds if results have coordinates
  const defaultCenter: [number, number] = [43.6532, -79.3832];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Leaflet needs an explicit height on its mount element */}
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%', background: '#0D1117' }}
        attributionControl={false}
        zoomControl={true}
      >
        <MapBounds markers={results} />

        {/* CartoDB Dark Matter — free, no API key */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {results.map((r) => {
          if (!r.latitude || !r.longitude) return null;
          const isClosed = !r.acceptsOrders;

          const icon = L.divIcon({
            className: '',
            html: `
              <div style="
                width: ${isClosed ? '28px' : '44px'};
                height: ${isClosed ? '28px' : '44px'};
                border-radius: 50%;
                background: ${isClosed ? 'rgba(100,116,139,0.15)' : 'rgba(245,158,11,0.2)'};
                border: ${isClosed ? '1.5px solid #64748b' : '2.5px solid #f59e0b'};
                box-shadow: ${isClosed ? 'none' : '0 0 16px rgba(245,158,11,0.55)'};
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 900;
                font-size: ${isClosed ? '11px' : '17px'};
                color: ${isClosed ? '#94a3b8' : '#f59e0b'};
                font-family: system-ui, sans-serif;
                cursor: pointer;
                position: relative;
              ">
                ${r.name.charAt(0).toUpperCase()}
                ${!isClosed ? `<div style="
                  position: absolute;
                  inset: -6px;
                  border-radius: 50%;
                  border: 1.5px solid rgba(245,158,11,0.4);
                  animation: mapPing 2s ease-in-out infinite;
                "></div>` : ''}
              </div>
            `,
            iconSize: isClosed ? [28, 28] : [44, 44],
            iconAnchor: isClosed ? [14, 14] : [22, 22],
            popupAnchor: [0, isClosed ? -16 : -24],
          });

          return (
            <Marker key={r.slug} position={[r.latitude, r.longitude]} icon={icon}>
              <Popup
                closeButton={false}
                className="nummygo-popup"
              >
                <div style={{
                  background: '#13191f',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '12px',
                  padding: '14px',
                  minWidth: '180px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.7), 0 0 20px rgba(245,158,11,0.1)',
                }}>
                  <p style={{ fontWeight: 900, fontSize: '15px', color: '#f1f5f9', marginBottom: '6px', margin: '0 0 6px 0' }}>{r.name}</p>
                  <p style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isClosed ? '#94a3b8' : '#4ade80',
                    marginBottom: '10px',
                    margin: '0 0 10px 0',
                  }}>
                    {isClosed ? 'Closed' : 'Accepting Orders'}
                  </p>
                  <button
                    onClick={() => router.push(`/${r.slug}`)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                      color: '#000',
                      fontWeight: 700,
                      fontSize: '13px',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 0',
                      cursor: 'pointer',
                    }}
                  >
                    Explore Store
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style>{`
        /* Prevent leaflet's default white popup chrome */
        .nummygo-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .nummygo-popup .leaflet-popup-tip-container { display: none !important; }
        .nummygo-popup .leaflet-popup-content { margin: 0 !important; }

        /* Map pin pulse animation */
        @keyframes mapPing {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.4); }
        }

        /* Leaflet zoom controls — dark theme */
        .leaflet-control-zoom a {
          background: #13191f !important;
          border-color: rgba(255,255,255,0.08) !important;
          color: #94a3b8 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1a2130 !important;
          color: #fbbf24 !important;
        }
      `}</style>
    </div>
  );
}
