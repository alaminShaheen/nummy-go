'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { SearchX, ChevronLeft, LayoutGrid, Map as MapIcon, Search, Loader2 } from 'lucide-react';
import { useVendorSearch } from '@/hooks/useVendorSearch';
import { GradientButton } from '@/components/ui';
import dynamic from 'next/dynamic';

const DynamicGlobalSearchMap = dynamic(() => import('@/components/GlobalSearchMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-brand-bg flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-amber-400" />
    </div>
  ),
});

/* ─── SearchNodeCard ─────────────────────────────────────────────────────── */

interface SearchResult {
  slug: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  tags?: string[] | null;
  acceptsOrders?: boolean | null;
  closedUntil?: Date | string | number | null;
  logoUrl?: string | null;
}

function SearchNodeCard({ result, index }: { result: SearchResult; index: number }) {
  const router = useRouter();
  const delay = Math.min(index * 0.07, 0.6);
  const isClosed = !result.acceptsOrders;

  return (
    <div
      className="vendor-card flex flex-col cursor-pointer animate-stagger-fade"
      style={{ animationDelay: `${delay}s`, opacity: 0 }}
      onClick={() => router.push(`/${result.slug}`)}
    >
      {/* Header row */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-brand-surface flex items-center justify-center overflow-hidden border border-white/5 flex-shrink-0 shadow-inner">
          {result.logoUrl ? (
            <img src={result.logoUrl} alt={result.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-amber-400 font-black text-xl">{result.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-text-primary leading-tight truncate">
          {result.name}
        </h3>

        {/* Description */}
        {result.description ? (
          <p className="text-text-secondary text-xs mt-1 line-clamp-2 leading-relaxed">
            {result.description}
          </p>
        ) : (
          <p className="text-text-muted text-xs mt-1 italic">No description available</p>
        )}

        {/* Tags */}
        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {result.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
            {result.tags.length > 4 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-border/30 text-slate-500 border border-brand-border">
                +{result.tags.length - 4}
              </span>
            )}
          </div>
        )}
        </div>

        {/* Status badge */}
        {isClosed ? (
          <div className="flex items-center gap-1.5 bg-slate-500/10 border border-slate-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Closed</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Open</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <p className="text-xs text-text-muted">
          {isClosed
            ? result.closedUntil
              ? `Opens ${new Date(result.closedUntil as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Currently closed'
            : 'Taking orders now'}
        </p>
        {!isClosed && (
          <GradientButton className="h-7 px-4 text-xs py-0 rounded-full">
            Explore
          </GradientButton>
        )}
      </div>
    </div>
  );
}

/* ─── Skeleton card ──────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="vendor-card flex flex-col animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-brand-border/30 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 bg-brand-border/30 rounded" />
          <div className="h-3 w-1/2 bg-brand-border/20 rounded" />
        </div>
        <div className="h-6 w-14 bg-brand-border/20 rounded-full" />
      </div>
      <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
        <div className="h-3 w-24 bg-brand-border/20 rounded" />
        <div className="h-7 w-16 bg-brand-border/20 rounded-full" />
      </div>
    </div>
  );
}

/* ─── Main SearchResults component ──────────────────────────────────────── */

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const initialQ = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(initialQ);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const { results, isLoading, debouncedQuery, triggerSearch } = useVendorSearch(inputValue, 3, 30);

  // Quick Filter State
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Derived: Extract all unique tags from current search results, sorted by frequency
  const uniqueTags = useMemo(() => {
    if (!results || results.length === 0) return [];
    const tagCounts: Record<string, number> = {};
    results.forEach(r => {
      if (r.tags) {
        r.tags.forEach(t => {
          const lower = t.toLowerCase();
          tagCounts[lower] = (tagCounts[lower] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1]) // highest frequency first
      .map(entry => entry[0])
      .slice(0, 8); // Take top 8 tags only
  }, [results]);

  // Derived: Filter the TRPC results down based on client-side toggles
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      // 1. Open Now check
      if (openNowOnly && !r.acceptsOrders) return false;
      
      // 2. Tag match check (if any tags are selected, the vendor must have AT LEAST ONE of them to show)
      if (selectedTags.length > 0) {
        if (!r.tags || r.tags.length === 0) return false;
        const lowerVendorTags = r.tags.map(t => t.toLowerCase());
        const hasMatchingTag = selectedTags.some(t => lowerVendorTags.includes(t));
        if (!hasMatchingTag) return false;
      }
      return true;
    });
  }, [results, openNowOnly, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Sync URL without hard navigation
  useEffect(() => {
    if (debouncedQuery) {
      window.history.replaceState(null, '', `/search?q=${encodeURIComponent(debouncedQuery)}`);
    } else {
      window.history.replaceState(null, '', `/search`);
    }
  }, [debouncedQuery]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') triggerSearch();
  };

  const hasQuery = inputValue.trim().length > 0;
  const showResults = debouncedQuery !== null;
  const notEnoughChars = hasQuery && inputValue.trim().length < 3;

  return (
    <div className="bg-brand-bg min-h-screen">
      {/* Keyframes */}
      <style>{`
        @keyframes radarSweep {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>

      {/* ── Radar background (grid-only) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[200vw] h-[200vw] rounded-full"
          style={{
            transform: 'translate(-50%, -50%)',
            background: 'conic-gradient(from 0deg, transparent 70%, rgba(245,158,11,0.08) 100%)',
            animation: 'radarSweep 16s linear infinite',
          }}
        />
        {/* Ambient orbs */}
        <div className="glow-amber" style={{ top: '-10%', right: '-5%', opacity: 0.6 }} />
        <div className="glow-indigo" style={{ bottom: '0%', left: '-5%', opacity: 0.5 }} />
      </div>

      {/* ── Main content ── */}
      <main className="relative z-10 min-h-screen flex flex-col px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-grow">

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between mb-10 sm:mb-14 gap-4 flex-wrap">
            <Link
              href="/"
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors group text-sm font-medium"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <div className="flex items-center gap-2 text-amber-400 text-[11px] font-bold tracking-widest uppercase bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
              Live Search
            </div>
          </div>

          {/* ── Cinematic search bar ── */}
          <div className="w-full max-w-3xl mx-auto mb-12 sm:mb-16">
            <div
              className="search-glow relative flex items-center h-14 sm:h-[72px] bg-brand-surface/90 border border-brand-border rounded-full px-5 sm:px-6 backdrop-blur-xl transition-all duration-300 focus-within:border-amber-400/40"
            >
              {/* Icon */}
              <div className="text-slate-500 flex-shrink-0 mr-3 sm:mr-4">
                {isLoading
                  ? <Loader2 size={20} className="animate-spin text-amber-500" />
                  : <Search size={20} />
                }
              </div>

              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What are you craving?"
                className="flex-1 h-full bg-transparent border-none outline-none ring-0 text-lg sm:text-2xl font-bold text-text-primary"
                style={{ color: 'inherit' }}
              />
              <style>{`
                input::placeholder { color: rgba(148,163,184,0.7) !important; }
              `}</style>

              {/* Search button — visible on sm+ */}
              <GradientButton
                type="button"
                onClick={triggerSearch}
                className="hidden sm:flex h-9 sm:h-11 px-5 sm:px-6 rounded-full ml-3 text-sm py-0 flex-shrink-0"
              >
                Search
              </GradientButton>

              {/* Grid/Map toggle */}
              <div className="hidden sm:flex bg-brand-card rounded-full p-1 ml-3 border border-brand-border flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-brand-surface text-amber-400 border border-brand-border shadow'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <LayoutGrid size={13} /> Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    viewMode === 'map'
                      ? 'bg-brand-surface text-amber-400 border border-brand-border shadow'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <MapIcon size={13} /> Map
                </button>
              </div>
            </div>

            {/* Mobile: Search button + view toggle row */}
            <div className="flex sm:hidden items-center justify-between mt-3 gap-3">
              <GradientButton
                type="button"
                onClick={triggerSearch}
                className="flex-1 h-11 rounded-full text-sm py-0"
              >
                Search
              </GradientButton>
              <div className="flex bg-brand-card rounded-full p-1 border border-brand-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-brand-surface text-amber-400 border border-brand-border shadow'
                      : 'text-slate-500'
                  }`}
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    viewMode === 'map'
                      ? 'bg-brand-surface text-amber-400 border border-brand-border shadow'
                      : 'text-slate-500'
                  }`}
                >
                  <MapIcon size={13} />
                </button>
              </div>
            </div>

            {/* Hint: needs 3+ chars */}
            {notEnoughChars && (
              <p className="text-center text-xs text-slate-500 mt-3">
                Keep typing… ({3 - inputValue.trim().length} more character{3 - inputValue.trim().length !== 1 ? 's' : ''} to search)
              </p>
            )}
          </div>

          {/* ── Quick Filter Row (Only show if we have results to filter) ── */}
          {!isLoading && showResults && results.length > 0 && (
            <div className="w-full max-w-3xl mx-auto -mt-6 mb-12 sm:mb-14 px-2">
               <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                 {/* Open Now Toggle */}
                 <button 
                  onClick={() => setOpenNowOnly(!openNowOnly)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold tracking-[0.06em] uppercase transition-all duration-200 border-2 ${
                    openNowOnly
                      ? 'bg-green-500/15 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : 'bg-green-500/5 border-green-500/20 text-green-500/70 hover:border-green-500/50 hover:bg-green-500/10'
                  }`}
                 >
                   <span className={`w-1.5 h-1.5 rounded-full ${openNowOnly ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-green-500/50'}`} />
                   Open Now
                 </button>

                 {/* Dynamic Cuisine/Tag Pills */}
                 {uniqueTags.map(tag => {
                   const isActive = selectedTags.includes(tag);
                   return (
                     <button
                       key={tag}
                       onClick={() => toggleTag(tag)}
                       className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-[11px] font-bold tracking-[0.06em] uppercase transition-all duration-200 border-[1.5px] ${
                         isActive
                           ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                           : 'bg-amber-500/5 border-amber-500/30 text-amber-500 hover:bg-amber-500/15 hover:border-amber-500/60'
                       }`}
                     >
                       {tag}
                     </button>
                   );
                 })}
               </div>
            </div>
          )}

          {/* ── Results header ── */}
          {viewMode === 'grid' && (
            <div className="flex items-end justify-between mb-6 pb-5 border-b border-brand-border gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-text-primary">
                  {!showResults
                    ? 'Discover Local Kitchens'
                    : debouncedQuery
                    ? <>Results for <span className="gradient-text">'{debouncedQuery}'</span></>
                    : 'All Local Kitchens'}
                </h1>
                <p className="text-text-secondary text-sm mt-1">
                  {isLoading
                    ? 'Scanning for kitchens…'
                    : showResults
                    ? (
                      <div className="flex items-center gap-2">
                        <span>{filteredResults.length} {filteredResults.length === 1 ? 'place' : 'places'} found</span>
                        {(openNowOnly || selectedTags.length > 0) && (
                          <span className="text-amber-400">
                             — {openNowOnly ? 1 + selectedTags.length : selectedTags.length} filter{openNowOnly || selectedTags.length > 1 ? 's' : ''} active
                          </span>
                        )}
                      </div>
                    )
                    : 'Start typing or click Search to discover restaurants near you'}
                </p>
              </div>
            </div>
          )}

          {/* ── Grid View ── */}
          {viewMode === 'grid' && (
            <div className="flex-grow">
              {/* Loading skeletons */}
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {/* Empty: no search yet */}
              {!isLoading && !showResults && (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-20 h-20 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-6">
                    <Search size={32} className="text-amber-400/70" />
                  </div>
                  <h2 className="text-xl font-bold text-text-primary mb-2">Find your next meal</h2>
                  <p className="text-text-secondary max-w-sm text-sm">
                    Search by restaurant name, or press Search to browse all available kitchens.
                  </p>
                  <GradientButton onClick={triggerSearch} className="mt-6 px-8 h-11 rounded-full text-sm py-0">
                    Show all kitchens
                  </GradientButton>
                </div>
              )}

              {/* Empty: searched but no results — animated kitchen wok */}
              {!isLoading && showResults && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  {/* Animated Wok SVG */}
                  <div className="relative w-28 h-28 mb-6" aria-hidden="true">
                    <style>{`
                      @keyframes wobble { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
                      @keyframes steam1 { 0%,100%{opacity:0;transform:translateY(0) scaleX(1)} 40%{opacity:0.7} 80%{opacity:0;transform:translateY(-28px) scaleX(1.4)} }
                      @keyframes steam2 { 0%,100%{opacity:0;transform:translateY(0) scaleX(1)} 30%{opacity:0.5} 70%{opacity:0;transform:translateY(-22px) scaleX(1.2)} }
                      @keyframes steam3 { 0%,100%{opacity:0;transform:translateY(0)} 50%{opacity:0.6} 90%{opacity:0;transform:translateY(-32px)} }
                    `}</style>

                    {/* Steam wisps */}
                    <svg className="absolute" style={{top:'-18px',left:'50%',transform:'translateX(-50%)',width:'72px',height:'36px'}} viewBox="0 0 72 36" fill="none">
                      <path d="M18 30 C18 20 10 18 14 8" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" style={{animation:'steam1 2.2s ease-in-out infinite',opacity:0}} />
                      <path d="M36 32 C36 22 28 20 32 10" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" style={{animation:'steam2 2.2s ease-in-out 0.4s infinite',opacity:0}} />
                      <path d="M54 30 C54 20 46 18 50 8" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" style={{animation:'steam3 2.2s ease-in-out 0.8s infinite',opacity:0}} />
                    </svg>

                    {/* Wok SVG */}
                    <svg style={{animation:'wobble 3s ease-in-out infinite',width:'112px',height:'112px'}} viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Wok body */}
                      <ellipse cx="56" cy="68" rx="36" ry="16" fill="#1a2130" stroke="#334155" strokeWidth="2"/>
                      <path d="M20 68 Q20 92 56 92 Q92 92 92 68" fill="#1a2130" stroke="#334155" strokeWidth="2"/>
                      {/* Wok rim highlight */}
                      <ellipse cx="56" cy="68" rx="36" ry="16" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4"/>
                      {/* Handle left */}
                      <rect x="10" y="65" width="14" height="6" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.2"/>
                      {/* Handle right */}
                      <rect x="88" y="65" width="14" height="6" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.2"/>
                      {/* Amber glow dot */}
                      <circle cx="56" cy="80" r="4" fill="#f59e0b" fillOpacity="0.3"/>
                      {/* X mark inside wok */}
                      <line x1="48" y1="74" x2="54" y2="80" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="54" y1="74" x2="48" y2="80" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>

                  <h2 className="text-xl font-bold text-text-primary mb-2">Nothing's cooking</h2>
                  <p className="text-text-secondary max-w-sm text-sm">
                    {debouncedQuery
                      ? `No kitchens found for "${debouncedQuery}". Try a different dish or search term.`
                      : 'No restaurants are currently available. Check back soon!'}
                  </p>
                </div>
              )}

              {/* Results grid */}
              {!isLoading && filteredResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredResults.map((result, i) => (
                    <SearchNodeCard key={result.slug} result={result} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Map View ── */}
          {viewMode === 'map' && (
            <div className="flex-grow min-h-[520px] rounded-2xl border border-brand-border overflow-hidden relative shadow-[0_0_60px_rgba(0,0,0,0.5)]">
              {/* Header overlay */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
                <div className="bg-brand-surface/90 backdrop-blur-md border border-brand-border rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                  {isLoading
                    ? <Loader2 size={14} className="animate-spin text-amber-400" />
                    : <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
                  }
                  <span className="text-xs font-semibold text-text-secondary">
                    {isLoading
                      ? 'Mapping locations…'
                      : showResults
                      ? `${results.length} location${results.length !== 1 ? 's' : ''} on map`
                      : 'Click Search to load locations'}
                  </span>
                </div>
              </div>

              {/* No results overlay (specifically if filtered out all results but base results existed) */}
              {!isLoading && showResults && results.length > 0 && filteredResults.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-bg/95 z-[400]">
                  <SearchX size={40} className="text-amber-400/50 mb-4" />
                  <h4 className="font-bold text-text-primary text-lg">No locations match filters</h4>
                  <p className="text-sm text-text-muted mt-1">Try removing some quick filters.</p>
                </div>
              )}

              {/* No results overlay (if total results was 0) */}
              {!isLoading && showResults && results.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-bg/95 z-[400]">
                  <SearchX size={40} className="text-slate-600 mb-4" />
                  <h4 className="font-bold text-text-primary text-lg">No locations found</h4>
                  <p className="text-sm text-text-muted mt-1">Try a different search term.</p>
                </div>
              )}

              {/* CTA to trigger search if nothing searched yet */}
              {!showResults && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-bg/90 z-[400] gap-4">
                  <MapIcon size={40} className="text-amber-400/50" />
                  <p className="text-text-secondary text-sm font-medium">Search to populate the map</p>
                  <GradientButton onClick={triggerSearch} className="h-10 px-6 rounded-full text-sm py-0">
                    Show all kitchens
                  </GradientButton>
                </div>
              )}

              {/* The Leaflet map */}
              <div style={{ position: 'absolute', inset: 0 }}>
                <DynamicGlobalSearchMap results={filteredResults} />
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
      <SearchResults />
    </Suspense>
  );
}
