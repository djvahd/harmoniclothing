import Logo from "./Logo";

export default function AuthCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)",
      }}
    >
      <div className="flex w-full max-w-[420px] flex-col gap-5 rounded-lg border border-border bg-surface p-8 shadow-[0_4px_16px_0_rgba(0,0,0,0.15)]">
        <Logo />
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{title}</h1>
        {children}
      </div>
    </div>
  );
}
