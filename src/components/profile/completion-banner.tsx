'use client';

import { UserCheck, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { Profile } from '@/lib/types';

const SEGMENTS = 12;

/**
 * The segmented progress bar and congratulations banner from the real portal.
 * When incomplete it names the next few missing steps rather than only showing
 * a percentage, which on its own tells the candidate nothing actionable.
 */
export function CompletionBanner({ profile }: { profile: Profile }) {
  const [dismissed, setDismissed] = useState(false);
  const { score, missing } = profile.completion;

  if (dismissed) return null;

  const filled = Math.round((score / 100) * SEGMENTS);
  const complete = score >= 100;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-card">
      <div className="flex gap-0.5" aria-hidden>
        {Array.from({ length: SEGMENTS }).map((_, index) => (
          <span
            key={index}
            className={cn(
              'h-1.5 flex-1',
              index < filled ? 'bg-success' : 'bg-line',
            )}
          />
        ))}
      </div>

      <div className="flex items-start gap-3 px-4 py-3.5">
        <UserCheck size={20} className="mt-0.5 shrink-0 text-ink-muted" />

        <div className="min-w-0 flex-1">
          {complete ? (
            <p className="text-sm text-ink">
              <strong className="font-semibold">
                Congrats! Your profile is complete.
              </strong>{' '}
              We&apos;ll show you jobs and surface your profile to companies based
              on the skills and preferences you shared.
            </p>
          ) : (
            <>
              <p className="text-sm text-ink">
                <strong className="font-semibold">
                  Your profile is {score}% complete.
                </strong>{' '}
                Finish it so companies can find you.
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {missing.slice(0, 4).map((step) => (
                  <li
                    key={step.key}
                    className="chip bg-warn-soft text-warn"
                  >
                    {step.label}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="rounded-lg p-1 text-ink-subtle transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
