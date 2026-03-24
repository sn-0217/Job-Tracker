import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useJobStore } from "@/store/useJobStore";
import { useNetworkingStore } from "@/store/useNetworkingStore";
import { useLinkedInStore } from "@/store/useLinkedInStore";

export type AppOutletContext = {
  jobStore: ReturnType<typeof useJobStore>;
  networkingStore: ReturnType<typeof useNetworkingStore>;
  linkedInStore: ReturnType<typeof useLinkedInStore>;
};

export function AppLayout() {
  const jobStore = useJobStore();
  const networkingStore = useNetworkingStore();
  const linkedInStore = useLinkedInStore();

  return (
    <div className="flex h-screen flex-col-reverse sm:flex-row overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden relative">
        <Outlet context={{ jobStore, networkingStore, linkedInStore } satisfies AppOutletContext} />
      </main>
    </div>
  );
}
