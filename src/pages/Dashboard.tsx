import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "@/components/AppLayout";

export default function Dashboard() {
  const { jobStore: store, networkingStore: networking, linkedInStore: linkedIn } = useOutletContext<AppOutletContext>();

  const isLoading = store.isLoading || networking.isLoading || linkedIn.isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center space-y-4 py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-[13px] text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background relative">
      <AnalyticsDashboard 
        applications={store.allApplications} 
        networkingContacts={networking.contacts}
        linkedInPosts={linkedIn.posts}
      />
    </div>
  );
}
