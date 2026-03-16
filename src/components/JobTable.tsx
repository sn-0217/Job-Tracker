import { motion } from "framer-motion";
import { MoreHorizontal, ExternalLink, Star } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { PulseIndicator } from "./PulseIndicator";
import type { JobApplication } from "@/types/job";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobTableProps {
  applications: JobApplication[];
  onSelect: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
}

const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return "—";
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  return fmt(min || max!);
};

export function JobTable({ applications, onSelect, onDelete, onArchive }: JobTableProps) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24">
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">No applications yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground/70">
            Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-mono">⌘ N</kbd> to track your first application
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 grid grid-cols-[1fr_120px_100px_100px_40px] items-center border-b border-border bg-background px-6 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Role / Company
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Status
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Date
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Comp
        </span>
        <span />
      </div>

      {/* Rows */}
      {applications.map((app, i) => (
        <motion.div
          key={app.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: i * 0.03 }}
          onClick={() => onSelect(app)}
          className="group grid h-12 cursor-pointer grid-cols-[1fr_120px_100px_100px_40px] items-center border-b border-muted/40 px-6 transition-colors hover:bg-muted/30"
        >
          {/* Role / Company */}
          <div className="flex items-center gap-3 overflow-hidden pr-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-[11px] font-semibold uppercase text-muted-foreground">
              {app.company.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[13px] font-medium text-foreground">{app.jobTitle}</p>
                {app.jobPostingUrl && (
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[12px] text-muted-foreground">{app.company}</p>
                {app.workLocation && (
                  <span className="text-[11px] text-muted-foreground/60">· {app.workLocation}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-0.5 pl-2">
              {Array.from({ length: app.priority }, (_, j) => (
                <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <StatusBadge status={app.status} />
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 tabular-nums text-[13px] text-muted-foreground">
            <PulseIndicator lastActivityDate={app.dateUpdated} />
            {formatDate(app.dateApplied)}
          </div>

          {/* Salary */}
          <div className="tabular-nums text-[13px] text-muted-foreground">
            {formatSalary(app.salaryMin, app.salaryMax)}
          </div>

          {/* Actions */}
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-7 w-7 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onArchive(app.id, !app.archived)}>
                  {app.archived ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(app.id)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
