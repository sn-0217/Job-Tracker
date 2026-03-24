import { useAuth } from "@/components/AuthProvider";
import type { ApplicationStatus } from "@/types/job";
import { Archive, Briefcase, Link, Plus, Search, X } from "lucide-react";
import { useRef, useState } from "react";

interface JobsTopNavProps {
  statusFilter: ApplicationStatus | "all";
  setStatusFilter: (s: ApplicationStatus | "all") => void;
  showArchived: boolean;
  setShowArchived: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddNew: () => void;
  onAddFromUrl: (url: string) => void;
  stats: {
    total: number;
    applied: number;
    interviewing: number;
    offers: number;
  };
}

type NavTab = {
  key: ApplicationStatus | "all" | "__archived__";
  label: string;
  count?: number;
};

export function JobsTopNav({
  statusFilter,
  setStatusFilter,
  showArchived,
  setShowArchived,
  searchQuery,
  setSearchQuery,
  onAddNew,
  onAddFromUrl,
  stats,
}: JobsTopNavProps) {
  const [urlPopoverOpen, setUrlPopoverOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const urlInputRef = useRef<HTMLInputElement>(null);

  const tabs: NavTab[] = [
    { key: "all",             label: "All",        count: stats.total },
    { key: "applied",         label: "Applied",    count: stats.applied },
    { key: "interviewing",    label: "Interviews", count: stats.interviewing },
    { key: "offer",           label: "Offers",     count: stats.offers },
    { key: "__archived__",    label: "Archived" },
  ];

  const activeTab = showArchived ? "__archived__" : statusFilter;

  function handleTab(key: typeof tabs[number]["key"]) {
    if (key === "__archived__") {
      setShowArchived(true);
      setStatusFilter("all");
    } else {
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
    <header className="flex flex-col border-b border-border bg-card/60 backdrop-blur-md z-30 sticky top-0 pb-1 sm:pb-0">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:h-14 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-0">
        <h1 className="mr-auto shrink-0 text-lg font-semibold text-foreground">Applications</h1>

        {/* Action Buttons (Top Right on Mobile) */}
        <div className="flex items-center gap-2 sm:order-last">
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
                className="absolute right-0 top-11 z-50 flex w-[300px] sm:w-[340px] items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-2xl shadow-black/40"
              >
                <Search className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                <input
                  ref={urlInputRef}
                  type="url"
                  className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none min-w-0"
                  placeholder="Paste URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-primary/90"
                >
                  Import
                </button>
              </form>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={onAddNew}
            className="btn-glow flex h-9 items-center gap-2 rounded-xl bg-primary px-3 sm:px-4 text-[13px] font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Track Job</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full order-last mt-1 sm:mt-0 sm:w-auto sm:order-none pointer-events-auto">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <input
            className="h-9 w-full sm:w-64 rounded-xl border border-border bg-muted/40 pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/40 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 sm:focus:w-72"
            placeholder="Search roles, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tab row */}
      <div className="flex items-center gap-0.5 px-3 sm:px-5 pb-0 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isArchived   = tab.key === "__archived__";

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
              {isArchived && <Archive className="h-3.5 w-3.5" />}
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
