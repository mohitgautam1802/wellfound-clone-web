'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, ChevronDown, LogOut, Search, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/cn';
import type { SearchStatus } from '@/lib/types';
import { Logo } from './logo';

const STATUS_OPTIONS: { value: SearchStatus; label: string; hint: string }[] = [
  {
    value: 'READY_TO_INTERVIEW',
    label: 'Ready to interview',
    hint: 'Actively looking and available to talk now',
  },
  {
    value: 'OPEN_TO_OFFERS',
    label: 'Open to offers',
    hint: 'Not looking hard, but open to the right role',
  },
  {
    value: 'CLOSED',
    label: 'Closed to offers',
    hint: 'Hide your profile from recruiters',
  },
];

export function Topbar() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [statusOpen, setStatusOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
  });

  const status = profile?.preference?.searchStatus ?? 'OPEN_TO_OFFERS';
  const current = STATUS_OPTIONS.find((o) => o.value === status);

  const setStatus = useMutation({
    mutationFn: (searchStatus: SearchStatus) =>
      api.updatePreferences({ searchStatus }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      setStatusOpen(false);
    },
  });

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-line bg-white">
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/jobs" className="flex items-center">
          <Logo />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/jobs"
            aria-label="Search jobs"
            className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <Search size={19} />
          </Link>

          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 block h-2 w-2 rounded-full bg-accent ring-2 ring-white" />
          </button>

          {/* Job-search status. The real product surfaces this in the header
              because it is the single control recruiters key off. */}
          <Dropdown
            open={statusOpen}
            onOpenChange={setStatusOpen}
            trigger={
              <span className="flex items-center gap-2 rounded-lg border border-line-strong px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-hover">
                <Check size={16} className="text-success" />
                <span className="hidden sm:inline">
                  {current?.label ?? 'Open to offers'}
                </span>
                <ChevronDown size={15} className="text-ink-muted" />
              </span>
            }
          >
            <div className="w-72 p-1.5">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate(option.value)}
                  className={cn(
                    'flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-hover',
                    option.value === status && 'bg-brand-soft',
                  )}
                >
                  <Check
                    size={16}
                    className={cn(
                      'mt-0.5 shrink-0',
                      option.value === status
                        ? 'text-brand'
                        : 'text-transparent',
                    )}
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {option.label}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {option.hint}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </Dropdown>

          <Dropdown
            open={menuOpen}
            onOpenChange={setMenuOpen}
            align="right"
            trigger={
              <span className="flex items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-surface-hover">
                <Avatar src={user?.avatarUrl} name={user?.name ?? '?'} size="md" />
                <ChevronDown size={15} className="text-ink-muted" />
              </span>
            }
          >
            <div className="w-56 p-1.5">
              <div className="border-b border-line px-3 py-2.5">
                <p className="truncate text-sm font-medium text-ink">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-ink-muted">{user?.email}</p>
              </div>

              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-hover"
              >
                <Settings size={16} className="text-ink-muted" />
                Profile settings
              </Link>

              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-hover"
              >
                <LogOut size={16} className="text-ink-muted" />
                Sign out
              </button>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

/** Click-outside dropdown. Small enough that a library would be overkill. */
function Dropdown({
  open,
  onOpenChange,
  trigger,
  children,
  align = 'right',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
      >
        {trigger}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute top-full z-50 mt-2 rounded-xl border border-line bg-white shadow-pop',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
