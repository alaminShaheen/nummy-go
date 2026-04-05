'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui';
import { GradientButton } from '@/components/ui';
import { Search } from 'lucide-react';

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
          <Search size={isLarge ? 22 : 18} aria-hidden="true" />
        </div>

        {/* Input */}
        <Input
          type="text"
          id="vendor-search-input"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`
            flex-1 h-full bg-transparent border-none shadow-none outline-none ring-0
            focus-visible:ring-0 focus-visible:border-none
            text-slate-100 placeholder:text-slate-600
            rounded-none
            ${isLarge ? 'px-4 text-base sm:text-lg' : 'px-3 text-sm'}
          `}
        />

        {/* Submit button */}
        <GradientButton
          type="submit"
          id="vendor-search-submit"
          className={`
            rounded-full
            ${isLarge
              ? 'h-10 sm:h-12 px-5 sm:px-7 mr-2 text-sm py-0'
              : 'h-8 sm:h-9 px-4 sm:px-5 mr-1.5 text-xs py-0'
            }
          `}
        >
          Search
        </GradientButton>
      </div>
    </form>
  );
}
