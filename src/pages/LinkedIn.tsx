import { LinkedInDrawer } from "@/components/LinkedInDrawer";
import { LinkedInTable } from "@/components/LinkedInTable";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "@/components/AppLayout";
import type { LinkedInPost } from "@/types/linkedinPost";
import { Linkedin, Plus } from "lucide-react";
import { useState } from "react";

export default function LinkedIn() {
  const { linkedInStore: store } = useOutletContext<AppOutletContext>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<LinkedInPost | null>(null);

  const handleAddNew = () => {
    setEditingPost(null);
    setDrawerOpen(true);
  };

  return (
    <div className="flex h-full flex-col bg-background relative">
      <header className="flex flex-col border-b border-border bg-card/60 backdrop-blur-md z-30 sticky top-0">
        <div className="flex sm:h-14 flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-0">
          <h1 className="text-lg font-semibold text-foreground mr-auto shrink-0">LinkedIn Posts</h1>
          <button
            onClick={handleAddNew}
            className="btn-glow flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            <Linkedin className="h-3.5 w-3.5" />
            Save Post
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto relative flex flex-col">
        <LinkedInTable
          posts={store.posts}
          isLoading={store.isLoading}
          onSelect={(p) => { setEditingPost(p); setDrawerOpen(true); }}
          onDelete={store.deletePost}
          onMarkDone={(id, done) => store.updatePost(id, { done })}
          onAddNew={handleAddNew}
        />
      </main>

      <LinkedInDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        post={editingPost}
        onSave={store.addPost}
        onUpdate={store.updatePost}
      />
    </div>
  );
}
