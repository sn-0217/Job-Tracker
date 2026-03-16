import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ApplicationDrawer } from "@/components/ApplicationDrawer";
import { JobTable } from "@/components/JobTable";
import { TopNav } from "@/components/TopNav";
import { useJobStore } from "@/store/useJobStore";
import type { JobApplication } from "@/types/job";
import { useCallback, useEffect, useState } from "react";

const Index = () => {
  const store = useJobStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleAddNew = useCallback(() => {
    setEditingApp(null);
    setDrawerOpen(true);
  }, []);

  const handleSelect = useCallback((app: JobApplication) => {
    setEditingApp(app);
    setDrawerOpen(true);
  }, []);

  const handleArchive = useCallback(
    (id: string, archived: boolean) => {
      store.updateApplication(id, { archived });
    },
    [store]
  );

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
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top Navigation */}
      <TopNav
        statusFilter={store.statusFilter}
        setStatusFilter={(s) => {
          store.setStatusFilter(s);
          setShowAnalytics(false);
        }}
        showArchived={store.showArchived}
        setShowArchived={(v) => {
          store.setShowArchived(v);
          setShowAnalytics(false);
        }}
        showAnalytics={showAnalytics}
        onShowAnalytics={() => setShowAnalytics(true)}
        searchQuery={store.searchQuery}
        setSearchQuery={store.setSearchQuery}
        onAddNew={handleAddNew}
        stats={store.stats}
      />

      {/* Main content area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {store.isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-[13px] text-muted-foreground animate-pulse">Loading applications...</p>
          </div>
        ) : showAnalytics ? (
          <AnalyticsDashboard
            applications={store.allApplications}
            onClose={() => setShowAnalytics(false)}
          />
        ) : (
          <JobTable
            applications={store.applications}
            onSelect={handleSelect}
            onDelete={store.deleteApplication}
            onArchive={handleArchive}
          />
        )}
      </main>

      <ApplicationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        application={editingApp}
        onSave={store.addApplication}
        onUpdate={store.updateApplication}
      />
    </div>
  );
};

export default Index;
