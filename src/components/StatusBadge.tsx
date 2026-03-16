import { STATUS_CONFIG, type ApplicationStatus } from "@/types/job";

const statusColorMap: Record<string, string> = {
  "status-wishlist": "bg-muted/60 text-muted-foreground ring-muted-foreground/20",
  "status-applied": "bg-primary/10 text-primary ring-primary/20",
  "status-reviewing": "bg-blue-50 text-blue-500 ring-blue-500/20",
  "status-phone-screen": "bg-violet-50 text-violet-600 ring-violet-600/20",
  "status-interviewing": "bg-violet-50 text-violet-600 ring-violet-600/20",
  "status-offer": "bg-emerald-50 text-emerald-600 ring-emerald-600/20",
  "status-rejected": "bg-muted/60 text-muted-foreground ring-muted-foreground/20",
  "status-ghosted": "bg-amber-50 text-amber-600 ring-amber-600/20",
  "status-withdrawn": "bg-muted/60 text-muted-foreground ring-muted-foreground/20",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = STATUS_CONFIG[status];
  const colorClass = statusColorMap[config.color] || statusColorMap["status-wishlist"];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ring-1 ring-inset ${colorClass}`}
    >
      {config.label}
    </span>
  );
}
