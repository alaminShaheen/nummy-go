'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';
import { useDebounceCallback } from 'usehooks-ts';
import { clsx } from 'clsx';
import { BrandInput } from './BrandInput';

interface NominatimResult {
	place_id: number;
	lat: string;
	lon: string;
	display_name: string;
}

interface AddressAutocompleteProps {
	id?: string;
	value: string;
	onChange: (address: string, lat?: number, lng?: number) => void;
	placeholder?: string;
	error?: boolean;
}

export function AddressAutocomplete({ id, value, onChange, placeholder, error }: AddressAutocompleteProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [results, setResults] = useState<NominatimResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState(value || '');
	const wrapperRef = useRef<HTMLDivElement>(null);

	// Sync external value changes into local state if needed
	useEffect(() => {
		if (value && value !== searchText) {
			setSearchText(value);
		}
	}, [value]);

	// Close dropdown when interacting outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const searchLocation = async (query: string) => {
		if (query.trim().length < 3) {
			setResults([]);
			setIsOpen(false);
			return;
		}

		setLoading(true);
		setIsOpen(true);

		try {
			// Free Nominatim API adhering to Rate-Limit usage (approx ~1 per second enforced by debounce).
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
			);

			if (response.ok) {
				const data = await response.json() as NominatimResult[];
				setResults(data);
			}
		} catch (e) {
			console.error("Geocoding failed", e);
		} finally {
			setLoading(false);
		}
	};

	const debouncedSearch = useDebounceCallback(searchLocation, 600);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = e.target.value;
		setSearchText(newVal);

		// If they clear the text, clear parents immediately
		if (!newVal.trim()) {
			onChange('', undefined, undefined);
			setResults([]);
			setIsOpen(false);
			return;
		}

		debouncedSearch(newVal);
	};

	const handleSelect = (r: NominatimResult) => {
		setSearchText(r.display_name);
		setIsOpen(false);

		// Map back to parent precisely
		onChange(r.display_name, parseFloat(r.lat), parseFloat(r.lon));
	};

	return (
		<div className="relative w-full" ref={wrapperRef}>
			<div className="relative">
				<BrandInput
					id={id}
					value={searchText}
					onChange={handleInputChange}
					onFocus={() => { if (results.length > 0) setIsOpen(true); }}
					placeholder={placeholder}
					className={error ? 'border-rose-500' : ''}
				/>
				<div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
					{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
				</div>
			</div>

			{isOpen && (searchText.trim().length >= 3) && (
				<div
					className="absolute z-50 w-full mt-2 rounded-xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl"
					style={{ background: 'rgba(19,25,31,0.95)' }}
				>
					{loading && results.length === 0 ? (
						<div className="p-4 text-center text-sm text-slate-400">Searching global maps...</div>
					) : results.length > 0 ? (
						<ul className="max-h-64 overflow-y-auto w-full flex flex-col py-2 custom-scrollbar">
							{results.map((r) => (
								<li key={r.place_id}>
									<button
										type="button"
										className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 transition-colors flex items-start gap-3"
										onClick={() => handleSelect(r)}
									>
										<MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
										<span className="line-clamp-2 leading-relaxed">{r.display_name}</span>
									</button>
								</li>
							))}
						</ul>
					) : (
						<div className="p-4 text-center text-sm text-slate-400">No matching address found...</div>
					)}
				</div>
			)}
		</div>
	);
}
