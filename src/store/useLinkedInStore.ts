import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { LinkedInPost } from "@/types/linkedinPost";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function fromDb(d: any): LinkedInPost {
  return {
    id: d.id,
    postUrl: d.post_url,
    posterName: d.poster_name ?? undefined,
    company: d.company ?? undefined,
    context: d.context ?? undefined,
    notes: d.notes ?? undefined,
    followUpDate: d.follow_up_date ?? undefined,
    done: d.done,
    createdAt: d.created_at,
  };
}

function toDb(p: Partial<LinkedInPost>) {
  const r: any = {};
  if (p.postUrl !== undefined)      r.post_url       = p.postUrl;
  if (p.posterName !== undefined)   r.poster_name    = p.posterName;
  if (p.company !== undefined)      r.company        = p.company;
  if (p.context !== undefined)      r.context        = p.context;
  if (p.notes !== undefined)        r.notes          = p.notes;
  if (p.followUpDate !== undefined) r.follow_up_date = p.followUpDate;
  if (p.done !== undefined)         r.done           = p.done;
  Object.keys(r).forEach((k) => r[k] === undefined && delete r[k]);
  return r;
}

export function useLinkedInStore() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!user) { setPosts([]); setIsLoading(false); return; }
      setIsLoading(true);
      const { data, error } = await supabase
        .from("linkedin_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching LinkedIn posts:", error);
        toast.error("Failed to load LinkedIn posts");
      } else if (data) {
        setPosts(data.map(fromDb));
      }
      setIsLoading(false);
    }
    fetch();
  }, [user]);

  const addPost = useCallback(
    async (p: Omit<LinkedInPost, "id" | "createdAt">) => {
      const tempId = crypto.randomUUID();
      const tempPost: LinkedInPost = {
        ...p,
        id: tempId,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [tempPost, ...prev]);

      const { data, error } = await supabase
        .from("linkedin_posts")
        .insert([{ ...toDb(p), user_id: user?.id }])
        .select()
        .single();

      if (error) {
        toast.error("Failed to add post");
        setPosts((prev) => prev.filter((x) => x.id !== tempId));
      } else if (data) {
        setPosts((prev) =>
          prev.map((x) => (x.id === tempId ? fromDb(data) : x))
        );
        toast.success("Post saved");
      }
    },
    [user]
  );

  const updatePost = useCallback(
    async (id: string, updates: Partial<LinkedInPost>) => {
      setPosts((prev) =>
        prev.map((x) => (x.id === id ? { ...x, ...updates } : x))
      );
      const { error } = await supabase
        .from("linkedin_posts")
        .update(toDb(updates))
        .eq("id", id);
      if (error) {
        toast.error("Failed to update post");
      } else {
        toast.success("Saved");
      }
    },
    []
  );

  const deletePost = useCallback(
    async (id: string) => {
      const snapshot = posts;
      setPosts((prev) => prev.filter((x) => x.id !== id));
      const { error } = await supabase
        .from("linkedin_posts")
        .delete()
        .eq("id", id);
      if (error) {
        toast.error("Failed to delete post");
        setPosts(snapshot);
      } else {
        toast.success("Post deleted");
      }
    },
    [posts]
  );

  const overdueDueCount = useMemo(() => {
    const now = new Date();
    return posts.filter((p) => {
      if (p.done) return false;
      if (!p.followUpDate) return false;
      return new Date(p.followUpDate) <= now;
    }).length;
  }, [posts]);

  return {
    posts,
    isLoading,
    addPost,
    updatePost,
    deletePost,
    overdueDueCount,
  };
}
