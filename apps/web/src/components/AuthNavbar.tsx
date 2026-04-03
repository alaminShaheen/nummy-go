'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@nummygo/shared/ui';

export function AuthNavbar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        },
      },
    });
  };

  if (isPending) {
    return (
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-bold gradient-text">NummyGo</div>
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold gradient-text">NummyGo</div>

        {session?.user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
                <span className="text-xs text-muted-foreground">{session.user.role || 'customer'}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
