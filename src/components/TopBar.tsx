import { Search, Plus } from "lucide-react";

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddNew: () => void;
  followUpsDue: number;
}

export function TopBar({ searchQuery, setSearchQuery, onAddNew, followUpsDue }: TopBarProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-4">
        {followUpsDue > 0 && (
          <p className="font-display text-sm text-foreground">
            You have <span className="text-primary">{followUpsDue} follow-up{followUpsDue > 1 ? "s" : ""}</span> due today.
          </p>
        )}
        {followUpsDue === 0 && (
          <p className="text-[13px] text-muted-foreground">Your job search command center</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-8 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-[13px] transition-all focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary"
            placeholder="Search roles, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={onAddNew}
          className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Track Application
        </button>
      </div>
    </div>
  );
}
