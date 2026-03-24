import { useAuth } from "@/components/AuthProvider";
import type { ApplicationStatus } from "@/types/job";
import { Archive, BarChart3, Bell, Briefcase, Link, Linkedin, LogOut, Mail, Plus, Search, X } from "lucide-react";
import { useRef, useState } from "react";

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
  onAddFromUrl: (url: string) => void;
  stats: {
    total: number;
    applied: number;
    interviewing: number;
    offers: number;
    followUpsDue: number;       // jobs
    networkingDue: number;
    linkedInDue: number;
  };
  activeSection: "jobs" | "networking" | "posts";
  setActiveSection: (s: "jobs" | "networking" | "posts") => void;
}

type NavTab = {
  key: ApplicationStatus | "all" | "__archived__" | "__analytics__" | "__networking__" | "__posts__";
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
  onAddFromUrl,
  stats,
  activeSection,
  setActiveSection,
}: TopNavProps) {
  const { signOut } = useAuth();
  const [urlPopoverOpen, setUrlPopoverOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const urlInputRef = useRef<HTMLInputElement>(null);

  const totalDue = stats.followUpsDue + stats.networkingDue + stats.linkedInDue;

  const tabs: NavTab[] = [
    { key: "all",             label: "All",        count: stats.total },
    { key: "applied",         label: "Applied",    count: stats.applied },
    { key: "interviewing",    label: "Interviews", count: stats.interviewing },
    { key: "offer",           label: "Offers",     count: stats.offers },
    { key: "__archived__",    label: "Archived" },
    { key: "__analytics__",   label: "Analytics" },
    { key: "__networking__",  label: "Networking" },
    { key: "__posts__",       label: "Posts" },
  ];

  const activeTab =
    activeSection === "networking"
      ? "__networking__"
      : activeSection === "posts"
      ? "__posts__"
      : showAnalytics
      ? "__analytics__"
      : showArchived
      ? "__archived__"
      : statusFilter;

  function handleTab(key: typeof tabs[number]["key"]) {
    if (key === "__analytics__") {
      setActiveSection("jobs");
      onShowAnalytics();
    } else if (key === "__archived__") {
      setActiveSection("jobs");
      setShowArchived(true);
      setStatusFilter("all");
    } else if (key === "__networking__") {
      setActiveSection("networking");
      setShowArchived(false);
    } else if (key === "__posts__") {
      setActiveSection("posts");
      setShowArchived(false);
    } else {
      setActiveSection("jobs");
      setShowArchived(false);
      setStatusFilter(key as ApplicationStatus | "all");
    }
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onAddFromUrl(trimmed);
    setUrlInput("");
    setUrlPopoverOpen(false);
  }

  return (
    <header className="flex flex-col border-b border-border bg-card/60 backdrop-blur-md z-30 sticky top-0">
      {/* Top row: logo | search | actions */}
      <div className="flex sm:h-14 flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-display text-[14px] tracking-tight text-foreground">The Hunt</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Follow-up badge — combined */}
        {totalDue > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1">
            <Bell className="h-3 w-3 text-amber-400" />
            <span className="text-[12px] font-medium text-amber-300">
              {totalDue} due
            </span>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <input
            className="h-9 w-full sm:w-64 max-w-[200px] sm:max-w-none rounded-xl border border-border bg-muted/40 pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/40 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 sm:focus:w-72"
            placeholder="Search roles, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* URL import button */}
        <div className="relative">
          <button
            onClick={() => {
              setUrlPopoverOpen((v) => !v);
              setTimeout(() => urlInputRef.current?.focus(), 50);
            }}
            title="Import from job URL"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary active:scale-[0.97]"
          >
            <Link className="h-4 w-4" />
          </button>

          {/* URL popover */}
          {urlPopoverOpen && (
            <form
              onSubmit={handleUrlSubmit}
              className="absolute right-0 top-11 z-50 flex w-[340px] items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-2xl shadow-black/40"
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              <input
                ref={urlInputRef}
                type="url"
                className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none"
                placeholder="Paste job URL (LinkedIn, Workday…)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => { setUrlPopoverOpen(false); setUrlInput(""); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-primary/90"
              >
                Import
              </button>
            </form>
          )}
        </div>

        {/* Section-aware add button */}
        {activeSection === "networking" ? (
          <button
            onClick={onAddNew}
            className="btn-glow flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            <Mail className="h-3.5 w-3.5" />
            Add Contact
          </button>
        ) : activeSection === "posts" ? (
          <button
            onClick={onAddNew}
            className="btn-glow flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            <Linkedin className="h-3.5 w-3.5" />
            Save Post
          </button>
        ) : (
          <button
            onClick={onAddNew}
            className="btn-glow flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            <Plus className="h-3.5 w-3.5" />
            Track Job
          </button>
        )}

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
      <div className="flex items-center gap-0.5 px-3 sm:px-5 pb-0 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isAnalytics  = tab.key === "__analytics__";
          const isArchived   = tab.key === "__archived__";
          const isNetworking = tab.key === "__networking__";
          const isPosts      = tab.key === "__posts__";
          return (
            <button
              key={tab.key}
              onClick={() => handleTab(tab.key)}
              className={`relative flex items-center gap-1.5 rounded-t-lg px-3.5 py-2.5 text-[13px] font-medium transition-all duration-150 whitespace-nowrap shrink-0 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isAnalytics  && <BarChart3 className="h-3.5 w-3.5" />}
              {isArchived   && <Archive   className="h-3.5 w-3.5" />}
              {isNetworking && <Mail      className="h-3.5 w-3.5" />}
              {isPosts      && <Linkedin  className="h-3.5 w-3.5" />}
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
