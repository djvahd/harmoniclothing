export default function DetailPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] animate-pulse flex-col gap-8 px-4 py-10 md:px-20">
      <div className="h-4 w-64 rounded-sm bg-border" />
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="h-[460px] w-full shrink-0 rounded-md bg-border md:w-[480px]" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-5 w-24 rounded-full bg-border" />
          <div className="h-8 w-3/4 rounded-sm bg-border" />
          <div className="h-4 w-40 rounded-sm bg-border" />
          <div className="h-9 w-full rounded-sm bg-border" />
          <div className="h-11 w-full rounded-sm bg-border" />
          <div className="h-11 w-full rounded-sm bg-border" />
        </div>
      </div>
    </div>
  );
}
