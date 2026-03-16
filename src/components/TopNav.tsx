import { useAuth } from "@/components/AuthProvider";
import type { ApplicationStatus } from "@/types/job";
import { Archive, BarChart3, Bell, Briefcase, LogOut, Plus, Search } from "lucide-react";

interface TopNavProps {
  statusFilter: ApplicationStatus | "all";
  setStatusFilter: (s: ApplicationStatus | "all") => void;
  showArchived: boolean;
  setShowArchived: (v: boolean) => void;
  showAnalytics: boolean;
  onShowAnalytics: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddNew: () => void;
  stats: {
    total: number;
    applied: number;
    interviewing: number;
    offers: number;
    followUpsDue: number;
  };
}

type NavTab = {
  key: ApplicationStatus | "all" | "__archived__" | "__analytics__";
  label: string;
  count?: number;
};

export function TopNav({
  statusFilter,
  setStatusFilter,
  showArchived,
  setShowArchived,
  showAnalytics,
  onShowAnalytics,
  searchQuery,
  setSearchQuery,
  onAddNew,
  stats,
}: TopNavProps) {
  const { signOut } = useAuth();

  const tabs: NavTab[] = [
    { key: "all",           label: "All",        count: stats.total },
    { key: "applied",       label: "Applied",    count: stats.applied },
    { key: "interviewing",  label: "Interviews", count: stats.interviewing },
    { key: "offer",         label: "Offers",     count: stats.offers },
    { key: "__archived__",  label: "Archived" },
    { key: "__analytics__", label: "Analytics" },
  ];

  const activeTab = showAnalytics
    ? "__analytics__"
    : showArchived
    ? "__archived__"
    : statusFilter;

  function handleTab(key: typeof tabs[number]["key"]) {
    if (key === "__analytics__") {
      onShowAnalytics();
    } else if (key === "__archived__") {
      setShowArchived(true);
      setStatusFilter("all");
    } else {
      setShowArchived(false);
      setStatusFilter(key as ApplicationStatus | "all");
    }
  }

  return (
    <header className="flex flex-col border-b border-border bg-card/60 backdrop-blur-md z-30 sticky top-0">
      {/* Top row: logo | search | actions */}
      <div className="flex h-14 items-center gap-4 px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-display text-[14px] tracking-tight text-foreground">The Hunt</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Follow-up badge */}
        {stats.followUpsDue > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1">
            <Bell className="h-3 w-3 text-amber-400" />
            <span className="text-[12px] font-medium text-amber-300">
              {stats.followUpsDue} due
            </span>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <input
            className="h-9 w-64 rounded-xl border border-border bg-muted/40 pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/40 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:w-72"
            placeholder="Search roles, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Add */}
        <button
          onClick={onAddNew}
          className="btn-glow flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.97]"
        >
          <Plus className="h-3.5 w-3.5" />
          Track Job
        </button>

        {/* Logout */}
        <button
          onClick={() => signOut()}
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400 active:scale-[0.97]"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Tab row */}
      <div className="flex items-center gap-0.5 px-5 pb-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isAnalytics = tab.key === "__analytics__";
          const isArchived  = tab.key === "__archived__";
          return (
            <button
              key={tab.key}
              onClick={() => handleTab(tab.key)}
              className={`relative flex items-center gap-1.5 rounded-t-lg px-3.5 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isAnalytics && <BarChart3 className="h-3.5 w-3.5" />}
              {isArchived  && <Archive className="h-3.5 w-3.5" />}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {/* Active underline */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
