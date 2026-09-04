'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Briefcase, Inbox } from 'lucide-react';
import Link from 'next/link';
import { JobCard } from '@/components/jobs/job-card';
import { CompletionBanner } from '@/components/profile/completion-banner';
import { LoadingPanel, Section } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STYLES,
  formatRelative,
} from '@/lib/format';

export default function HomePage() {
  const { user } = useAuth();

  const profile = useQuery({ queryKey: ['profile'], queryFn: api.getProfile });

  const recommended = useQuery({
    queryKey: ['jobs', { sort: 'recommended', limit: 3, home: true }],
    queryFn: () => api.searchJobs({ sort: 'recommended', limit: 3, page: 1 }),
  });

  const applications = useQuery({
    queryKey: ['applications', 'home'],
    queryFn: () => api.applications({ limit: 4 }),
  });

  const stats = useQuery({
    queryKey: ['application-stats'],
    queryFn: api.applicationStats,
  });

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">Welcome back, {firstName}</h1>

      {profile.data ? <CompletionBanner profile={profile.data} /> : null}

      {stats.data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile label="Applications" value={stats.data.total} />
          <Tile label="Active" value={stats.data.active} />
          <Tile label="Interviewing" value={stats.data.byStatus.INTERVIEWING} />
          <Tile label="Offers" value={stats.data.byStatus.OFFER} />
        </div>
      ) : null}

      <Section
        title="Recommended for you"
        action={
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            See all
            <ArrowRight size={14} />
          </Link>
        }
      >
        {recommended.isLoading ? (
          <LoadingPanel />
        ) : (recommended.data?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-ink-muted">
            No matches yet — set your preferences to improve recommendations.
          </p>
        ) : (
          <div className="space-y-3">
            {recommended.data?.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Recent applications"
        action={
          <Link
            href="/applied"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            See all
            <ArrowRight size={14} />
          </Link>
        }
      >
        {applications.isLoading ? (
          <LoadingPanel />
        ) : (applications.data?.items.length ?? 0) === 0 ? (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <Inbox size={16} />
            Nothing yet.{' '}
            <Link href="/jobs" className="font-medium text-brand hover:underline">
              Find a role to apply to
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {applications.data?.items.map((application) => (
              <li
                key={application.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/jobs/${application.job.id}`}
                    className="truncate text-sm font-medium text-ink hover:text-brand"
                  >
                    {application.job.title}
                  </Link>
                  <p className="text-xs text-ink-muted">
                    {application.job.company.name} ·{' '}
                    {formatRelative(application.appliedAt)}
                  </p>
                </div>
                <span
                  className={`chip shrink-0 ${APPLICATION_STATUS_STYLES[application.status]}`}
                >
                  {APPLICATION_STATUS_LABELS[application.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Link
        href="/jobs"
        className="card flex items-center justify-between gap-3 p-4 transition-shadow hover:shadow-pop"
      >
        <span className="flex items-center gap-3">
          <Briefcase size={20} className="text-brand" />
          <span className="text-sm font-medium text-ink">
            Browse all open roles
          </span>
        </span>
        <ArrowRight size={16} className="text-ink-muted" />
      </Link>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-muted">{label}</p>
    </div>
  );
}
