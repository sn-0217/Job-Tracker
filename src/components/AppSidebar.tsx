import { Briefcase, Archive, BarChart3, Gift, Star, Filter, Bell } from "lucide-react";
import type { ApplicationStatus } from "@/types/job";

interface SidebarProps {
  statusFilter: ApplicationStatus | "all";
  setStatusFilter: (s: ApplicationStatus | "all") => void;
  showArchived: boolean;
  setShowArchived: (v: boolean) => void;
  showAnalytics: boolean;
  onShowAnalytics: () => void;
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

function NavCount({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-white/8 px-1.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
      {count}
    </span>
  );
}

export function AppSidebar({
  statusFilter,
  setStatusFilter,
  showArchived,
  setShowArchived,
  showAnalytics,
  onShowAnalytics,
  stats,
}: SidebarProps) {
  const counts: Record<string, number> = {
    all: stats.total,
    applied: stats.applied,
    interviewing: stats.interviewing,
    offer: stats.offers,
  };

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-[52px] items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
          <Briefcase className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="font-display text-[13px] tracking-tight text-foreground">The Hunt</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
        {/* Pipeline section */}
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
          Pipeline
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = !showArchived && !showAnalytics && statusFilter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setShowArchived(false);
                setStatusFilter(item.key);
              }}
              className={`group flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[13px] transition-all duration-150 ${
                active
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              <NavCount count={counts[item.key] ?? 0} />
            </button>
          );
        })}

        <div className="my-2 border-t border-border/60" />

        <button
          onClick={() => {
            setShowArchived(true);
            setStatusFilter("all");
          }}
          className={`group flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[13px] transition-all duration-150 ${
            showArchived
              ? "bg-primary/15 text-primary font-medium"
              : "text-sidebar-foreground hover:bg-white/5 hover:text-foreground"
          }`}
        >
          <Archive
            className={`h-3.5 w-3.5 shrink-0 ${
              showArchived ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            }`}
          />
          <span className="flex-1 text-left">Archived</span>
        </button>

        <button
          onClick={onShowAnalytics}
          className={`group flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[13px] transition-all duration-150 ${
            showAnalytics
              ? "bg-primary/15 text-primary font-medium"
              : "text-sidebar-foreground hover:bg-white/5 hover:text-foreground"
          }`}
        >
          <BarChart3
            className={`h-3.5 w-3.5 shrink-0 ${
              showAnalytics ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            }`}
          />
          <span className="flex-1 text-left">Analytics</span>
        </button>
      </nav>

      {/* Follow-up alert */}
      {stats.followUpsDue > 0 && (
        <div className="mx-2 mb-3 flex items-start gap-2.5 rounded-md border border-amber-500/20 bg-amber-500/10 p-3">
          <Bell className="mt-px h-3.5 w-3.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-[12px] font-semibold text-amber-300">
              {stats.followUpsDue} follow-up{stats.followUpsDue > 1 ? "s" : ""} due
            </p>
            <p className="text-[11px] text-amber-400/70">Check your pipeline</p>
          </div>
        </div>
      )}
    </aside>
  );
}
