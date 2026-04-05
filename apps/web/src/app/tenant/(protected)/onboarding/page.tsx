'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { authClient } from '@/lib/auth-client';
import { AuthNavbar } from '@/components/AuthNavbar';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@nummygo/shared/ui';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: tenant, isLoading } = trpc.tenant.me.useQuery();

  useEffect(() => {
    if (tenant?.onboardingCompleted) {
      router.push('/');
    }
  }, [tenant, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 w-64">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (tenant?.onboardingCompleted) return null;

  return (
    <>
      <AuthNavbar />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Onboarding</h1>
            <p className="text-muted-foreground">Your authentication and tenant information</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Session</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                  {JSON.stringify(session?.user, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tenant Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                  {JSON.stringify(tenant, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
