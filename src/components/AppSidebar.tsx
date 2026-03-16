import { Briefcase, Archive, Gift, Star, Filter } from "lucide-react";
import type { ApplicationStatus } from "@/types/job";

interface SidebarProps {
  statusFilter: ApplicationStatus | "all";
  setStatusFilter: (s: ApplicationStatus | "all") => void;
  showArchived: boolean;
  setShowArchived: (v: boolean) => void;
  stats: {
    total: number;
    applied: number;
    interviewing: number;
    offers: number;
    followUpsDue: number;
  };
}

const navItems: { key: ApplicationStatus | "all"; label: string; icon: typeof Briefcase }[] = [
  { key: "all", label: "All Active", icon: Briefcase },
  { key: "applied", label: "Applied", icon: Filter },
  { key: "interviewing", label: "Interviewing", icon: Star },
  { key: "offer", label: "Offers", icon: Gift },
];

export function AppSidebar({
  statusFilter,
  setStatusFilter,
  showArchived,
  setShowArchived,
  stats,
}: SidebarProps) {
  const counts: Record<string, number> = {
    all: stats.total,
    applied: stats.applied,
    interviewing: stats.interviewing,
    offer: stats.offers,
  };

  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <Briefcase className="h-5 w-5 text-primary" />
        <span className="font-display text-base text-foreground">The Hunt</span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Pipeline
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = !showArchived && statusFilter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setShowArchived(false);
                setStatusFilter(item.key);
              }}
              className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-interface transition-colors ${
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              <span className="tabular-nums text-[12px] text-muted-foreground">
                {counts[item.key] ?? 0}
              </span>
            </button>
          );
        })}

        <div className="my-4 border-t border-border" />

        <button
          onClick={() => {
            setShowArchived(true);
            setStatusFilter("all");
          }}
          className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-interface transition-colors ${
            showArchived
              ? "bg-accent text-accent-foreground font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
        >
          <Archive className="h-4 w-4" />
          <span className="flex-1 text-left">Archived</span>
        </button>
      </nav>

      {stats.followUpsDue > 0 && (
        <div className="mx-3 mb-4 rounded-md border border-pulse-warning/30 bg-amber-50 p-3">
          <p className="text-[12px] font-medium text-amber-800">
            {stats.followUpsDue} follow-up{stats.followUpsDue > 1 ? "s" : ""} due
          </p>
          <p className="text-[11px] text-amber-600">Check your pipeline</p>
        </div>
      )}
    </aside>
  );
}
