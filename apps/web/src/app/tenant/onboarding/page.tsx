'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { authClient } from '@/lib/auth-client';
import { AuthNavbar } from '@/components/AuthNavbar';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: tenant, isLoading } = trpc.tenant.me.useQuery();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    // If tenant data loaded and onboarding is already completed, redirect to dashboard
    if (tenant && tenant.onboardingCompleted) {
      router.push('/');
    }
  }, [tenant, router]);

  // Show loading state while checking tenant status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If already onboarded, show nothing (will redirect via useEffect)
  if (tenant?.onboardingCompleted) {
    return null;
  }

  // Show tenant information
  return (
    <>
      <AuthNavbar />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Onboarding</h1>
          <p className="text-muted-foreground">
            Your authentication and tenant information
          </p>
        </div>

        <div className="space-y-6">
          {/* User Session Information */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">User Session</h2>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(session?.user, null, 2)}
            </pre>
          </div>

          {/* Tenant Information */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Tenant Information</h2>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(tenant, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
