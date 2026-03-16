import { STATUS_CONFIG, type ApplicationStatus } from "@/types/job";

const statusStyles: Record<string, { dot: string; text: string; bg: string }> = {
  "status-saved":        { dot: "bg-zinc-500",    text: "text-zinc-400",    bg: "bg-zinc-500/10"    },
  "status-applied":      { dot: "bg-indigo-500",  text: "text-indigo-400",  bg: "bg-indigo-500/10"  },
  "status-interviewing": { dot: "bg-violet-500",  text: "text-violet-400",  bg: "bg-violet-500/10"  },
  "status-offer":        { dot: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  "status-rejected":     { dot: "bg-zinc-600",    text: "text-zinc-500",    bg: "bg-zinc-500/10"    },
};

export function StatusBadge({ status }: { status: string }) {
  // Defensive: unknown/old statuses fall back gracefully
  const config = STATUS_CONFIG[status as ApplicationStatus];
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-500/10 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
        {status}
      </span>
    );
  }
  const style = statusStyles[config.color] ?? statusStyles["status-saved"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      {config.label}
    </span>
  );
}
