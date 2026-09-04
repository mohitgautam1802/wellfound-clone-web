'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { LoadingPanel } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  // Render nothing rather than a flash of the shell while the stored token is
  // still being exchanged for a user.
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingPanel label="Loading your account…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Topbar />
      <Sidebar />
      <main className="pt-16 md:pl-[104px]">
        <div className="mx-auto max-w-content px-4 py-6 md:px-8">{children}</div>
      </main>
    </div>
  );
}
