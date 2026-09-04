'use client';

import { Briefcase, Gift, Home, Inbox, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/applied', label: 'Applied', icon: Inbox },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-30 hidden w-[104px] flex-col justify-between border-r border-line bg-white pt-16 md:flex"
    >
      <ul className="flex flex-col gap-1 px-2 pt-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          // startsWith so /jobs/<id> keeps the Jobs tab lit.
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-[11px] font-medium transition-colors',
                  active
                    ? 'bg-brand-soft text-brand'
                    : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="px-2 pb-6">
        <div className="flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-center text-[11px] font-medium text-ink-muted">
          <Gift size={20} strokeWidth={1.8} />
          <span className="leading-tight">
            Refer a friend
            <br />
            <span className="text-ink-subtle">Earn $200</span>
          </span>
        </div>
      </div>
    </nav>
  );
}
