import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ApplicationDrawer } from "@/components/ApplicationDrawer";
import { JobBoard } from "@/components/JobBoard";
import { JobTable } from "@/components/JobTable";
import { LinkedInDrawer } from "@/components/LinkedInDrawer";
import { LinkedInTable } from "@/components/LinkedInTable";
import { NetworkingDrawer } from "@/components/NetworkingDrawer";
import { NetworkingTable } from "@/components/NetworkingTable";
import { TopNav } from "@/components/TopNav";
import { parseJobUrl } from "@/lib/urlParser";
import { useJobStore } from "@/store/useJobStore";
import { useLinkedInStore } from "@/store/useLinkedInStore";
import { useNetworkingStore } from "@/store/useNetworkingStore";
import type { JobApplication } from "@/types/job";
import type { LinkedInPost } from "@/types/linkedinPost";
import type { NetworkingContact } from "@/types/networking";
import { LayoutGrid, List } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const Index = () => {
  const store = useJobStore();
  const networking = useNetworkingStore();
  const linkedIn = useLinkedInStore();

  // ── Active section ────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<"jobs" | "networking" | "posts">("jobs");

  // ── Job application drawer ─────────────────────────────────────────
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [editingApp, setEditingApp]     = useState<JobApplication | null>(null);
  const [urlInitData, setUrlInitData]   = useState<Partial<JobApplication> | undefined>(undefined);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [viewMode, setViewMode]         = useState<"list" | "board">("list");

  // ── Networking drawer ──────────────────────────────────────────────
  const [netDrawerOpen, setNetDrawerOpen]   = useState(false);
  const [editingContact, setEditingContact] = useState<NetworkingContact | null>(null);

  // ── LinkedIn drawer ────────────────────────────────────────────────
  const [liDrawerOpen, setLiDrawerOpen] = useState(false);
  const [editingPost, setEditingPost]   = useState<LinkedInPost | null>(null);

  // ── Handlers: Jobs ─────────────────────────────────────────────────
  const handleAddNew = useCallback(() => {
    if (activeSection === "networking") {
      setEditingContact(null);
      setNetDrawerOpen(true);
    } else if (activeSection === "posts") {
      setEditingPost(null);
      setLiDrawerOpen(true);
    } else {
      setEditingApp(null);
      setUrlInitData(undefined);
      setDrawerOpen(true);
    }
  }, [activeSection]);

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
    setActiveSection("jobs");
    setDrawerOpen(true);
  }, []);

  // ── Keyboard shortcut Ctrl+N ───────────────────────────────────────
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
        onAddFromUrl={handleAddFromUrl}
        stats={{
          total: store.stats.total,
          applied: store.stats.applied,
          interviewing: store.stats.interviewing,
          offers: store.stats.offers,
          followUpsDue: store.stats.followUpsDue,
          networkingDue: networking.overdueDueCount,
          linkedInDue: linkedIn.overdueDueCount,
        }}
        activeSection={activeSection}
        setActiveSection={(s) => {
          setActiveSection(s);
          if (s !== "jobs") setShowAnalytics(false);
        }}
      />

      {/* View Toggle Bar (Jobs section only, not analytics) */}
      {activeSection === "jobs" && !showAnalytics && (
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
      )}

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* ── Networking section ── */}
        {activeSection === "networking" && (
          <NetworkingTable
            contacts={networking.contacts}
            isLoading={networking.isLoading}
            onSelect={(c) => { setEditingContact(c); setNetDrawerOpen(true); }}
            onDelete={networking.deleteContact}
            onMarkDone={(id, done) => networking.updateContact(id, { done })}
            onAddNew={() => { setEditingContact(null); setNetDrawerOpen(true); }}
          />
        )}

        {/* ── LinkedIn posts section ── */}
        {activeSection === "posts" && (
          <LinkedInTable
            posts={linkedIn.posts}
            isLoading={linkedIn.isLoading}
            onSelect={(p) => { setEditingPost(p); setLiDrawerOpen(true); }}
            onDelete={linkedIn.deletePost}
            onMarkDone={(id, done) => linkedIn.updatePost(id, { done })}
            onAddNew={() => { setEditingPost(null); setLiDrawerOpen(true); }}
          />
        )}

        {/* ── Jobs section ── */}
        {activeSection === "jobs" && (
          store.isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center space-y-4 py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-[13px] text-muted-foreground animate-pulse">Loading applications...</p>
            </div>
          ) : showAnalytics ? (
            <AnalyticsDashboard
              applications={store.allApplications}
              onClose={() => setShowAnalytics(false)}
            />
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
          )
        )}
      </main>

      {/* ── Drawers ── */}
      <ApplicationDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setUrlInitData(undefined); }}
        application={editingApp}
        initialData={urlInitData}
        onSave={store.addApplication}
        onUpdate={store.updateApplication}
      />

      <NetworkingDrawer
        open={netDrawerOpen}
        onClose={() => setNetDrawerOpen(false)}
        contact={editingContact}
        onSave={networking.addContact}
        onUpdate={networking.updateContact}
      />

      <LinkedInDrawer
        open={liDrawerOpen}
        onClose={() => setLiDrawerOpen(false)}
        post={editingPost}
        onSave={linkedIn.addPost}
        onUpdate={linkedIn.updatePost}
      />
    </div>
  );
};

export default Index;
