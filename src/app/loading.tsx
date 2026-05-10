export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border border-border/50 bg-background/80 p-8 text-center shadow-sm backdrop-blur">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">Loading Soul Space</p>
          <p className="text-sm text-muted-foreground">
            Preparing your next view.
          </p>
        </div>
      </div>
    </div>
  );
}