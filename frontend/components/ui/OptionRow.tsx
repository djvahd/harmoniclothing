import clsx from "clsx";

interface OptionRowProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  sublabel?: string;
  price?: string;
}

export default function OptionRow({ selected, onSelect, label, sublabel, price }: OptionRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "flex w-full items-center gap-3 rounded-sm border px-4 py-3 text-left",
        selected ? "border-accent bg-accent/5" : "border-border",
      )}
    >
      <span
        className={clsx(
          "size-4 shrink-0 rounded-full border-2",
          selected ? "border-accent bg-accent" : "border-border",
        )}
      />
      <span className="flex flex-1 flex-col">
        <span className="font-body text-sm font-semibold text-text-primary">{label}</span>
        {sublabel && <span className="font-body text-xs text-text-secondary">{sublabel}</span>}
      </span>
      {price && <span className="font-body text-sm font-semibold text-text-primary">{price}</span>}
    </button>
  );
}
