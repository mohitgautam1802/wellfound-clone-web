'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BellRing, Briefcase, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { JobCard } from '@/components/jobs/job-card';
import { JobFilters } from '@/components/jobs/job-filters';
import {
  EmptyState,
  ErrorPanel,
  LoadingPanel,
  Spinner,
} from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { JobSearchParams } from '@/lib/types';

type Tab = 'browse' | 'saved' | 'hidden';

const PAGE_SIZE = 10;

export default function JobsPage() {
  const [tab, setTab] = useState<Tab>('browse');
  const [params, setParams] = useState<JobSearchParams>({
    sort: 'recommended',
    page: 1,
    limit: PAGE_SIZE,
  });

  const queryClient = useQueryClient();

  const browse = useQuery({
    queryKey: ['jobs', params],
    queryFn: () => api.searchJobs(params),
    enabled: tab === 'browse',
  });

  const saved = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => api.savedJobs(1, 50),
  });

  const hidden = useQuery({
    queryKey: ['hidden-jobs'],
    queryFn: () => api.hiddenJobs(1, 50),
    enabled: tab === 'hidden',
  });

  const savedSearches = useQuery({
    queryKey: ['saved-searches'],
    queryFn: api.savedSearches,
  });

  const createSearch = useMutation({
    mutationFn: () =>
      api.createSavedSearch({
        name: describeSearch(params),
        filters: params,
        alertEnabled: false,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] }),
  });

  const deleteSearch = useMutation({
    mutationFn: (id: string) => api.deleteSavedSearch(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] }),
  });

  const active =
    tab === 'browse' ? browse : tab === 'saved' ? saved : hidden;

  const jobs = active.data?.items ?? [];
  const total = active.data?.meta.total ?? 0;
  const totalPages = browse.data?.meta.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">Search for jobs</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-line">
        <TabButton
          active={tab === 'browse'}
          onClick={() => setTab('browse')}
          label="Browse all"
        />
        <TabButton
          active={tab === 'saved'}
          onClick={() => setTab('saved')}
          label="Saved"
          count={saved.data?.meta.total}
        />
        <TabButton
          active={tab === 'hidden'}
          onClick={() => setTab('hidden')}
          label="Hidden"
          count={hidden.data?.meta.total}
        />
      </div>

      {tab === 'browse' ? (
        <>
          {/* Saved searches */}
          <div className="flex flex-wrap items-center gap-2">
            {savedSearches.data?.map((search) => (
              <span
                key={search.id}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-card"
              >
                <button
                  type="button"
                  onClick={() =>
                    setParams({ ...search.filters, page: 1, limit: PAGE_SIZE })
                  }
                  className="hover:text-brand"
                  title="Apply this saved search"
                >
                  {search.name}
                </button>
                {search.alertEnabled ? (
                  <BellRing size={12} className="text-success" />
                ) : null}
                <button
                  type="button"
                  onClick={() => deleteSearch.mutate(search.id)}
                  aria-label={`Delete saved search ${search.name}`}
                  className="text-ink-subtle opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={() => createSearch.mutate()}
              disabled={createSearch.isPending}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-line-strong px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-hover hover:text-ink"
            >
              {createSearch.isPending ? <Spinner /> : <Plus size={13} />}
              Save this search
            </button>
          </div>

          <JobFilters value={params} onChange={setParams} />

          {/* Result header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">
              {browse.isLoading ? 'Searching…' : `${total} results`}
            </p>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                Sort by:
                <select
                  className="rounded-lg border border-line-strong bg-white px-2.5 py-1.5 text-sm font-medium text-ink focus:border-brand focus:outline-none"
                  value={params.sort ?? 'recommended'}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      sort: e.target.value as JobSearchParams['sort'],
                      page: 1,
                    })
                  }
                >
                  <option value="recommended">Recommended</option>
                  <option value="recent">Most recent</option>
                  <option value="salary">Highest salary</option>
                </select>
              </label>

              <span className="hidden items-center gap-1.5 text-sm text-ink-muted sm:flex">
                <Bell size={14} />
                Get job alerts
              </span>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-ink-subtle">
            <EyeOff size={13} />
            Hidden jobs are excluded from these results.
          </p>
        </>
      ) : null}

      {/* Results */}
      {active.isLoading ? (
        <LoadingPanel />
      ) : active.isError ? (
        <ErrorPanel
          message={
            active.error instanceof Error
              ? active.error.message
              : 'Could not load jobs.'
          }
        />
      ) : jobs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Briefcase size={28} />}
            title={
              tab === 'saved'
                ? 'No saved jobs yet'
                : tab === 'hidden'
                  ? 'Nothing hidden'
                  : 'No jobs match those filters'
            }
            description={
              tab === 'browse'
                ? 'Try removing a filter or widening your locations.'
                : tab === 'saved'
                  ? 'Save a role from Browse all to keep it here.'
                  : 'Jobs you hide will collect here.'
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              variant={tab === 'hidden' ? 'hidden' : 'default'}
            />
          ))}
        </div>
      )}

      {/* Pagination (browse only - saved/hidden fetch a single large page) */}
      {tab === 'browse' && totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            className="btn-secondary px-3 py-1.5"
            disabled={(params.page ?? 1) <= 1}
            onClick={() => setParams({ ...params, page: (params.page ?? 1) - 1 })}
          >
            Previous
          </button>
          <span className="px-2 text-sm text-ink-muted">
            Page {params.page ?? 1} of {totalPages}
          </span>
          <button
            type="button"
            className="btn-secondary px-3 py-1.5"
            disabled={!browse.data?.meta.hasNextPage}
            onClick={() => setParams({ ...params, page: (params.page ?? 1) + 1 })}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function TabButton({
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
      {count !== undefined && count > 0 ? (
        <span className="rounded-full bg-surface-hover px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted">
          {count}
        </span>
      ) : null}
    </button>
  );
}

/** Human-readable name for a saved search, from whatever is actually set. */
function describeSearch(params: JobSearchParams): string {
  const parts: string[] = [];
  if (params.q) parts.push(params.q.replace(/"/g, ''));
  if (params.locations?.length) parts.push(params.locations.join(', '));
  if (params.roleTypes?.length) parts.push(params.roleTypes.length + ' role types');
  return parts.join(' · ').slice(0, 110) || 'All jobs';
}
