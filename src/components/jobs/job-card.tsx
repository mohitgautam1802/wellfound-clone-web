'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, BookmarkCheck, EyeOff, MapPin, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import {
  APPLICATION_STATUS_LABELS,
  formatEquity,
  formatExperience,
  formatLocationType,
  formatLocations,
  formatRelative,
  formatRoleType,
  formatSalary,
} from '@/lib/format';
import type { Job } from '@/lib/types';

interface JobCardProps {
  job: Job;
  /** The Hidden tab swaps the hide action for an unhide action. */
  variant?: 'default' | 'hidden';
}

export function JobCard({ job, variant = 'default' }: JobCardProps) {
  const queryClient = useQueryClient();

  // Every mutation invalidates the job lists so saved/hidden counts and the
  // Browse-all results stay consistent without hand-managing cache entries.
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['jobs'] });
    void queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    void queryClient.invalidateQueries({ queryKey: ['hidden-jobs'] });
  };

  const toggleSave = useMutation({
    mutationFn: () => (job.isSaved ? api.unsaveJob(job.id) : api.saveJob(job.id)),
    onSuccess: invalidate,
  });

  const toggleHide = useMutation({
    mutationFn: () =>
      variant === 'hidden' ? api.unhideJob(job.id) : api.hideJob(job.id),
    onSuccess: invalidate,
  });

  const equity = formatEquity(job);

  return (
    <article className="card group p-4 transition-shadow hover:shadow-pop">
      <div className="flex gap-3.5">
        <Avatar
          src={job.company.logoUrl}
          name={job.company.name}
          size="lg"
          rounded="md"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/jobs/${job.id}`}
                className="text-[15px] font-semibold text-brand hover:underline"
              >
                {job.title}
              </Link>

              <p className="mt-0.5 truncate text-sm text-ink">
                {job.company.name}
                {job.company.tagline ? (
                  <span className="text-ink-muted"> · {job.company.tagline}</span>
                ) : null}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => toggleSave.mutate()}
                disabled={toggleSave.isPending}
                aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
                title={job.isSaved ? 'Saved' : 'Save'}
                className={cn(
                  'rounded-lg p-2 transition-colors hover:bg-surface-hover',
                  job.isSaved ? 'text-brand' : 'text-ink-subtle hover:text-ink',
                )}
              >
                {job.isSaved ? (
                  <BookmarkCheck size={17} />
                ) : (
                  <Bookmark size={17} />
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleHide.mutate()}
                disabled={toggleHide.isPending}
                aria-label={variant === 'hidden' ? 'Unhide job' : 'Hide job'}
                title={variant === 'hidden' ? 'Unhide' : 'Hide'}
                className="rounded-lg p-2 text-ink-subtle transition-colors hover:bg-surface-hover hover:text-ink"
              >
                {variant === 'hidden' ? <Undo2 size={17} /> : <EyeOff size={17} />}
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} />
              {formatLocations(job.locations)}
            </span>
            <Dot />
            <span>{formatLocationType(job.locationType)}</span>
            <Dot />
            <span>{formatRoleType(job.roleType)}</span>
            <Dot />
            <span>{formatExperience(job)}</span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="chip bg-success-soft text-success">
              {formatSalary(job)}
            </span>
            {equity ? (
              <span className="chip bg-surface-hover text-ink-muted">
                {equity} equity
              </span>
            ) : null}
            {job.skills.slice(0, 3).map((skill) => (
              <span key={skill.id} className="chip bg-surface-hover text-ink-muted">
                {skill.name}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
            <p className="text-xs text-ink-subtle">
              Posted {formatRelative(job.postedAt)} · {job.applicantCount} applicants
            </p>

            {job.hasApplied ? (
              <span className="chip bg-surface-hover text-ink-muted">
                {job.applicationStatus
                  ? APPLICATION_STATUS_LABELS[job.applicationStatus]
                  : 'Applied'}
              </span>
            ) : (
              <Link href={`/jobs/${job.id}`} className="btn-primary px-3 py-1.5">
                Apply
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Dot() {
  return <span aria-hidden className="text-ink-subtle">·</span>;
}
