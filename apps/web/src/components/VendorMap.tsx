'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MousePointerClick, Lock } from 'lucide-react';

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
		// We use a small delay to ensure the DOM map container has finished its layout sizing
		const offset = window.innerWidth > 768 ? -window.innerWidth / 4 : 0;
		if (offset !== 0) {
			const t = setTimeout(() => {
				map.panBy([offset, 0], { animate: false });
			}, 300);
			return () => clearTimeout(t);
		}
	}, [map]);
	return null;
}

/**
 * Once the map is activated, enable scroll-zoom and dragging.
 */
function MapInteractionController({ active }: { active: boolean }) {
	const map = useMap();

	useEffect(() => {
		if (active) {
			map.scrollWheelZoom.enable();
			map.dragging.enable();
			map.doubleClickZoom.enable();
		} else {
			map.scrollWheelZoom.disable();
			map.dragging.disable();
			map.doubleClickZoom.disable();
		}
	}, [active, map]);

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
	const [isActive, setIsActive] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);

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

	// Deactivate map interaction when clicking outside the map section
	const handleClickOutside = useCallback((e: MouseEvent) => {
		if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
			setIsActive(false);
		}
	}, []);

	useEffect(() => {
		if (isActive) {
			document.addEventListener('click', handleClickOutside, true);
			return () => document.removeEventListener('click', handleClickOutside, true);
		}
	}, [isActive, handleClickOutside]);

	return (
		<div ref={wrapperRef} className="w-full h-full relative" style={{ isolation: 'isolate', zIndex: 0 }}>
			{/* The exact fix: disable pointer events on the map entirely until active */}
			<div className="w-full h-full" style={{ pointerEvents: isActive ? 'auto' : 'none' }}>
				<MapContainer
					center={[latitude, longitude]}
					zoom={18}
					style={{ height: '100%', width: '100%', background: '#0D1117' }}
					attributionControl={false}
					zoomControl={false}
					scrollWheelZoom={false}
					dragging={false}
					doubleClickZoom={false}
				>
					<MapOffset />
					<MapInteractionController active={isActive} />
					{/* Dark Matter CartoDB Free Tile layer */}
					<TileLayer
						url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
					/>
					<Marker position={[latitude, longitude]} icon={customIcon}>
						{/* Use Tooltip with permanent=true instead of Popup so it stays visible */}
						<Tooltip
							permanent
							direction="top"
							offset={[0, -30]}
							className="custom-leaflet-tooltip"
						>
							<div className="bg-[#1a2130]/95 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] -ml-4">
								<div className="font-bold text-white text-sm mb-0.5">{name}</div>
								{address && <div className="text-xs text-slate-400 max-w-[200px] whitespace-normal leading-relaxed">{address}</div>}
							</div>
						</Tooltip>
					</Marker>
				</MapContainer>
			</div>

			<style>{`
				.custom-leaflet-tooltip {
					background: transparent !important;
					border: none !important;
					box-shadow: none !important;
				}
				.custom-leaflet-tooltip::before, 
				.custom-leaflet-tooltip::after {
					display: none !important;
				}
			`}</style>

			{/* Active mode overlay — allows user to quickly lock the map again so they don't get stuck scrolling */}
			{isActive && (
				<div className="absolute bottom-6 right-6 z-[9999] pointer-events-auto">
					<button
						onClick={(e) => { e.stopPropagation(); setIsActive(false); }}
						className="flex items-center gap-2 px-4 py-2 bg-rose-500/90 hover:bg-rose-500 hover:scale-105 active:scale-95 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.4)] backdrop-blur-md transition-all duration-200"
					>
						<Lock className="w-4 h-4" />
						Lock Map
					</button>
				</div>
			)}

			{/* Click-to-interact overlay — shown only when the map is inactive */}
			{!isActive && (
				<div
					className="absolute inset-0 z-[5] cursor-pointer flex items-end md:items-center justify-center md:justify-end md:pr-[15%] pb-4 md:pb-0"
					onClick={() => setIsActive(true)}
					aria-label="Click to interact with the map"
				>
					{/* Instruction badge — only visible on desktop where map is interactable */}
					<div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 text-xs font-medium shadow-lg select-none pointer-events-none transition-opacity duration-300 animate-pulse-glow">
						<MousePointerClick className="w-4 h-4 text-amber-400 shrink-0" />
						<span>Click to interact with the map</span>
					</div>
				</div>
			)}
		</div>
	);
}
