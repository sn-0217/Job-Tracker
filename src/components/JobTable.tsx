import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { JobApplication, JobSource } from "@/types/job";
import { isPast, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { ExternalLink, Mail, MapPin, MoreHorizontal } from "lucide-react";
import { PulseIndicator } from "./PulseIndicator";
import { StatusBadge } from "./StatusBadge";

interface JobTableProps {
  applications: JobApplication[];
  onSelect: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" });

/** Format salary in Indian system: ₹8.0L / ₹8–13L */
function formatSalaryIN(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => {
    if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)}Cr`;
    if (n >= 1_00_000)    return `${(n / 1_00_000).toFixed(1)}L`;
    return `${(n / 1000).toFixed(0)}K`;
  };
  if (min && max) return `₹${fmt(min)}–${fmt(max)}`;
  return `₹${fmt(min || max!)}`;
}

const SOURCE_LABELS: Partial<Record<JobSource, string>> = {
  linkedin:       "LI",
  glassdoor:      "GD",
  indeed:         "IN",
  referral:       "Ref",
  "company-site": "CS",
  other:          "—",
};

const LOCATION_CHIP: Record<string, string> = {
  remote:  "bg-emerald-500/10 text-emerald-400",
  hybrid:  "bg-amber-400/10 text-amber-400",
  onsite:  "bg-sky-400/10 text-sky-400",
};

/** Deterministic avatar color from company name */
function avatarColor(name: string) {
  const palette = [
    "bg-indigo-500/20 text-indigo-300",
    "bg-violet-500/20 text-violet-300",
    "bg-sky-500/20    text-sky-300",
    "bg-emerald-500/20 text-emerald-300",
    "bg-amber-500/20  text-amber-300",
    "bg-rose-500/20   text-rose-300",
    "bg-pink-500/20   text-pink-300",
    "bg-teal-500/20   text-teal-300",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

const HEADERS = ["Role / Company", "Status", "Date", "CTC", "Type", ""];

export function JobTable({ applications, onSelect, onDelete, onArchive }: JobTableProps) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/50 px-16 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <svg className="h-6 w-6 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-foreground">No applications yet</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Press{" "}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-mono">Ctrl N</kbd>
              {" "}or click <span className="text-primary font-medium">Track Job</span> to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 grid grid-cols-[1fr_130px_84px_110px_90px_40px] items-center border-b border-border bg-background/95 px-6 py-2.5 backdrop-blur-sm min-w-[800px]">
        {HEADERS.map((h) => (
          <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {applications.map((app, i) => {
        const ctc    = formatSalaryIN(app.salaryMin, app.salaryMax);
        const locCls = app.workLocation ? (LOCATION_CHIP[app.workLocation] ?? "") : "";
        const isOverdue = app.followUpDate && isPast(parseISO(app.followUpDate)) && !["rejected", "offer"].includes(app.status);

        return (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: i * 0.02 }}
            onClick={() => onSelect(app)}
            className={`group grid cursor-pointer grid-cols-[1fr_130px_84px_110px_90px_40px] items-center border-b px-6 py-3 transition-all duration-100 min-w-[800px] ${
              isOverdue 
                ? "bg-amber-500/[0.03] hover:bg-amber-500/[0.08] border-border/40 shadow-[inset_2px_0_0_#f59e0b]" 
                : "border-border/40 hover:bg-white/[0.025]"
            }`}
          >
            {/* Company + role */}
            <div className="flex items-center gap-3 overflow-hidden pr-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold uppercase tracking-wide ${avatarColor(app.company)}`}>
                {app.company.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-semibold text-foreground">{app.jobTitle}</p>
                  {app.jobPostingUrl && (
                    <a
                      href={app.jobPostingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <p className="truncate text-[12px] text-muted-foreground">{app.company}</p>
                  {app.officeLocation && (
                    <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground/40">
                      <MapPin className="h-2.5 w-2.5" />
                      {app.officeLocation}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div><StatusBadge status={app.status} /></div>

            {/* Date */}
            <div className="flex items-center gap-1.5 text-[12px] tabular-nums text-muted-foreground relative">
              <PulseIndicator lastActivityDate={app.dateUpdated} />
              {formatDate(app.dateApplied)}
              {app.followUpDate && isPast(parseISO(app.followUpDate)) && !["rejected", "offer"].includes(app.status) && (
                <div title={`Follow-up was due on ${formatDate(app.followUpDate)}`} className="absolute -left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              )}
            </div>

            {/* CTC */}
            <div className="text-[12px] tabular-nums text-muted-foreground">
              {ctc ?? <span className="text-muted-foreground/25">—</span>}
            </div>

            {/* Work location */}
            <div>
              {app.workLocation ? (
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${locCls}`}>
                  {app.workLocation.charAt(0).toUpperCase() + app.workLocation.slice(1)}
                </span>
              ) : app.jobSource ? (
                <span className="inline-flex items-center rounded-md border border-border/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {SOURCE_LABELS[app.jobSource] ?? app.jobSource}
                </span>
              ) : null}
            </div>

            {/* Actions */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-white/8 hover:text-foreground group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onSelect(app)}>Edit</DropdownMenuItem>
                  {app.companyEmail && (
                    <DropdownMenuItem
                      onClick={() => {
                        const subject = encodeURIComponent(`Checking in: Application for ${app.jobTitle} at ${app.company}`);
                        const body = encodeURIComponent(`Hi there,\n\nI hope this email finds you well.\n\nI recently applied for the ${app.jobTitle} position at ${app.company} and wanted to reiterate my interest in the role. Please let me know if there's any additional information I can provide to support my application.\n\nBest regards,\n[Your Name]`);
                        window.open(`mailto:${app.companyEmail}?subject=${subject}&body=${body}`, "_blank");
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Draft Follow-up</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onArchive(app.id, !app.archived)}>
                    {app.archived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
        );
      })}
    </div>
  );
}
