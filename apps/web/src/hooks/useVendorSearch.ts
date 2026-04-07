'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/trpc/client';

/**
 * Custom hook for vendor search with debounce.
 * Fires a tRPC query only after the user stops typing for 300ms,
 * and only when the query is at least `minChars` characters long.
 */
export function useVendorSearch(query: string, minChars = 3) {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the raw query with a 300ms delay
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < minChars) {
      setDebouncedQuery('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, minChars]);

  const { data, isLoading, isFetching } = trpc.tenant.searchTenants.useQuery(
    { query: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length >= minChars },
  );

  return {
    results: data ?? [],
    isLoading: isFetching,
    debouncedQuery,
    hasSearched: debouncedQuery.length >= minChars,
  };
}
