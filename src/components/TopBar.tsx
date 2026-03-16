import { Bell, Plus, Search } from "lucide-react";

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddNew: () => void;
  followUpsDue: number;
}

export function TopBar({ searchQuery, setSearchQuery, onAddNew, followUpsDue }: TopBarProps) {
  return (
    <div className="flex h-[52px] items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur-sm">
      {/* Left: title / follow-up message */}
      <div className="flex items-center gap-3">
        {followUpsDue > 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
            <Bell className="h-3 w-3 text-amber-400" />
            <p className="text-[12px] font-medium text-amber-300">
              {followUpsDue} follow-up{followUpsDue > 1 ? "s" : ""} due
            </p>
          </div>
        ) : (
          <p className="text-[13px] font-medium text-muted-foreground">Your job search command center</p>
        )}
      </div>

      {/* Right: search + add */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <input
            className="h-8 w-60 rounded-lg border border-border bg-muted/50 pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Search roles, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={onAddNew}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          Track Job
        </button>
      </div>
    </div>
  );
}
