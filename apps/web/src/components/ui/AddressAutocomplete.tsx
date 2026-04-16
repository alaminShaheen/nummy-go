'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';
import { useDebounceCallback } from 'usehooks-ts';
import { clsx } from 'clsx';
import { BrandInput } from './BrandInput';
import { useTheme } from '@/lib/themes';

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
	const { theme } = useTheme();
	const isLight = theme.name === 'light';

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
				`/api/geocode?q=${encodeURIComponent(query)}`
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

		// Synchronize the raw text with the parent form instantly
		onChange(newVal, undefined, undefined);

		// If they clear the text, clear results immediately
		if (!newVal.trim()) {
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
				<div 
					className="absolute right-3 top-1/2 -translate-y-1/2"
					style={{ color: theme.text.muted }}
				>
					{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
				</div>
			</div>

			{isOpen && (searchText.trim().length >= 3) && (
				<div
					className="absolute z-50 w-full mt-2 rounded-xl backdrop-blur-xl shadow-2xl overflow-hidden"
					style={{ 
						background: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(19,25,31,0.95)',
						border: `1px solid ${theme.card.border}`
					}}
				>
					{loading && results.length === 0 ? (
						<div className="p-4 text-center text-sm" style={{ color: theme.text.muted }}>Searching global maps...</div>
					) : results.length > 0 ? (
						<ul className="max-h-64 overflow-y-auto w-full flex flex-col py-2 custom-scrollbar">
							{results.map((r) => (
								<li key={r.place_id}>
									<button
										type="button"
										className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-500/10 hover:text-[#ea580c] transition-colors flex items-start gap-3"
										style={{ color: theme.text.primary }}
										onClick={() => handleSelect(r)}
									>
										<MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
										<span className="line-clamp-2 leading-relaxed">{r.display_name}</span>
									</button>
								</li>
							))}
						</ul>
					) : (
						<div className="p-4 text-center text-sm" style={{ color: theme.text.muted }}>No matching address found...</div>
					)}
				</div>
			)}
		</div>
	);
}
