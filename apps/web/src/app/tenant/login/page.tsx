'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { GlossButton } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { UserRole } from '@nummygo/shared/models';

function VendorLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(searchParams.get('from') || '/tenant/onboarding');
    }
  }, [session, isPending, router, searchParams]);

  async function handleGoogleLogin() {
    setLoading(true);
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/tenant/onboarding`,
      additionalData: {
        role: 'tenant' as UserRole,
      }
    });
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* ── Background effects ───────────── */}
      <div className="glow-amber animate-pulse-glow" style={{ top: '-15%', left: '-10%' }} aria-hidden="true" />
      <div className="glow-indigo animate-pulse-glow" style={{ bottom: '-10%', right: '-10%', animationDelay: '1.5s' }} aria-hidden="true" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      {/* ── Login card ───────────────────── */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Shimmer border accent */}
        <div className="absolute -inset-[1px] rounded-2xl shimmer-border opacity-60" aria-hidden="true" />

        <div className="relative bg-brand-card/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl" aria-hidden="true">🔥</span>
            <span className="text-2xl font-black tracking-tight gradient-text">nummyGo</span>
          </Link>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-100 mt-4">Vendor Portal</h1>
            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
              Sign in to manage your restaurant, orders, and profile on NummyGo.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Continue with</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Google sign-in button */}
          <GlossButton
            id="google-signin-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-13 px-6 py-3.5 rounded-xl justify-center"
          >
            {/* Google icon */}
            <svg
              className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${loading ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {loading ? (
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </>
              )}
            </svg>
            {loading ? 'Redirecting to Google…' : 'Continue with Google'}
          </GlossButton>

          {/* Additional info */}
          <p className="text-center text-xs text-slate-600 mt-6 leading-relaxed">
            New vendor? Signing in automatically creates your account.
            <br />
            You&apos;ll set up your restaurant profile next.
          </p>

          {/* Divider */}
          <div className="h-px bg-white/5 my-6" />

          {/* Back to platform */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-400 transition-colors duration-200"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Back to NummyGo
            </Link>
          </div>
        </div>

        {/* Bottom glow accent */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-12 rounded-full animate-pulse-glow"
          style={{
            background: 'radial-gradient(ellipse, rgba(251,191,36,0.15) 0%, transparent 70%)',
            filter: 'blur(12px)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default function VendorLoginPage() {
  return (
    <Suspense>
      <VendorLoginContent />
    </Suspense>
  );
}
