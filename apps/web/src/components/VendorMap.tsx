'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not loading correctly in Webpack/Next.js
const customIcon = L.icon({
	iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
	iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

function MapOffset() {
	const map = useMap();
	useEffect(() => {
		// Shift the center dynamically so the pin lands perfectly into the right viewport half
		const offset = window.innerWidth > 768 ? -window.innerWidth / 5 : 0;
		if (offset !== 0) {
			map.panBy([offset, 0], { animate: false });
		}
	}, [map]);
	return null;
}

interface VendorMapProps {
	latitude: number;
	longitude: number;
	name: string;
	address: string | null;
	mapUrl: string;
}

export default function VendorMap({ latitude, longitude, name, address }: VendorMapProps) {
	// Simple fix to align the Amber color filter directly over the default blue marker
	useEffect(() => {
		const applyFilters = () => {
			const markers = document.querySelectorAll('.leaflet-marker-icon');
			markers.forEach((m) => {
				// Hue-rotate to shift pure blue (210deg) into Amber (45deg), ~ -165deg
				(m as HTMLElement).style.filter = 'hue-rotate(-165deg) saturate(2) brightness(1.1)';
			});
		};
		// Minor delay ensures tiles load first
		const t = setTimeout(applyFilters, 100);
		return () => clearTimeout(t);
	}, [latitude, longitude]);

	return (
		<div className="w-full h-full" style={{ isolation: 'isolate', zIndex: 0 }}>
			<MapContainer 
				center={[latitude, longitude]} 
				zoom={18} 
				style={{ height: '100%', width: '100%', background: '#0D1117' }}
				attributionControl={false}
				zoomControl={false}
			>
				<MapOffset />
				{/* Dark Matter CartoDB Free Tile layer */}
				<TileLayer
					url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
				/>
				<Marker position={[latitude, longitude]} icon={customIcon}>
					<Popup>
						<div className="font-semibold text-slate-900">{name}</div>
						{address && <div className="text-xs text-slate-600 mt-1">{address}</div>}
					</Popup>
				</Marker>
			</MapContainer>
		</div>
	);
}
