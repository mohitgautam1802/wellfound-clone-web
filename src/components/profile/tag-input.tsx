'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** Optional click-to-add suggestions shown beneath the field. */
  suggestions?: string[];
  id?: string;
}

/** Chip editor for free-text lists: skills, desired roles, markets. */
export function TagInput({
  value,
  onChange,
  placeholder,
  suggestions,
  id,
}: TagInputProps) {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    // Case-insensitive dedupe so "React" and "react" cannot both be added.
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

  const unusedSuggestions = (suggestions ?? []).filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line-strong bg-white p-2 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
        {value.map((tag) => (
          <span key={tag} className="chip bg-brand-soft text-brand">
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Remove ${tag}`}
              className="hover:text-ink"
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <input
          id={id}
          className="min-w-[140px] flex-1 bg-transparent px-1 py-0.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
          placeholder={value.length === 0 ? placeholder : 'Add another…'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && value.length > 0) {
              // Backspace on an empty field removes the last chip.
              remove(value[value.length - 1]);
            }
          }}
          onBlur={() => add(draft)}
        />
      </div>

      {unusedSuggestions.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {unusedSuggestions.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="chip border border-dashed border-line-strong text-ink-muted hover:bg-surface-hover"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
