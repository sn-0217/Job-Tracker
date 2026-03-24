import { ApplicationDrawer } from "@/components/ApplicationDrawer";
import { JobBoard } from "@/components/JobBoard";
import { JobTable } from "@/components/JobTable";
import { JobsTopNav } from "@/components/JobsTopNav";
import { parseJobUrl } from "@/lib/urlParser";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "@/components/AppLayout";
import type { JobApplication } from "@/types/job";
import { LayoutGrid, List } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function Jobs() {
  const { jobStore: store } = useOutletContext<AppOutletContext>();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [urlInitData, setUrlInitData] = useState<Partial<JobApplication> | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

  const handleAddNew = useCallback(() => {
    setEditingApp(null);
    setUrlInitData(undefined);
    setDrawerOpen(true);
  }, []);

  const handleSelect = useCallback((app: JobApplication) => {
    setEditingApp(app);
    setUrlInitData(undefined);
    setDrawerOpen(true);
  }, []);

  const handleArchive = useCallback(
    (id: string, archived: boolean) => store.updateApplication(id, { archived }),
    [store]
  );

  const handleAddFromUrl = useCallback((url: string) => {
    const parsed = parseJobUrl(url);
    setEditingApp(null);
    setUrlInitData(parsed);
    setDrawerOpen(true);
  }, []);

  // Keyboard shortcut Ctrl+N
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleAddNew();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAddNew]);

  return (
    <div className="flex h-full flex-col bg-background relative border-t-0">
      <JobsTopNav
        statusFilter={store.statusFilter}
        setStatusFilter={(s) => store.setStatusFilter(s)}
        showArchived={store.showArchived}
        setShowArchived={(v) => store.setShowArchived(v)}
        searchQuery={store.searchQuery}
        setSearchQuery={store.setSearchQuery}
        onAddNew={handleAddNew}
        onAddFromUrl={handleAddFromUrl}
        stats={{
          total: store.stats.total,
          applied: store.stats.applied,
          interviewing: store.stats.interviewing,
          offers: store.stats.offers,
        }}
      />

      <div className="flex items-center justify-between border-b border-border bg-card/30 px-6 py-2">
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border/50">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              viewMode === "list"
                ? "bg-background text-primary shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            LIST
          </button>
          <button
            onClick={() => setViewMode("board")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              viewMode === "board"
                ? "bg-background text-primary shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            BOARD
          </button>
        </div>

        <div className="text-[11px] text-muted-foreground/50 font-medium italic">
          {store.applications.length} applications found
        </div>
      </div>

      <main className="flex-1 overflow-auto relative flex flex-col">
        {store.isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-[13px] text-muted-foreground animate-pulse">Loading applications...</p>
          </div>
        ) : viewMode === "list" ? (
          <JobTable
            applications={store.applications}
            onSelect={handleSelect}
            onDelete={store.deleteApplication}
            onArchive={handleArchive}
          />
        ) : (
          <JobBoard
            applications={store.applications}
            onSelect={handleSelect}
            onDelete={store.deleteApplication}
            onArchive={handleArchive}
            onUpdateStatus={(id, status) => store.updateApplication(id, { status })}
          />
        )}
      </main>

      <ApplicationDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setUrlInitData(undefined); }}
        application={editingApp}
        initialData={urlInitData}
        onSave={store.addApplication}
        onUpdate={store.updateApplication}
      />
    </div>
  );
}
