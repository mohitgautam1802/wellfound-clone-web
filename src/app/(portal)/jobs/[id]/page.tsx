'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { ErrorPanel, LoadingPanel, Spinner } from '@/components/ui/primitives';
import { ApiError, api } from '@/lib/api';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STYLES,
  formatEquity,
  formatExperience,
  formatLocationType,
  formatRelative,
  formatRoleType,
  formatSalary,
} from '@/lib/format';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [applyOpen, setApplyOpen] = useState(false);
  const [note, setNote] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);

  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.getJob(id),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['job', id] });
    void queryClient.invalidateQueries({ queryKey: ['jobs'] });
    void queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    void queryClient.invalidateQueries({ queryKey: ['applications'] });
    void queryClient.invalidateQueries({ queryKey: ['application-stats'] });
  };

  const toggleSave = useMutation({
    mutationFn: () => (job!.isSaved ? api.unsaveJob(job!.id) : api.saveJob(job!.id)),
    onSuccess: invalidate,
  });

  const apply = useMutation({
    mutationFn: () =>
      api.apply({ jobId: job!.id, coverLetter: note.trim() || undefined }),
    onSuccess: () => {
      invalidate();
      setApplyOpen(false);
      setNote('');
      router.push('/applied');
    },
    onError: (err) =>
      setApplyError(
        err instanceof ApiError ? err.message : 'Could not submit application.',
      ),
  });

  if (isLoading) return <LoadingPanel />;
  if (isError || !job) {
    return (
      <ErrorPanel
        message={error instanceof Error ? error.message : 'Job not found.'}
      />
    );
  }

  const equity = formatEquity(job);

  return (
    <div className="space-y-4">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back to jobs
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 gap-4">
            <Avatar
              src={job.company.logoUrl}
              name={job.company.name}
              size="xl"
              rounded="md"
            />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-ink">{job.title}</h1>
              <p className="mt-1 text-sm font-medium text-ink">
                {job.company.name}
              </p>
              {job.company.tagline ? (
                <p className="text-sm text-ink-muted">{job.company.tagline}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} />
                  {job.locations.map((l) => l.city).join(' · ') || 'Not specified'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Building2 size={13} />
                  {formatLocationType(job.locationType)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={13} />
                  Posted {formatRelative(job.postedAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={13} />
                  {job.applicantCount} applicants
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSave.mutate()}
              disabled={toggleSave.isPending}
              className="btn-secondary"
            >
              {job.isSaved ? (
                <>
                  <BookmarkCheck size={16} className="text-brand" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark size={16} />
                  Save
                </>
              )}
            </button>

            {job.hasApplied ? (
              <span
                className={`chip px-3 py-2 ${
                  job.applicationStatus
                    ? APPLICATION_STATUS_STYLES[job.applicationStatus]
                    : ''
                }`}
              >
                <CheckCircle2 size={15} />
                {job.applicationStatus
                  ? APPLICATION_STATUS_LABELS[job.applicationStatus]
                  : 'Applied'}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setApplyError(null);
                  setApplyOpen(true);
                }}
                className="btn-primary"
              >
                Apply
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          <span className="chip bg-success-soft text-success">
            {formatSalary(job)}
          </span>
          {equity ? (
            <span className="chip bg-surface-hover text-ink-muted">
              {equity} equity
            </span>
          ) : null}
          <span className="chip bg-surface-hover text-ink-muted">
            {formatRoleType(job.roleType)}
          </span>
          <span className="chip bg-surface-hover text-ink-muted">
            {formatExperience(job)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="card p-5">
            <h2 className="mb-2 text-base font-semibold text-ink">
              About the role
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">
              {job.description}
            </p>
          </section>

          {job.requirements.length > 0 ? (
            <section className="card p-5">
              <h2 className="mb-3 text-base font-semibold text-ink">
                What we&apos;re looking for
              </h2>
              <ul className="space-y-2">
                {job.requirements.map((requirement) => (
                  <li
                    key={requirement}
                    className="flex gap-2.5 text-sm text-ink-muted"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-success"
                    />
                    {requirement}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {job.skills.length > 0 ? (
            <section className="card p-5">
              <h2 className="mb-3 text-base font-semibold text-ink">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="chip bg-surface-hover text-ink-muted"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="mb-3 text-base font-semibold text-ink">
              About {job.company.name}
            </h2>
            {job.company.description ? (
              <p className="text-sm leading-relaxed text-ink-muted">
                {job.company.description}
              </p>
            ) : null}

            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Industry" value={job.company.industry} />
              <Row label="Company size" value={job.company.size} />
              <Row
                label="Funding"
                value={job.company.fundingStage?.replace(/_/g, ' ')}
              />
              <Row label="Location" value={job.company.location} />
              <Row label="Founded" value={job.company.foundedYear?.toString()} />
            </dl>
          </section>

          {job.recruiterName ? (
            <section className="card p-5">
              <h2 className="mb-3 text-base font-semibold text-ink">
                Hiring contact
              </h2>
              <div className="flex items-center gap-3">
                <Avatar name={job.recruiterName} size="md" />
                <div>
                  <p className="text-sm font-medium text-ink">
                    {job.recruiterName}
                  </p>
                  <p className="text-xs text-ink-muted">{job.recruiterTitle}</p>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {/* Apply modal - Wellfound asks for a short note, nothing else. */}
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title={`Apply to ${job.title}`}
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setApplyOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={apply.isPending}
              onClick={() => apply.mutate()}
            >
              {apply.isPending ? (
                <Spinner className="border-white/40 border-t-white" />
              ) : null}
              Send application
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          Your profile and résumé are shared with {job.company.name}. Add a note
          introducing yourself — it works like a short cover letter.
        </p>

        <textarea
          className="input mt-3 min-h-[150px] resize-y"
          placeholder={`Why are you a good fit for ${job.title}?`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={5000}
        />
        <p className="mt-1 text-right text-xs text-ink-subtle">
          {note.length}/5000
        </p>

        <p className="mt-2 rounded-lg bg-warn-soft px-3 py-2 text-xs text-warn">
          Applications expire after two weeks without activity.
        </p>

        {applyError ? (
          <p role="alert" className="mt-2 text-sm text-danger">
            {applyError}
          </p>
        ) : null}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium capitalize text-ink">{value}</dd>
    </div>
  );
}
