import { formatDistanceToNowStrict } from 'date-fns';
import type { ApplicationStatus, Job, LocationType, RoleType } from './types';

/**
 * Indian salary formatting. Wellfound shows INR bands in lakhs, so 2400000
 * renders as "₹24L" rather than "₹2,400,000" - the latter is technically
 * correct and completely unreadable to the audience.
 */
export function formatSalary(job: Pick<Job, 'salaryMin' | 'salaryMax' | 'currency'>) {
  const { salaryMin, salaryMax, currency } = job;
  if (salaryMin === null && salaryMax === null) return 'Not disclosed';

  if (currency !== 'INR') {
    const fmt = (n: number) => `${currency} ${(n / 1000).toFixed(0)}k`;
    if (salaryMin && salaryMax) return `${fmt(salaryMin)} – ${fmt(salaryMax)}`;
    return fmt((salaryMin ?? salaryMax)!);
  }

  const lakh = (n: number) => {
    const value = n / 100000;
    // Drop the decimal on whole lakhs: 24L, not 24.0L.
    return Number.isInteger(value) ? `${value}L` : `${value.toFixed(1)}L`;
  };

  if (salaryMin && salaryMax) return `₹${lakh(salaryMin)} – ₹${lakh(salaryMax)}`;
  return `₹${lakh((salaryMin ?? salaryMax)!)}`;
}

export function formatEquity(job: Pick<Job, 'equityMin' | 'equityMax'>) {
  const { equityMin, equityMax } = job;
  if (equityMin === null && equityMax === null) return null;
  if (equityMin !== null && equityMax !== null) {
    return `${equityMin}% – ${equityMax}%`;
  }
  return `${equityMin ?? equityMax}%`;
}

export function formatRoleType(roleType: RoleType): string {
  const labels: Record<RoleType, string> = {
    FULL_TIME: 'Full time',
    PART_TIME: 'Part time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
    COFOUNDER: 'Cofounder',
  };
  return labels[roleType] ?? roleType;
}

export function formatLocationType(locationType: LocationType): string {
  const labels: Record<LocationType, string> = {
    REMOTE: 'Remote',
    ONSITE: 'On-site',
    HYBRID: 'Hybrid',
  };
  return labels[locationType] ?? locationType;
}

export function formatExperience(job: Pick<Job, 'experienceMin' | 'experienceMax'>) {
  if (job.experienceMin === 0 && job.experienceMax === 0) return 'No experience required';
  return `${job.experienceMin}–${job.experienceMax} yrs`;
}

export function formatLocations(locations: { city: string }[]): string {
  if (locations.length === 0) return 'Location not specified';
  if (locations.length <= 2) return locations.map((l) => l.city).join(' · ');
  return `${locations[0].city} +${locations.length - 1} more`;
}

export function formatRelative(iso: string): string {
  try {
    return `${formatDistanceToNowStrict(new Date(iso))} ago`;
  } catch {
    return '';
  }
}

export function formatMonthYear(iso: string | null): string {
  if (!iso) return 'Present';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Application status presentation
// ---------------------------------------------------------------------------

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  IN_REVIEW: 'In review',
  INTERVIEWING: 'Interviewing',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Not selected',
  WITHDRAWN: 'Withdrawn',
};

/** Tailwind classes per status. Terminal states are deliberately desaturated. */
export const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  APPLIED: 'bg-brand-soft text-brand',
  IN_REVIEW: 'bg-warn-soft text-warn',
  INTERVIEWING: 'bg-violet-100 text-violet-700',
  OFFER: 'bg-success-soft text-success',
  HIRED: 'bg-success-soft text-success',
  REJECTED: 'bg-surface-hover text-ink-muted',
  WITHDRAWN: 'bg-surface-hover text-ink-muted',
};

/** Ordered pipeline for the timeline rail; terminal states sit outside it. */
export const APPLICATION_PIPELINE: ApplicationStatus[] = [
  'APPLIED',
  'IN_REVIEW',
  'INTERVIEWING',
  'OFFER',
];
