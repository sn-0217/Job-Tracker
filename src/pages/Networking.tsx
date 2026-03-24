import { NetworkingDrawer } from "@/components/NetworkingDrawer";
import { NetworkingTable } from "@/components/NetworkingTable";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "@/components/AppLayout";
import type { NetworkingContact } from "@/types/networking";
import { Mail, Plus } from "lucide-react";
import { useState } from "react";

export default function Networking() {
  const { networkingStore: store } = useOutletContext<AppOutletContext>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<NetworkingContact | null>(null);

  const handleAddNew = () => {
    setEditingContact(null);
    setDrawerOpen(true);
  };

  return (
    <div className="flex h-full flex-col bg-background relative">
      <header className="flex flex-col border-b border-border bg-card/60 backdrop-blur-md z-30 sticky top-0">
        <div className="flex sm:h-14 flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-0">
          <h1 className="text-lg font-semibold text-foreground mr-auto shrink-0">Networking</h1>
          <button
            onClick={handleAddNew}
            className="btn-glow flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            <Mail className="h-3.5 w-3.5" />
            Add Contact
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto relative flex flex-col">
        <NetworkingTable
          contacts={store.contacts}
          isLoading={store.isLoading}
          onSelect={(c) => { setEditingContact(c); setDrawerOpen(true); }}
          onDelete={store.deleteContact}
          onMarkDone={(id, done) => store.updateContact(id, { done })}
          onAddNew={handleAddNew}
        />
      </main>

      <NetworkingDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        contact={editingContact}
        onSave={store.addContact}
        onUpdate={store.updateContact}
      />
    </div>
  );
}
