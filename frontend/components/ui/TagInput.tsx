"use client";

import { useState } from "react";
import { X } from "lucide-react";

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

/** Free-text tag editor (Enter/comma to add, Backspace to remove last); caps at MAX_TAGS entries of MAX_TAG_LENGTH chars. */
export default function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().slice(0, MAX_TAG_LENGTH);
    if (!tag || value.length >= MAX_TAGS) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function handleBlur() {
    if (draft.trim()) {
      addTag(draft);
      setDraft("");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-xs font-medium text-text-secondary">
        Tag ({value.length}/{MAX_TAGS})
      </label>
      <div className="flex flex-wrap items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 font-body text-xs font-medium text-accent"
          >
            {tag}
            <button
              type="button"
              aria-label={`Hapus tag ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="rounded-full text-accent/70 hover:text-accent"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {value.length < MAX_TAGS && (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={value.length === 0 ? "Ketik tag lalu Enter (misal: anime, kucing)" : "Tambah tag..."}
            className="min-w-[120px] flex-1 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
          />
        )}
      </div>
    </div>
  );
}
