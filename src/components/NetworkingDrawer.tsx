import type { NetworkingContact } from "@/types/networking";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";

interface NetworkingDrawerProps {
  open: boolean;
  onClose: () => void;
  contact?: NetworkingContact | null;
  onSave: (data: Omit<NetworkingContact, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<NetworkingContact>) => void;
}

const today = () => new Date().toISOString().split("T")[0];
const plusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const defaultForm = (): Omit<NetworkingContact, "id" | "createdAt"> => ({
  name: "",
  company: "",
  email: "",
  context: "",
  emailLink: "",
  dateSent: today(),
  followUpDate: plusDays(7),
  done: false,
});

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/55">
      {children}
    </p>
  );
}

export function NetworkingDrawer({
  open,
  onClose,
  contact,
  onSave,
  onUpdate,
}: NetworkingDrawerProps) {
  const [form, setForm] = useState(defaultForm());
  const isEdit = !!contact;

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name,
        company: contact.company ?? "",
        email: contact.email ?? "",
        context: contact.context ?? "",
        emailLink: contact.emailLink ?? "",
        dateSent: contact.dateSent?.split("T")[0] ?? today(),
        followUpDate: contact.followUpDate?.split("T")[0] ?? plusDays(7),
        done: contact.done,
      });
    } else {
      setForm(defaultForm());
    }
  }, [contact, open]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const payload = {
      ...form,
      company: form.company || undefined,
      email: form.email || undefined,
      context: form.context || undefined,
      emailLink: form.emailLink || undefined,
      followUpDate: form.followUpDate || undefined,
    };
    if (isEdit && contact) {
      onUpdate(contact.id, payload);
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
                  {isEdit ? "Edit Contact" : "Add Networking Contact"}
                </h2>
                {isEdit && contact && (
                  <p className="text-[11px] text-muted-foreground">
                    {contact.name}{contact.company ? ` · ${contact.company}` : ""}
                  </p>
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

                {/* Contact Info */}
                <section className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <SectionLabel>Contact Info</SectionLabel>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Name *</label>
                        <input
                          className={inputClass}
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          placeholder="Jane Smith"
                          required
                          autoFocus={!isEdit}
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
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        className={inputClass}
                        value={form.email ?? ""}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="jane@google.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Context / Subject</label>
                      <input
                        className={inputClass}
                        value={form.context ?? ""}
                        onChange={(e) => set("context", e.target.value)}
                        placeholder="Reached out about SWE role, referral request..."
                      />
                    </div>
                  </div>
                </section>

                {/* Gmail Link */}
                <section className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <SectionLabel>Email Link</SectionLabel>
                  <div>
                    <label className={labelClass}>Gmail / Email URL</label>
                    <div className="relative">
                      <input
                        type="url"
                        className={inputClass}
                        value={form.emailLink ?? ""}
                        onChange={(e) => set("emailLink", e.target.value)}
                        placeholder="https://mail.google.com/mail/u/0/#sent/..."
                      />
                      {form.emailLink && (
                        <a
                          href={form.emailLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground/50">
                      Paste the Gmail link to the sent email so you can jump back to it later.
                    </p>
                  </div>
                </section>

                {/* Timeline */}
                <section className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <SectionLabel>Timeline</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Date Sent</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={form.dateSent}
                        onChange={(e) => set("dateSent", e.target.value)}
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
                    {isEdit ? "Save Changes" : "Add Contact"}
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
