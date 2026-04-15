'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui';
import { GradientButton } from '@/components/ui';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { useVendorSearch } from '@/hooks/useVendorSearch';

interface VendorSearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'default' | 'large';
  /** Initial query value (used by search results page) */
  initialQuery?: string;
}

export default function VendorSearchBar({
  placeholder = 'Search for restaurants…',
  className = '',
  size = 'default',
  initialQuery = '',
}: VendorSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, hasSearched } = useVendorSearch(query);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open dropdown when results arrive — but only if user is actively typing
  const [userHasTyped, setUserHasTyped] = useState(false);
  useEffect(() => {
    if (hasSearched && userHasTyped) setIsOpen(true);
  }, [results, hasSearched, userHasTyped]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      setIsOpen(false);
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push('/search');
      }
    },
    [query, router],
  );

  const handleResultClick = useCallback(
    (slug: string) => {
      setIsOpen(false);
      router.push(`/${slug}`);
    },
    [router],
  );

  const isLarge = size === 'large';
  const showDropdown = isOpen && hasSearched;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="search-glow relative flex items-center"
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setQuery(e.target.value);
              setUserHasTyped(true);
            }}
            placeholder={placeholder}
            autoComplete="off"
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
            Let's Eat
          </GradientButton>
        </div>
      </form>

      {/* ── Dropdown ─────────────────────────────────────── */}
      {showDropdown && (
        <div
          className="
            absolute z-50 w-full mt-2
            bg-[#161b22]/95 backdrop-blur-xl
            border border-white/10 rounded-xl
            shadow-2xl shadow-black/40
            overflow-hidden
            animate-slide-up
          "
          style={{ animationDuration: '0.2s' }}
        >
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
              <Loader2 size={14} className="animate-spin text-amber-400" />
              Searching…
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="px-4 py-4 text-sm text-slate-500 italic text-center">
              No restaurants found
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((result) => (
                <li key={result.slug}>
                  <button
                    type="button"
                    onClick={() => handleResultClick(result.slug)}
                    className="
                      w-full text-left px-4 py-3
                      hover:bg-amber-400/10
                      cursor-pointer transition-colors duration-150
                      flex items-center justify-between group
                    "
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {result.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        /{result.slug}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-amber-400/0 group-hover:text-amber-400 transition-all duration-200 group-hover:translate-x-0.5"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
