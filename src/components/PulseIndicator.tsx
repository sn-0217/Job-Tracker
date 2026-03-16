interface PulseIndicatorProps {
  lastActivityDate: string;
}

export function PulseIndicator({ lastActivityDate }: PulseIndicatorProps) {
  const now = new Date();
  const last = new Date(lastActivityDate);
  const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince <= 3) return null;

  const isStale = daysSince > 7;

  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${isStale ? "bg-pulse-stale" : "bg-pulse-warning"}`}
      title={`${daysSince} days since last activity`}
    />
  );
}
