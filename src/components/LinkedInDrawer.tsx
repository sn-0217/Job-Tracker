import type { LinkedInPost } from "@/types/linkedinPost";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";
import { parseEmailData } from "@/lib/emailParser";

interface LinkedInDrawerProps {
  open: boolean;
  onClose: () => void;
  post?: LinkedInPost | null;
  onSave: (data: Omit<LinkedInPost, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<LinkedInPost>) => void;
}

const plusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const defaultForm = (): Omit<LinkedInPost, "id" | "createdAt"> => ({
  postUrl: "",
  posterName: "",
  company: "",
  email: "",
  context: "",
  notes: "",
  followUpDate: plusDays(3),
  done: false,
});

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/55">
      {children}
    </p>
  );
}

export function LinkedInDrawer({
  open,
  onClose,
  post,
  onSave,
  onUpdate,
}: LinkedInDrawerProps) {
  const [form, setForm] = useState(defaultForm());
  const isEdit = !!post;

  useEffect(() => {
    if (post) {
      setForm({
        postUrl: post.postUrl,
        posterName: post.posterName ?? "",
        company: post.company ?? "",
        email: post.email ?? "",
        context: post.context ?? "",
        notes: post.notes ?? "",
        followUpDate: post.followUpDate?.split("T")[0] ?? plusDays(3),
        done: post.done,
      });
    } else {
      setForm(defaultForm());
    }
  }, [post, open]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const parsed = parseEmailData(val);
    if (!parsed) return;
    
    setForm((prev) => ({
      ...prev,
      posterName: prev.posterName || parsed.name,
      company: prev.company || parsed.company,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.postUrl) return;
    const payload = {
      ...form,
      posterName: form.posterName || undefined,
      company: form.company || undefined,
      email: form.email || undefined,
      context: form.context || undefined,
      notes: form.notes || undefined,
      followUpDate: form.followUpDate || undefined,
    };
    if (isEdit && post) {
      onUpdate(post.id, payload);
    } else {
      onSave(payload);
    }
    onClose();
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/35 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15";
  const labelClass = "block text-[11px] font-medium text-muted-foreground/70 mb-1.5";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[460px] flex-col border-l border-border bg-card shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
              <div>
                <h2 className="text-[14px] font-semibold text-foreground">
                  {isEdit ? "Edit LinkedIn Post" : "Save LinkedIn Post"}
                </h2>
                {isEdit && post?.posterName && (
                  <p className="text-[11px] text-muted-foreground">{post.posterName}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-4 px-5 py-4">

                {/* Post Link */}
                <section className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <SectionLabel>LinkedIn Post</SectionLabel>
                  <div>
                    <label className={labelClass}>Post URL *</label>
                    <div className="relative">
                      <input
                        type="url"
                        className={inputClass}
                        value={form.postUrl}
                        onChange={(e) => set("postUrl", e.target.value)}
                        placeholder="https://www.linkedin.com/posts/..."
                        required
                        autoFocus={!isEdit}
                      />
                      {form.postUrl && (
                        <a
                          href={form.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </section>

                {/* Poster Info */}
                <section className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <SectionLabel>Poster Info</SectionLabel>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Poster Name</label>
                        <input
                          className={inputClass}
                          value={form.posterName ?? ""}
                          onChange={(e) => set("posterName", e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Company</label>
                        <input
                          className={inputClass}
                          value={form.company ?? ""}
                          onChange={(e) => set("company", e.target.value)}
                          placeholder="Google"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input
                        type="email"
                        className={inputClass}
                        value={form.email ?? ""}
                        onChange={(e) => set("email", e.target.value)}
                        onBlur={handleEmailBlur}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Why is this relevant?</label>
                      <input
                        className={inputClass}
                        value={form.context ?? ""}
                        onChange={(e) => set("context", e.target.value)}
                        placeholder="Hiring manager posting about openings, referral opportunity..."
                      />
                    </div>
                  </div>
                </section>

                {/* Notes & Timeline */}
                <section className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <SectionLabel>Notes & Follow-up</SectionLabel>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Notes</label>
                      <textarea
                        className={`${inputClass} min-h-[70px] resize-y`}
                        value={form.notes ?? ""}
                        onChange={(e) => set("notes", e.target.value)}
                        placeholder="Mutual connection, key details, what action to take..."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Follow-up Date</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={form.followUpDate ?? ""}
                        onChange={(e) => set("followUpDate", e.target.value || undefined)}
                      />
                    </div>
                  </div>
                </section>

                {/* Done toggle (edit only) */}
                {isEdit && (
                  <section className="rounded-xl border border-border/50 bg-background/50 p-4">
                    <SectionLabel>Status</SectionLabel>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.done}
                        onChange={(e) => set("done", e.target.checked)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      <span className="text-[13px] text-foreground">Mark as done (clears follow-up reminder)</span>
                    </label>
                  </section>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-border bg-card px-5 py-4">
                <div className="flex gap-2.5">
                  <button
                    type="submit"
                    className="btn-glow flex-1 rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.98]"
                  >
                    {isEdit ? "Save Changes" : "Save Post"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-border px-5 py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
