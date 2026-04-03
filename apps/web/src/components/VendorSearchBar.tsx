'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface VendorSearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'default' | 'large';
}

export default function VendorSearchBar({
  placeholder = 'Search for restaurants…',
  className = '',
  size = 'default',
}: VendorSearchBarProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const slug = query.trim().toLowerCase().replace(/\s+/g, '-');
      if (slug) {
        router.push(`/${slug}`);
      }
    },
    [query, router],
  );

  const isLarge = size === 'large';

  return (
    <form
      onSubmit={handleSubmit}
      className={`search-glow relative flex items-center ${className}`}
    >
      <div
        className={`
          relative flex items-center w-full
          bg-brand-surface/80 border border-white/10
          rounded-full overflow-hidden
          transition-all duration-300
          focus-within:border-amber-400/40
          ${isLarge ? 'h-14 sm:h-16' : 'h-11 sm:h-12'}
        `}
      >
        {/* Search icon */}
        <div className={`flex items-center justify-center text-slate-500 ${isLarge ? 'pl-5' : 'pl-4'}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={isLarge ? 22 : 18}
            height={isLarge ? 22 : 18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          id="vendor-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full bg-transparent border-none outline-none
            text-slate-100 placeholder:text-slate-600
            ${isLarge ? 'px-4 text-base sm:text-lg' : 'px-3 text-sm'}
          `}
        />

        {/* Submit button */}
        <button
          type="submit"
          id="vendor-search-submit"
          className={`
            flex items-center justify-center
            bg-gradient-to-r from-amber-500 to-orange-600
            text-white font-semibold
            rounded-full
            hover:shadow-lg hover:shadow-orange-900/40
            hover:scale-105
            transition-all duration-200
            ${isLarge
              ? 'h-10 sm:h-12 px-5 sm:px-7 mr-2 text-sm'
              : 'h-8 sm:h-9 px-4 sm:px-5 mr-1.5 text-xs'
            }
          `}
        >
          Search
        </button>
      </div>
    </form>
  );
}
