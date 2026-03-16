import { useState, useCallback, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { JobTable } from "@/components/JobTable";
import { ApplicationDrawer } from "@/components/ApplicationDrawer";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useJobStore } from "@/store/useJobStore";
import type { JobApplication } from "@/types/job";

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
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
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
        stats={store.stats}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {showAnalytics ? (
          <AnalyticsDashboard
            applications={store.allApplications}
            onClose={() => setShowAnalytics(false)}
          />
        ) : (
          <>
            <TopBar
              searchQuery={store.searchQuery}
              setSearchQuery={store.setSearchQuery}
              onAddNew={handleAddNew}
              followUpsDue={store.stats.followUpsDue}
            />
            <JobTable
              applications={store.applications}
              onSelect={handleSelect}
              onDelete={store.deleteApplication}
              onArchive={handleArchive}
            />
          </>
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
