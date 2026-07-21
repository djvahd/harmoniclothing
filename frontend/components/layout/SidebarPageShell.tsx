export default function SidebarPageShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:flex-row md:px-20">
      <aside className="md:sticky md:top-8 md:self-start">{sidebar}</aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
