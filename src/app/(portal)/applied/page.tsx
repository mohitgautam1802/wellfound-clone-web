'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Inbox,
  MapPin,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import {
  EmptyState,
  ErrorPanel,
  LoadingPanel,
  Spinner,
} from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import {
  APPLICATION_PIPELINE,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STYLES,
  formatRelative,
  formatSalary,
} from '@/lib/format';
import type { Application, ApplicationStatus } from '@/lib/types';

type Filter = 'all' | 'active' | 'archived';

const ACTIVE_STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'IN_REVIEW',
  'INTERVIEWING',
  'OFFER',
];
const ARCHIVED_STATUSES: ApplicationStatus[] = ['HIRED', 'REJECTED', 'WITHDRAWN'];

export default function AppliedPage() {
  const [filter, setFilter] = useState<Filter>('all');

  const statuses =
    filter === 'active'
      ? ACTIVE_STATUSES
      : filter === 'archived'
        ? ARCHIVED_STATUSES
        : undefined;

  const applications = useQuery({
    queryKey: ['applications', filter],
    queryFn: () => api.applications({ statuses, limit: 50 }),
  });

  const stats = useQuery({
    queryKey: ['application-stats'],
    queryFn: api.applicationStats,
  });

  const items = applications.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">Applied</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Track every role you&apos;ve applied to and where it stands.
        </p>
      </div>

      {stats.data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total" value={stats.data.total} />
          <StatTile label="Active" value={stats.data.active} />
          <StatTile
            label="Interviewing"
            value={stats.data.byStatus.INTERVIEWING}
          />
          <StatTile label="Offers" value={stats.data.byStatus.OFFER} />
        </div>
      ) : null}

      <div className="flex items-center gap-6 border-b border-line">
        <FilterTab
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="All"
          count={stats.data?.total}
        />
        <FilterTab
          active={filter === 'active'}
          onClick={() => setFilter('active')}
          label="Active"
          count={stats.data?.active}
        />
        <FilterTab
          active={filter === 'archived'}
          onClick={() => setFilter('archived')}
          label="Archived"
          count={stats.data?.archived}
        />
      </div>

      {applications.isLoading ? (
        <LoadingPanel />
      ) : applications.isError ? (
        <ErrorPanel
          message={
            applications.error instanceof Error
              ? applications.error.message
              : 'Could not load applications.'
          }
        />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Inbox size={28} />}
            title="No applications here yet"
            description="Applications you submit will show up here with their status."
            action={
              <Link href="/jobs" className="btn-primary">
                Browse jobs
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const [expanded, setExpanded] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const withdraw = useMutation({
    mutationFn: () => api.withdraw(application.id, reason.trim() || undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      void queryClient.invalidateQueries({ queryKey: ['application-stats'] });
      setWithdrawOpen(false);
    },
  });

  const { job } = application;
  const stageIndex = APPLICATION_PIPELINE.indexOf(application.status);

  return (
    <article className="card p-4">
      <div className="flex gap-3.5">
        <Avatar
          src={job.company.logoUrl}
          name={job.company.name}
          size="lg"
          rounded="md"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/jobs/${job.id}`}
                className="text-[15px] font-semibold text-brand hover:underline"
              >
                {job.title}
              </Link>
              <p className="mt-0.5 text-sm text-ink">{job.company.name}</p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} />
                  {job.locations.map((l) => l.city).join(' · ') || 'Not specified'}
                </span>
                <span>·</span>
                <span>{formatSalary(job)}</span>
                <span>·</span>
                <span>Applied {formatRelative(application.appliedAt)}</span>
              </div>
            </div>

            <span
              className={cn(
                'chip shrink-0',
                APPLICATION_STATUS_STYLES[application.status],
              )}
            >
              {APPLICATION_STATUS_LABELS[application.status]}
            </span>
          </div>

          {/* Pipeline rail. Terminal statuses drop out of it entirely, since
              "Not selected" is not a later stage of "Interviewing". */}
          {!application.isArchived ? (
            <div className="mt-3 flex items-center gap-1">
              {APPLICATION_PIPELINE.map((stage, index) => (
                <div key={stage} className="flex flex-1 items-center gap-1">
                  <div
                    className={cn(
                      'h-1.5 flex-1 rounded-full',
                      index <= stageIndex ? 'bg-success' : 'bg-line',
                    )}
                    title={APPLICATION_STATUS_LABELS[stage]}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {application.isExpiringSoon && !application.isArchived ? (
            <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-warn-soft px-2.5 py-1.5 text-xs font-medium text-warn">
              <AlertTriangle size={13} />
              {application.isExpired
                ? 'This application has expired'
                : `Expires in ${application.daysUntilExpiry} day${
                    application.daysUntilExpiry === 1 ? '' : 's'
                  } without activity`}
            </p>
          ) : application.daysUntilExpiry !== null && !application.isArchived ? (
            <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-ink-subtle">
              <Clock size={12} />
              Expires in {application.daysUntilExpiry} days without activity
            </p>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink"
            >
              {expanded ? 'Hide' : 'Show'} timeline
              <ChevronDown
                size={13}
                className={cn('transition-transform', expanded && 'rotate-180')}
              />
            </button>

            {!application.isArchived ? (
              <button
                type="button"
                onClick={() => setWithdrawOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-danger"
              >
                <X size={13} />
                Withdraw
              </button>
            ) : null}
          </div>

          {expanded ? (
            <div className="mt-3 space-y-3 border-t border-line pt-3">
              <ol className="space-y-3">
                {application.events.map((event) => (
                  <li key={event.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-line-strong" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {APPLICATION_STATUS_LABELS[event.status]}
                      </p>
                      {event.note ? (
                        <p className="text-xs text-ink-muted">{event.note}</p>
                      ) : null}
                      <p className="mt-0.5 text-xs text-ink-subtle">
                        {formatRelative(event.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {application.coverLetter ? (
                <div className="rounded-lg bg-surface-page p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Your note
                  </p>
                  <p className="whitespace-pre-line text-sm text-ink-muted">
                    {application.coverLetter}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        title="Withdraw application"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setWithdrawOpen(false)}
            >
              Keep it
            </button>
            <button
              type="button"
              className="btn bg-danger text-white hover:bg-danger/90"
              disabled={withdraw.isPending}
              onClick={() => withdraw.mutate()}
            >
              {withdraw.isPending ? (
                <Spinner className="border-white/40 border-t-white" />
              ) : null}
              Withdraw
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          Withdraw your application to <strong>{job.title}</strong> at{' '}
          {job.company.name}? The company keeps a record that you applied, and
          this cannot be undone.
        </p>
        <textarea
          className="input mt-3 min-h-[90px] resize-y"
          placeholder="Reason (optional) — recorded on your timeline"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
        />
      </Modal>
    </article>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-muted">{label}</p>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        '-mb-px flex items-center gap-1.5 border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors',
        active
          ? 'border-ink text-ink'
          : 'border-transparent text-ink-muted hover:text-ink',
      )}
    >
      {label}
      {count !== undefined ? (
        <span className="rounded-full bg-surface-hover px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted">
          {count}
        </span>
      ) : null}
    </button>
  );
}
