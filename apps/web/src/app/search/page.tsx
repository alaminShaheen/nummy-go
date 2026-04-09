'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import VendorSearchBar from '@/components/VendorSearchBar';
import { VendorCard } from '@/components/ui';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 12;

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';
  const [page, setPage] = useState(1);

  const { data: results, isLoading } = trpc.tenant.searchTenants.useQuery(
    { query },
    { enabled: query.length >= 1 },
  );

  const totalResults = results?.length ?? 0;
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    if (!results) return [];
    const start = (page - 1) * ITEMS_PER_PAGE;
    return results.slice(start, start + ITEMS_PER_PAGE);
  }, [results, page]);

  // Reset page when query changes
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setPage(1);
  }

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Ambient glow */}
        <div
          className="glow-amber"
          style={{ top: '5%', left: '-10%', opacity: 0.5 }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Heading */}
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight text-text-primary">
              Restaurants matching{' '}
              <span className="gradient-text">&lsquo;{query}&rsquo;</span>
            </h1>
            {!isLoading && (
              <p className="text-text-secondary text-sm mt-3">
                {totalResults} {totalResults === 1 ? 'place' : 'places'} found
              </p>
            )}
          </div>

          {/* Search bar for refining */}
          <div className="w-full max-w-2xl mb-12">
            <VendorSearchBar initialQuery={query} placeholder="Refine your search…" />
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="vendor-card animate-pulse flex flex-col items-center gap-3 px-5 pt-8 pb-5"
                  style={{ minHeight: '180px' }}
                >
                  <div className="w-12 h-12 rounded-full bg-brand-border/40" />
                  <div className="h-4 w-24 rounded bg-brand-border/40" />
                  <div className="h-3 w-32 rounded bg-brand-border/20" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && totalResults === 0 && query && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-brand-card flex items-center justify-center mb-6 border border-white/5">
                <SearchX size={32} className="text-slate-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-200 mb-2">
                No restaurants found
              </h2>
              <p className="text-slate-500 max-w-sm">
                We couldn&apos;t find any restaurants matching &ldquo;{query}&rdquo;.
                Try a different search term.
              </p>
            </div>
          )}

          {/* Results grid — using the shared VendorCard component */}
          {!isLoading && paginatedResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {paginatedResults.map((vendor, index) => (
                <VendorCard
                  key={vendor.slug}
                  name={vendor.name}
                  slug={vendor.slug}
                  address={vendor.address}
                  logoUrl={vendor.logoUrl}
                  className="animate-stagger-fade"
                  style={{ animationDelay: `${index * 80}ms` }}
                  onClick={() => router.push(`/${vendor.slug}`)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-14">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${p === page
                      ? 'bg-amber-400 text-brand-bg'
                      : 'text-slate-400 hover:text-amber-400 hover:bg-amber-400/10'
                    }
                  `}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

/** Wrap in Suspense boundary for useSearchParams */
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
