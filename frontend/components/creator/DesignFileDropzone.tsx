"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { designFileError } from "@/lib/design-file";

/** Keyboard-reachable PNG/SVG picker with local type/size validation; the error shows right under the dropzone. */
export default function DesignFileDropzone({
  file,
  onChange,
  hint,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  hint?: string;
}) {
  const t = useTranslations("creator.uploadDesign");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview of the chosen file; the object URL is released when the file changes or the page closes.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    const errorKey = picked ? designFileError(picked) : null;
    if (errorKey) {
      setError(t(errorKey));
      onChange(null);
      e.target.value = "";
      return;
    }
    setError(null);
    onChange(picked);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-sm border border-dashed border-border py-6 text-center focus-within:ring-2 focus-within:ring-primary">
        <Upload className="size-5 text-text-secondary" />
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={t("previewAlt")} className="max-h-40 rounded-sm bg-white object-contain" />
        )}
        <span className="font-body text-xs text-text-secondary">{file ? file.name : t("fileDropzone")}</span>
        <input
          type="file"
          accept="image/png,image/svg+xml"
          className="sr-only"
          aria-describedby={error ? "design-file-error" : undefined}
          onChange={handleChange}
        />
      </label>
      {hint && !error && <p className="font-body text-xs text-text-secondary">{hint}</p>}
      {error && (
        <p id="design-file-error" role="alert" className="font-body text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
