'use client';

import { Building2, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { formatRoleType } from '@/lib/format';
import type { JobSearchParams, LocationType, RoleType } from '@/lib/types';

/** Cities the seed data actually covers, matching the real portal's list. */
const CITIES = [
  'Bengaluru',
  'Delhi',
  'Gurgaon',
  'Pune',
  'Hyderabad',
  'Jaipur',
  'Mumbai',
  'Noida',
  'New Delhi',
  'Mysuru',
  'Kolkata',
  'Chennai',
  'Remote',
];

const ROLE_TYPES: RoleType[] = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'COFOUNDER',
];

const LOCATION_TYPES: LocationType[] = ['REMOTE', 'ONSITE', 'HYBRID'];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

interface JobFiltersProps {
  value: JobSearchParams;
  onChange: (next: JobSearchParams) => void;
}

export function JobFilters({ value, onChange }: JobFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const patch = (next: Partial<JobSearchParams>) =>
    // Any filter change resets to page 1; staying on page 4 of a different
    // result set is never what the user meant.
    onChange({ ...value, ...next, page: 1 });

  const toggleInArray = <T extends string>(
    list: T[] | undefined,
    item: T,
  ): T[] | undefined => {
    const current = list ?? [];
    const next = current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item];
    return next.length > 0 ? next : undefined;
  };

  const activeCount =
    (value.roleTypes?.length ?? 0) +
    (value.locationTypes?.length ?? 0) +
    (value.companySizes?.length ?? 0) +
    (value.salaryMin ? 1 : 0) +
    (value.experience !== undefined ? 1 : 0);

  return (
    <div className="card overflow-visible p-3">
      {/* Search */}
      <label className="flex items-center gap-2.5 rounded-lg bg-brand-soft/60 px-3 py-2.5">
        <Search size={17} className="shrink-0 text-brand" />
        <input
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
          placeholder='Job title, company or skill — use "quotes" for exact phrases'
          value={value.q ?? ''}
          onChange={(e) => patch({ q: e.target.value || undefined })}
          aria-label="Search jobs"
        />
        {value.q ? (
          <button
            type="button"
            onClick={() => patch({ q: undefined })}
            aria-label="Clear search"
            className="text-ink-muted hover:text-ink"
          >
            <X size={15} />
          </button>
        ) : null}
      </label>

      {/* Locations */}
      <div className="relative mt-2">
        <div className="flex items-center gap-2.5 rounded-lg bg-brand-soft/60 px-3 py-2.5">
          <Building2 size={17} className="shrink-0 text-brand" />

          <div className="flex min-h-[22px] flex-1 flex-wrap items-center gap-1.5">
            {(value.locations ?? []).map((city) => (
              <span
                key={city}
                className="chip bg-white text-ink shadow-card ring-1 ring-line"
              >
                {city}
                <button
                  type="button"
                  onClick={() =>
                    patch({ locations: toggleInArray(value.locations, city) })
                  }
                  aria-label={`Remove ${city}`}
                  className="text-ink-muted hover:text-ink"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {(value.locations ?? []).length === 0 ? (
              <span className="text-sm text-ink-subtle">Any location</span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setCityOpen((o) => !o)}
            aria-expanded={cityOpen}
            className="flex shrink-0 items-center gap-1 rounded-full border border-line-strong bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted hover:bg-surface-hover"
          >
            Worldwide
            <ChevronDown size={13} />
          </button>
        </div>

        {cityOpen ? (
          <div className="absolute inset-x-0 top-full z-20 mt-1 rounded-xl border border-line bg-white p-2 shadow-pop">
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map((city) => {
                const selected = (value.locations ?? []).includes(city);
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() =>
                      patch({ locations: toggleInArray(value.locations, city) })
                    }
                    className={cn(
                      'chip border transition-colors',
                      selected
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-line text-ink-muted hover:bg-surface-hover',
                    )}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Role types + expander */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {ROLE_TYPES.slice(0, 3).map((type) => {
          const selected = (value.roleTypes ?? []).includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => patch({ roleTypes: toggleInArray(value.roleTypes, type) })}
              className={cn(
                'chip border transition-colors',
                selected
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-line text-ink-muted hover:bg-surface-hover',
              )}
            >
              {formatRoleType(type)}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="chip border border-line text-ink-muted hover:bg-surface-hover"
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeCount > 0 ? (
            <span className="ml-0.5 rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white">
              {activeCount}
            </span>
          ) : null}
          <ChevronDown
            size={13}
            className={cn('transition-transform', expanded && 'rotate-180')}
          />
        </button>

        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() =>
              onChange({ q: value.q, sort: value.sort, page: 1, limit: value.limit })
            }
            className="text-xs font-medium text-brand hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="mt-3 grid gap-4 border-t border-line pt-3 sm:grid-cols-2">
          <FilterGroup label="Role type">
            {ROLE_TYPES.map((type) => (
              <CheckChip
                key={type}
                label={formatRoleType(type)}
                checked={(value.roleTypes ?? []).includes(type)}
                onToggle={() =>
                  patch({ roleTypes: toggleInArray(value.roleTypes, type) })
                }
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Work arrangement">
            {LOCATION_TYPES.map((type) => (
              <CheckChip
                key={type}
                label={type.charAt(0) + type.slice(1).toLowerCase()}
                checked={(value.locationTypes ?? []).includes(type)}
                onToggle={() =>
                  patch({ locationTypes: toggleInArray(value.locationTypes, type) })
                }
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Company size">
            {COMPANY_SIZES.map((size) => (
              <CheckChip
                key={size}
                label={size}
                checked={(value.companySizes ?? []).includes(size)}
                onToggle={() =>
                  patch({ companySizes: toggleInArray(value.companySizes, size) })
                }
              />
            ))}
          </FilterGroup>

          <div className="space-y-3">
            <div>
              <label className="label" htmlFor="salaryMin">
                Minimum salary (₹ lakhs)
              </label>
              <input
                id="salaryMin"
                type="number"
                min={0}
                step={1}
                className="input"
                placeholder="e.g. 24"
                value={value.salaryMin ? value.salaryMin / 100000 : ''}
                onChange={(e) =>
                  patch({
                    salaryMin: e.target.value
                      ? Number(e.target.value) * 100000
                      : undefined,
                  })
                }
              />
            </div>

            <div>
              <label className="label" htmlFor="experience">
                Your years of experience
              </label>
              <input
                id="experience"
                type="number"
                min={0}
                max={40}
                className="input"
                placeholder="e.g. 2"
                value={value.experience ?? ''}
                onChange={(e) =>
                  patch({
                    experience: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function CheckChip({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={cn(
        'chip border transition-colors',
        checked
          ? 'border-brand bg-brand-soft text-brand'
          : 'border-line text-ink-muted hover:bg-surface-hover',
      )}
    >
      {label}
    </button>
  );
}
