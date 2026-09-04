'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Section, Spinner } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { formatMonthYear } from '@/lib/format';
import type { Profile, WorkExperience } from '@/lib/types';

type Draft = {
  company: string;
  title: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

const EMPTY: Draft = {
  company: '',
  title: '',
  location: '',
  description: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
};

/** `<input type="date">` needs YYYY-MM-DD; the API returns a full ISO string. */
function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

export function ExperienceEditor({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkExperience | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const onSaved = (updated: Profile) => {
    queryClient.setQueryData(['profile'], updated);
    setOpen(false);
    setError(null);
  };

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        company: draft.company,
        title: draft.title,
        location: draft.location || undefined,
        description: draft.description || undefined,
        startDate: draft.startDate,
        endDate: draft.isCurrent || !draft.endDate ? undefined : draft.endDate,
        isCurrent: draft.isCurrent,
      };
      return editing
        ? api.updateExperience(editing.id, payload)
        : api.addExperience(payload);
    },
    onSuccess: onSaved,
    onError: (err) =>
      setError(err instanceof Error ? err.message : 'Could not save.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.deleteExperience(id),
    onSuccess: (updated) => queryClient.setQueryData(['profile'], updated),
  });

  const openNew = () => {
    setEditing(null);
    setDraft(EMPTY);
    setError(null);
    setOpen(true);
  };

  const openEdit = (experience: WorkExperience) => {
    setEditing(experience);
    setDraft({
      company: experience.company,
      title: experience.title,
      location: experience.location ?? '',
      description: experience.description ?? '',
      startDate: toDateInput(experience.startDate),
      endDate: toDateInput(experience.endDate),
      isCurrent: experience.isCurrent,
    });
    setError(null);
    setOpen(true);
  };

  return (
    <Section
      title="Work experience"
      action={
        <button type="button" onClick={openNew} className="btn-ghost px-2 py-1">
          <Plus size={15} />
          Add
        </button>
      }
    >
      {profile.experiences.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No experience added yet. Recruiters search this, so it&apos;s worth
          filling in.
        </p>
      ) : (
        <ol className="space-y-5">
          {profile.experiences.map((experience) => (
            <li key={experience.id} className="group flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-line-strong" />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {experience.title}
                    </p>
                    <p className="text-sm text-ink-muted">
                      {experience.company}
                      {experience.location ? ` · ${experience.location}` : ''}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      {formatMonthYear(experience.startDate)} —{' '}
                      {experience.isCurrent
                        ? 'Present'
                        : formatMonthYear(experience.endDate)}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit(experience)}
                      aria-label="Edit experience"
                      className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-hover hover:text-ink"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove.mutate(experience.id)}
                      aria-label="Delete experience"
                      className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-hover hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {experience.description ? (
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                    {experience.description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit experience' : 'Add experience'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={
                save.isPending ||
                !draft.company.trim() ||
                !draft.title.trim() ||
                !draft.startDate
              }
              onClick={() => save.mutate()}
            >
              {save.isPending ? (
                <Spinner className="border-white/40 border-t-white" />
              ) : null}
              Save
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="exp-title">
                Title
              </label>
              <input
                id="exp-title"
                className="input"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="exp-company">
                Company
              </label>
              <input
                id="exp-company"
                className="input"
                value={draft.company}
                onChange={(e) => setDraft({ ...draft, company: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="exp-location">
              Location
            </label>
            <input
              id="exp-location"
              className="input"
              placeholder="Bengaluru, India"
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="exp-start">
                Start date
              </label>
              <input
                id="exp-start"
                type="date"
                className="input"
                value={draft.startDate}
                onChange={(e) =>
                  setDraft({ ...draft, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label" htmlFor="exp-end">
                End date
              </label>
              <input
                id="exp-end"
                type="date"
                className="input"
                disabled={draft.isCurrent}
                value={draft.endDate}
                onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line-strong text-brand focus:ring-brand"
              checked={draft.isCurrent}
              onChange={(e) =>
                setDraft({ ...draft, isCurrent: e.target.checked, endDate: '' })
              }
            />
            I currently work here
          </label>

          <div>
            <label className="label" htmlFor="exp-description">
              Description
            </label>
            <textarea
              id="exp-description"
              className="input min-h-[110px] resize-y"
              placeholder="What did you own? Quantify the impact where you can."
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </Modal>
    </Section>
  );
}
