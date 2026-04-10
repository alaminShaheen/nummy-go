'use client';

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/trpc/client';

/**
 * Custom hook for vendor search with debounce.
 * - Auto-searches after 300ms when query >= minChars characters.
 * - Clears results when query drops below minChars.
 * - `triggerSearch()` can bypass the minChars limit (e.g. empty string = show all).
 */
export function useVendorSearch(query: string, minChars = 3, limit = 20) {
  // null = query not yet triggered; '' or a string = actively searching
  const [activeQuery, setActiveQuery] = useState<string | null>(() => {
    const trimmed = query.trim();
    return trimmed.length >= minChars ? trimmed : null;
  });

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < minChars) {
      // Clear results immediately when below threshold
      setActiveQuery(null);
      return;
    }

    // Debounce the query when long enough
    const timer = setTimeout(() => {
      setActiveQuery(trimmed);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, minChars]);

  // Manually force a search — bypasses minChars (e.g. clicking Search with empty input shows all)
  const triggerSearch = useCallback(() => {
    setActiveQuery(query.trim());
  }, [query]);

  const { data, isLoading, isFetching } = trpc.tenant.searchTenants.useQuery(
    { query: activeQuery ?? '', limit },
    { enabled: activeQuery !== null },
  );

  return {
    results: data ?? [],
    isLoading: isFetching,
    debouncedQuery: activeQuery,
    hasSearched: activeQuery !== null,
    triggerSearch,
  };
}
