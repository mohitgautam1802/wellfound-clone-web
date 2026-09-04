'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Github, Globe, Linkedin, MapPin, Pencil, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompletionBanner } from '@/components/profile/completion-banner';
import { EducationEditor } from '@/components/profile/education-editor';
import { ExperienceEditor } from '@/components/profile/experience-editor';
import { TagInput } from '@/components/profile/tag-input';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import {
  ErrorPanel,
  LoadingPanel,
  Section,
  Spinner,
} from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatRoleType } from '@/lib/format';
import type { Profile, RoleType, SearchStatus, WorkEnvironment } from '@/lib/types';

type Tab = 'profile' | 'resume' | 'preferences' | 'culture';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'resume', label: 'Résumé' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'culture', label: 'Culture' },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('profile');

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
  });

  if (isLoading) return <LoadingPanel label="Loading your profile…" />;
  if (isError || !profile) {
    return (
      <ErrorPanel
        message={
          error instanceof Error ? error.message : 'Could not load your profile.'
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <CompletionBanner profile={profile} />
      <ProfileHeader profile={profile} />

      <div className="flex items-center gap-6 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors',
              tab === t.id
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <div className="space-y-4">
          <AboutSection profile={profile} />
          <ExperienceEditor profile={profile} />
          <EducationEditor profile={profile} />
          <SkillsSection profile={profile} />
        </div>
      ) : null}

      {tab === 'resume' ? <ResumeSection profile={profile} /> : null}
      {tab === 'preferences' ? <PreferencesSection profile={profile} /> : null}
      {tab === 'culture' ? <CultureSection profile={profile} /> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function ProfileHeader({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    headline: profile.headline ?? '',
    primaryRole: profile.primaryRole ?? '',
    location: profile.location ?? '',
    yearsOfExperience: profile.yearsOfExperience,
    websiteUrl: profile.websiteUrl ?? '',
    githubUrl: profile.githubUrl ?? '',
    linkedinUrl: profile.linkedinUrl ?? '',
    openToRoles: profile.openToRoles,
  });

  const save = useMutation({
    mutationFn: () =>
      api.updateProfile({
        headline: draft.headline || undefined,
        primaryRole: draft.primaryRole || undefined,
        location: draft.location || undefined,
        yearsOfExperience: draft.yearsOfExperience,
        // Empty strings would fail @IsUrl, so omit rather than send them.
        websiteUrl: draft.websiteUrl || undefined,
        githubUrl: draft.githubUrl || undefined,
        linkedinUrl: draft.linkedinUrl || undefined,
        openToRoles: draft.openToRoles,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      setOpen(false);
    },
  });

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start gap-4">
        <Avatar src={profile.user.avatarUrl} name={profile.user.name} size="xl" />

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-ink">{profile.user.name}</h1>
          {profile.headline ? (
            <p className="mt-0.5 text-sm text-ink-muted">{profile.headline}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-muted">
            {profile.primaryRole ? (
              <span className="chip bg-brand-soft text-brand">
                {profile.primaryRole}
              </span>
            ) : null}
            {profile.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} />
                {profile.location}
              </span>
            ) : null}
            <span>{profile.yearsOfExperience} yrs experience</span>
          </div>

          {profile.openToRoles.length > 0 ? (
            <p className="mt-2 text-xs text-ink-muted">
              Open to:{' '}
              <span className="text-ink">{profile.openToRoles.join(', ')}</span>
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <SocialLink href={profile.websiteUrl} icon={<Globe size={14} />} label="Website" />
            <SocialLink href={profile.githubUrl} icon={<Github size={14} />} label="GitHub" />
            <SocialLink
              href={profile.linkedinUrl}
              icon={<Linkedin size={14} />}
              label="LinkedIn"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-secondary shrink-0"
        >
          <Pencil size={15} />
          Edit
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit profile"
        size="lg"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? <Spinner className="border-white/40 border-t-white" /> : null}
              Save
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Headline" id="p-headline">
            <input
              id="p-headline"
              className="input"
              placeholder="Associate Product Manager | Fintech"
              value={draft.headline}
              onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary role" id="p-role">
              <input
                id="p-role"
                className="input"
                placeholder="Product Manager"
                value={draft.primaryRole}
                onChange={(e) => setDraft({ ...draft, primaryRole: e.target.value })}
              />
            </Field>
            <Field label="Location" id="p-location">
              <input
                id="p-location"
                className="input"
                placeholder="Bengaluru, India"
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Years of experience" id="p-years">
            <input
              id="p-years"
              type="number"
              min={0}
              max={60}
              className="input"
              value={draft.yearsOfExperience}
              onChange={(e) =>
                setDraft({ ...draft, yearsOfExperience: Number(e.target.value) })
              }
            />
          </Field>

          <Field label="Open to the following roles" id="p-open">
            <TagInput
              id="p-open"
              value={draft.openToRoles}
              onChange={(openToRoles) => setDraft({ ...draft, openToRoles })}
              placeholder="Product Manager"
              suggestions={['Product Manager', 'Associate Product Manager', 'Product Analyst']}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Website" id="p-web">
              <input
                id="p-web"
                className="input"
                placeholder="https://…"
                value={draft.websiteUrl}
                onChange={(e) => setDraft({ ...draft, websiteUrl: e.target.value })}
              />
            </Field>
            <Field label="GitHub" id="p-gh">
              <input
                id="p-gh"
                className="input"
                placeholder="https://github.com/…"
                value={draft.githubUrl}
                onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })}
              />
            </Field>
            <Field label="LinkedIn" id="p-li">
              <input
                id="p-li"
                className="input"
                placeholder="https://linkedin.com/in/…"
                value={draft.linkedinUrl}
                onChange={(e) => setDraft({ ...draft, linkedinUrl: e.target.value })}
              />
            </Field>
          </div>

          {save.isError ? (
            <p role="alert" className="text-sm text-danger">
              {save.error instanceof Error ? save.error.message : 'Could not save.'}
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string | null;
  icon: React.ReactNode;
  label: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="chip border border-line text-ink-muted hover:bg-surface-hover hover:text-ink"
    >
      {icon}
      {label}
    </a>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile tab sections
// ---------------------------------------------------------------------------

function AboutSection({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [achievements, setAchievements] = useState(profile.achievements ?? '');

  const save = useMutation({
    mutationFn: () =>
      api.updateProfile({
        bio: bio || undefined,
        achievements: achievements || undefined,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      setEditing(false);
    },
  });

  return (
    <Section
      title="About"
      action={
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="btn-ghost px-2 py-1"
        >
          <Pencil size={15} />
          {editing ? 'Cancel' : 'Edit'}
        </button>
      }
    >
      {editing ? (
        <div className="space-y-3">
          <Field label="Bio" id="about-bio">
            <textarea
              id="about-bio"
              className="input min-h-[110px] resize-y"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </Field>
          <Field label="Achievements" id="about-ach">
            <textarea
              id="about-ach"
              className="input min-h-[90px] resize-y"
              placeholder="Quantified wins recruiters can scan quickly."
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
            />
          </Field>
          <button
            type="button"
            className="btn-primary"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? <Spinner className="border-white/40 border-t-white" /> : null}
            Save
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">
            {profile.bio || 'No bio yet.'}
          </p>
          {profile.achievements ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                Achievements
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                {profile.achievements}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </Section>
  );
}

function SkillsSection({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>(profile.skills.map((s) => s.name));

  // Re-sync when the server copy changes (e.g. after another edit on this page).
  useEffect(() => {
    setSkills(profile.skills.map((s) => s.name));
  }, [profile.skills]);

  const save = useMutation({
    mutationFn: () => api.setSkills(skills.map((name) => ({ name }))),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      setEditing(false);
    },
  });

  return (
    <Section
      title="Skills"
      action={
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="btn-ghost px-2 py-1"
        >
          <Pencil size={15} />
          {editing ? 'Cancel' : 'Edit'}
        </button>
      }
    >
      {editing ? (
        <div className="space-y-3">
          <TagInput
            value={skills}
            onChange={setSkills}
            placeholder="Add a skill and press Enter"
            suggestions={['Product Management', 'SQL', 'User Research', 'Figma', 'Analytics']}
          />
          <button
            type="button"
            className="btn-primary"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? <Spinner className="border-white/40 border-t-white" /> : null}
            Save skills
          </button>
        </div>
      ) : profile.skills.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No skills yet. Add at least three — recruiters filter on these.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <span key={skill.id} className="chip bg-surface-hover text-ink">
              {skill.name}
              {skill.yearsOfExperience ? (
                <span className="text-ink-subtle">{skill.yearsOfExperience}y</span>
              ) : null}
            </span>
          ))}
        </div>
      )}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Résumé tab
// ---------------------------------------------------------------------------

function ResumeSection({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState(profile.resumeFileName ?? '');

  const save = useMutation({
    mutationFn: () => api.updateProfile({ resumeFileName: fileName || undefined }),
    onSuccess: (updated) => queryClient.setQueryData(['profile'], updated),
  });

  return (
    <Section title="Résumé">
      <div className="rounded-lg border border-dashed border-line-strong p-6 text-center">
        <FileText size={26} className="mx-auto text-ink-subtle" />
        <p className="mt-2 text-sm font-medium text-ink">
          {profile.resumeFileName ?? 'No résumé on file'}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          This clone stores the file name only — there is no file storage by
          design, so nothing is uploaded anywhere.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div className="flex-1">
          <label className="label" htmlFor="resume-name">
            Résumé file name
          </label>
          <input
            id="resume-name"
            className="input"
            placeholder="your-name-resume.pdf"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? <Spinner className="border-white/40 border-t-white" /> : <Upload size={15} />}
          Save
        </button>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Preferences tab
// ---------------------------------------------------------------------------

const SEARCH_STATUSES: { value: SearchStatus; label: string }[] = [
  { value: 'READY_TO_INTERVIEW', label: 'Ready to interview' },
  { value: 'OPEN_TO_OFFERS', label: 'Open to offers' },
  { value: 'CLOSED', label: 'Closed to offers' },
];

const ROLE_TYPES: RoleType[] = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'COFOUNDER',
];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

function PreferencesSection({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const preference = profile.preference;

  const [draft, setDraft] = useState({
    searchStatus: preference?.searchStatus ?? 'OPEN_TO_OFFERS',
    desiredRoleTypes: preference?.desiredRoleTypes ?? [],
    desiredRoles: preference?.desiredRoles ?? [],
    desiredLocations: preference?.desiredLocations ?? [],
    desiredCompanySizes: preference?.desiredCompanySizes ?? [],
    openToRemote: preference?.openToRemote ?? true,
    willingToRelocate: preference?.willingToRelocate ?? false,
    desiredSalaryMin: preference?.desiredSalaryMin ?? null,
  });

  const save = useMutation({
    mutationFn: () => api.updatePreferences(draft),
    onSuccess: (updated) => queryClient.setQueryData(['profile'], updated),
  });

  const toggle = <T extends string>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  return (
    <Section title="Job preferences">
      <div className="space-y-5">
        <div>
          <p className="label">Where are you in your job search?</p>
          <div className="flex flex-wrap gap-2">
            {SEARCH_STATUSES.map((status) => (
              <Chip
                key={status.value}
                label={status.label}
                selected={draft.searchStatus === status.value}
                onClick={() => setDraft({ ...draft, searchStatus: status.value })}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="label">What type of job are you interested in?</p>
          <div className="flex flex-wrap gap-2">
            {ROLE_TYPES.map((type) => (
              <Chip
                key={type}
                label={formatRoleType(type)}
                selected={draft.desiredRoleTypes.includes(type)}
                onClick={() =>
                  setDraft({
                    ...draft,
                    desiredRoleTypes: toggle(draft.desiredRoleTypes, type),
                  })
                }
              />
            ))}
          </div>
        </div>

        <Field label="Roles you want" id="pref-roles">
          <TagInput
            id="pref-roles"
            value={draft.desiredRoles}
            onChange={(desiredRoles) => setDraft({ ...draft, desiredRoles })}
            placeholder="Product Manager"
          />
        </Field>

        <Field label="Locations you want to work in" id="pref-locations">
          <TagInput
            id="pref-locations"
            value={draft.desiredLocations}
            onChange={(desiredLocations) => setDraft({ ...draft, desiredLocations })}
            placeholder="Bengaluru"
            suggestions={['Bengaluru', 'Remote', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune']}
          />
        </Field>

        <div>
          <p className="label">Company sizes you&apos;d join</p>
          <div className="flex flex-wrap gap-2">
            {COMPANY_SIZES.map((size) => (
              <Chip
                key={size}
                label={size}
                selected={draft.desiredCompanySizes.includes(size)}
                onClick={() =>
                  setDraft({
                    ...draft,
                    desiredCompanySizes: toggle(draft.desiredCompanySizes, size),
                  })
                }
              />
            ))}
          </div>
        </div>

        <Field label="Desired minimum salary (₹ lakhs)" id="pref-salary">
          <input
            id="pref-salary"
            type="number"
            min={0}
            className="input max-w-xs"
            value={draft.desiredSalaryMin ? draft.desiredSalaryMin / 100000 : ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                desiredSalaryMin: e.target.value
                  ? Number(e.target.value) * 100000
                  : null,
              })
            }
          />
        </Field>

        <div className="space-y-2">
          <Checkbox
            label="Open to remote roles"
            checked={draft.openToRemote}
            onChange={(openToRemote) => setDraft({ ...draft, openToRemote })}
          />
          <Checkbox
            label="Willing to relocate"
            checked={draft.willingToRelocate}
            onChange={(willingToRelocate) =>
              setDraft({ ...draft, willingToRelocate })
            }
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-primary"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? <Spinner className="border-white/40 border-t-white" /> : null}
            Save preferences
          </button>
          {save.isSuccess ? (
            <span className="text-sm text-success">Saved</span>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Culture tab
// ---------------------------------------------------------------------------

const WORK_ENVIRONMENTS: { value: WorkEnvironment; label: string }[] = [
  { value: 'OFFICE', label: 'In an office' },
  { value: 'REMOTE', label: 'Fully remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'NO_PREFERENCE', label: 'No preference' },
];

function CultureSection({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const culture = profile.culture;

  const [draft, setDraft] = useState({
    lookingFor: culture?.lookingFor ?? '',
    workEnvironment: culture?.workEnvironment ?? 'NO_PREFERENCE',
    importantFactors: culture?.importantFactors ?? [],
    remotePolicyImportance: culture?.remotePolicyImportance ?? 3,
    quietOfficeImportance: culture?.quietOfficeImportance ?? 3,
    marketsInterested: culture?.marketsInterested ?? [],
    marketsExcluded: culture?.marketsExcluded ?? [],
  });

  const save = useMutation({
    mutationFn: () =>
      api.updateCulture({ ...draft, lookingFor: draft.lookingFor || undefined }),
    onSuccess: (updated) => queryClient.setQueryData(['profile'], updated),
  });

  return (
    <Section title="Culture">
      <div className="space-y-5">
        <Field label="Describe what you're looking for in your next job" id="c-looking">
          <textarea
            id="c-looking"
            className="input min-h-[100px] resize-y"
            placeholder="Shown to companies as “Looking for”."
            value={draft.lookingFor}
            onChange={(e) => setDraft({ ...draft, lookingFor: e.target.value })}
          />
        </Field>

        <div>
          <p className="label">What environment do you work better in?</p>
          <div className="flex flex-wrap gap-2">
            {WORK_ENVIRONMENTS.map((env) => (
              <Chip
                key={env.value}
                label={env.label}
                selected={draft.workEnvironment === env.value}
                onClick={() => setDraft({ ...draft, workEnvironment: env.value })}
              />
            ))}
          </div>
        </div>

        <Field label="What's most important to you in your next job?" id="c-factors">
          <TagInput
            id="c-factors"
            value={draft.importantFactors}
            onChange={(importantFactors) => setDraft({ ...draft, importantFactors })}
            placeholder="Mentorship"
            suggestions={['Mentorship', 'Ownership', 'Compensation', 'Work-life balance', 'Learning']}
          />
        </Field>

        <Slider
          label="How important is a flexible remote-work policy?"
          value={draft.remotePolicyImportance}
          onChange={(remotePolicyImportance) =>
            setDraft({ ...draft, remotePolicyImportance })
          }
        />
        <Slider
          label="How important is a quiet office environment?"
          value={draft.quietOfficeImportance}
          onChange={(quietOfficeImportance) =>
            setDraft({ ...draft, quietOfficeImportance })
          }
        />

        <Field label="Markets you're MOST interested in" id="c-markets-in">
          <TagInput
            id="c-markets-in"
            value={draft.marketsInterested}
            onChange={(marketsInterested) => setDraft({ ...draft, marketsInterested })}
            placeholder="Fintech"
            suggestions={['Fintech', 'Healthtech', 'Developer Tools', 'Climate', 'Edtech']}
          />
        </Field>

        <Field label="Markets you're NOT willing to work in" id="c-markets-out">
          <TagInput
            id="c-markets-out"
            value={draft.marketsExcluded}
            onChange={(marketsExcluded) => setDraft({ ...draft, marketsExcluded })}
            placeholder="Gambling"
          />
        </Field>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-primary"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? <Spinner className="border-white/40 border-t-white" /> : null}
            Save culture
          </button>
          {save.isSuccess ? (
            <span className="text-sm text-success">Saved</span>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Small shared controls
// ---------------------------------------------------------------------------

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'chip border transition-colors',
        selected
          ? 'border-brand bg-brand-soft text-brand'
          : 'border-line text-ink-muted hover:bg-surface-hover',
      )}
    >
      {label}
    </button>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-line-strong text-brand focus:ring-brand"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-xs text-ink-muted">{value} / 5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand"
        aria-label={label}
      />
    </div>
  );
}
