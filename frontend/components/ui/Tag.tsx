export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border px-[10px] py-1 font-body text-xs font-medium text-text-secondary">
      {children}
    </span>
  );
}
