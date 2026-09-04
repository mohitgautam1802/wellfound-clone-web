'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Section, Spinner } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import type { Education, Profile } from '@/lib/types';

type Draft = {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  description: string;
};

const EMPTY: Draft = {
  school: '',
  degree: '',
  fieldOfStudy: '',
  startYear: '',
  endYear: '',
  description: '',
};

export function EducationEditor({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        school: draft.school,
        degree: draft.degree || undefined,
        fieldOfStudy: draft.fieldOfStudy || undefined,
        // Empty year inputs must be omitted, not sent as NaN.
        startYear: draft.startYear ? Number(draft.startYear) : undefined,
        endYear: draft.endYear ? Number(draft.endYear) : undefined,
        description: draft.description || undefined,
      };
      return editing
        ? api.updateEducation(editing.id, payload)
        : api.addEducation(payload);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      setOpen(false);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.deleteEducation(id),
    onSuccess: (updated) => queryClient.setQueryData(['profile'], updated),
  });

  return (
    <Section
      title="Education"
      action={
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setDraft(EMPTY);
            setOpen(true);
          }}
          className="btn-ghost px-2 py-1"
        >
          <Plus size={15} />
          Add
        </button>
      }
    >
      {profile.educations.length === 0 ? (
        <p className="text-sm text-ink-muted">No education added yet.</p>
      ) : (
        <ul className="space-y-4">
          {profile.educations.map((education) => (
            <li key={education.id} className="group flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">
                  {education.school}
                </p>
                <p className="text-sm text-ink-muted">
                  {[education.degree, education.fieldOfStudy]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {education.startYear || education.endYear ? (
                  <p className="mt-0.5 text-xs text-ink-subtle">
                    {education.startYear ?? '?'} — {education.endYear ?? 'Present'}
                  </p>
                ) : null}
                {education.description ? (
                  <p className="mt-1 text-sm text-ink-muted">
                    {education.description}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Edit education"
                  onClick={() => {
                    setEditing(education);
                    setDraft({
                      school: education.school,
                      degree: education.degree ?? '',
                      fieldOfStudy: education.fieldOfStudy ?? '',
                      startYear: education.startYear?.toString() ?? '',
                      endYear: education.endYear?.toString() ?? '',
                      description: education.description ?? '',
                    });
                    setOpen(true);
                  }}
                  className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-hover hover:text-ink"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Delete education"
                  onClick={() => remove.mutate(education.id)}
                  className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-hover hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit education' : 'Add education'}
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
              disabled={save.isPending || !draft.school.trim()}
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
          <div>
            <label className="label" htmlFor="edu-school">
              School
            </label>
            <input
              id="edu-school"
              className="input"
              value={draft.school}
              onChange={(e) => setDraft({ ...draft, school: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="edu-degree">
                Degree
              </label>
              <input
                id="edu-degree"
                className="input"
                placeholder="B.Tech"
                value={draft.degree}
                onChange={(e) => setDraft({ ...draft, degree: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="edu-field">
                Field of study
              </label>
              <input
                id="edu-field"
                className="input"
                placeholder="Computer Science"
                value={draft.fieldOfStudy}
                onChange={(e) =>
                  setDraft({ ...draft, fieldOfStudy: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="edu-start">
                Start year
              </label>
              <input
                id="edu-start"
                type="number"
                min={1950}
                max={2100}
                className="input"
                value={draft.startYear}
                onChange={(e) =>
                  setDraft({ ...draft, startYear: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label" htmlFor="edu-end">
                End year
              </label>
              <input
                id="edu-end"
                type="number"
                min={1950}
                max={2100}
                className="input"
                value={draft.endYear}
                onChange={(e) => setDraft({ ...draft, endYear: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="edu-description">
              Description
            </label>
            <textarea
              id="edu-description"
              className="input min-h-[80px] resize-y"
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>
    </Section>
  );
}
