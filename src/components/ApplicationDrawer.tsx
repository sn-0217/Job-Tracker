import type {
    ApplicationStatus,
    EmploymentType,
    JobApplication,
    JobSource,
    Priority,
    WorkLocation,
} from "@/types/job";
import { EMPLOYMENT_TYPES, JOB_SOURCES, STATUS_CONFIG, WORK_LOCATIONS } from "@/types/job";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parseEmailData } from "@/lib/emailParser";
import { StatusBadge } from "./StatusBadge";

interface ApplicationDrawerProps {
  open: boolean;
  onClose: () => void;
  application?: JobApplication | null;
  /** Pre-populate the form when opening from a pasted URL */
  initialData?: Partial<JobApplication>;
  onSave: (data: Omit<JobApplication, "id" | "dateUpdated">) => void;
  onUpdate: (id: string, data: Partial<JobApplication>) => void;
}

// ── Indian number formatting helpers ─────────────────────────────────────────

/** Format a number in Indian locale: 8,00,000 */
function toIndianString(n: number | undefined): string {
  if (n === undefined || n === null || isNaN(n)) return "";
  // Use Indian locale grouping
  return n.toLocaleString("en-IN");
}

/** Parse an Indian-formatted string back to a plain number */
function parseIndian(s: string): number | undefined {
  const stripped = s.replace(/,/g, "").trim();
  if (!stripped) return undefined;
  const n = Number(stripped);
  return isNaN(n) ? undefined : n;
}

// ── Salary input with live Indian comma formatting ────────────────────────────

function SalaryInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  placeholder?: string;
}) {
  const [display, setDisplay] = useState(toIndianString(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync when value changes from outside (e.g. reset)
  useEffect(() => {
    setDisplay(toIndianString(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow only digits and commas
    const raw = e.target.value.replace(/[^\d,]/g, "");
    // Strip all commas, reformat
    const digits = raw.replace(/,/g, "");
    if (digits === "") {
      setDisplay("");
      onChange(undefined);
      return;
    }
    const num = Number(digits);
    if (!isNaN(num)) {
      const formatted = num.toLocaleString("en-IN");
      setDisplay(formatted);
      onChange(num);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-muted/40 py-2 pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/35 tabular-nums transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15";

  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] font-medium text-muted-foreground/50">
        ₹
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        className={inputClass}
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}

// ── Smart defaults ─────────────────────────────────────────────────────────────

const defaultForm = (): Omit<JobApplication, "id" | "dateUpdated"> => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return {
    jobTitle: "",
    company: "",
    status: "applied",
    dateApplied: today.toISOString().split("T")[0],
    followUpDate: nextWeek.toISOString().split("T")[0],
    priority: 3 as Priority,
    archived: false,
    jobSource: "linkedin",
    employmentType: "full-time",
    workLocation: "remote",
    salaryMin: 800000,
    salaryMax: 1300000,
  };
};

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/55">
      {children}
    </p>
  );
}

// ── Main Drawer ────────────────────────────────────────────────────────────────

export function ApplicationDrawer({ open, onClose, application, initialData, onSave, onUpdate }: ApplicationDrawerProps) {
  const [form, setForm] = useState(defaultForm());
  const isEdit = !!application;

  useEffect(() => {
    if (application) {
      setForm({
        ...application,
        dateApplied: application.dateApplied.split("T")[0],
        followUpDate: application.followUpDate?.split("T")[0],
      });
    } else if (initialData) {
      setForm({ ...defaultForm(), ...initialData });
    } else {
      setForm(defaultForm());
    }
  }, [application, initialData, open]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const parsed = parseEmailData(val);
    if (!parsed) return;
    
    setForm((prev) => ({
      ...prev,
      company: prev.company || parsed.company,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.jobTitle || !form.company) return;
    if (isEdit && application) {
      onUpdate(application.id, form);
    } else {
      onSave({
        ...form,
        dateApplied: new Date(form.dateApplied).toISOString(),
        followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : undefined,
      });
    }
    onClose();
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/35 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15";
  const labelClass = "block text-[11px] font-medium text-muted-foreground/70 mb-1.5";
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  const handleDraftEmail = () => {
    if (!form.companyEmail) return;
    const subject = encodeURIComponent(`Checking in: Application for ${form.jobTitle} at ${form.company}`);
    const body = encodeURIComponent(`Hi there,\n\nI hope this email finds you well.\n\nI recently applied for the ${form.jobTitle} position at ${form.company} and wanted to reiterate my interest in the role. Please let me know if there's any additional information I can provide to support my application.\n\nBest regards,\n[Your Name]`);
    window.open(`mailto:${form.companyEmail}?subject=${subject}&body=${body}`, "_blank");
  };

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
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[500px] flex-col border-l border-border bg-card shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
              <div>
                <h2 className="text-[14px] font-semibold text-foreground">
                  {isEdit ? "Edit Application" : "Track Application"}
                </h2>
                {isEdit && application && (
                  <p className="text-[11px] text-muted-foreground">
                    {application.jobTitle} · {application.company}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isEdit && form.companyEmail && (
                  <button
                    onClick={handleDraftEmail}
                    title="Draft Follow-up Email"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable form */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-4 px-5 py-4">

                {/* ── Role Details ── */}
                <section className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <SectionLabel>Role Details</SectionLabel>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Job Title *</label>
                        <input
                          className={inputClass}
                          value={form.jobTitle}
                          onChange={(e) => set("jobTitle", e.target.value)}
                          placeholder="Software Engineer"
                          required
                          autoFocus={!isEdit}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Company *</label>
                        <input
                          className={inputClass}
                          value={form.company}
                          onChange={(e) => set("company", e.target.value)}
                          placeholder="Google"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Job Posting URL</label>
                        <input
                          className={inputClass}
                          value={form.jobPostingUrl ?? ""}
                          onChange={(e) => set("jobPostingUrl", e.target.value || undefined)}
                          placeholder="https://..."
                          type="url"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Company/Recruiter Email</label>
                        <input
                          className={inputClass}
                          value={form.companyEmail ?? ""}
                          onChange={(e) => set("companyEmail", e.target.value || undefined)}
                          onBlur={handleEmailBlur}
                          placeholder="hr@company.com"
                          type="email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Source</label>
                        <select
                          className={selectClass}
                          value={form.jobSource ?? ""}
                          onChange={(e) => set("jobSource", (e.target.value || undefined) as JobSource)}
                        >
                          <option value="">None</option>
                          {JOB_SOURCES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Location</label>
                        <select
                          className={selectClass}
                          value={form.workLocation ?? ""}
                          onChange={(e) => set("workLocation", (e.target.value || undefined) as WorkLocation)}
                        >
                          <option value="">None</option>
                          {WORK_LOCATIONS.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Type</label>
                        <select
                          className={selectClass}
                          value={form.employmentType ?? ""}
                          onChange={(e) => set("employmentType", (e.target.value || undefined) as EmploymentType)}
                        >
                          <option value="">None</option>
                          {EMPLOYMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Office Location</label>
                      <input
                        className={inputClass}
                        value={form.officeLocation ?? ""}
                        onChange={(e) => set("officeLocation", e.target.value || undefined)}
                        placeholder="Bangalore, Karnataka"
                      />
                    </div>
                  </div>
                </section>

                {/* ── Status & Timeline ── */}
                <section className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <SectionLabel>Status &amp; Timeline</SectionLabel>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Status</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => set("status", s)}
                            className={`transition-all duration-100 ${
                              form.status === s
                                ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-card scale-105"
                                : "opacity-50 hover:opacity-90"
                            }`}
                          >
                            <StatusBadge status={s} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Date Applied</label>
                        <input
                          type="date"
                          className={inputClass}
                          value={form.dateApplied}
                          onChange={(e) => set("dateApplied", e.target.value)}
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

                    <div>
                      <label className={labelClass}>Priority</label>
                      <div className="flex gap-1.5">
                        {([1, 2, 3, 4, 5] as Priority[]).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => set("priority", p)}
                            className={`h-8 w-8 rounded-lg text-sm transition-all ${
                              form.priority >= p
                                ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30"
                                : "bg-muted/50 text-muted-foreground/30 hover:text-muted-foreground"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── Compensation (₹ Indian) ── */}
                <section className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <SectionLabel>Compensation (₹ per annum)</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Min Salary</label>
                      <SalaryInput
                        value={form.salaryMin}
                        onChange={(n) => set("salaryMin", n)}
                        placeholder="8,00,000"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Max Salary</label>
                      <SalaryInput
                        value={form.salaryMax}
                        onChange={(n) => set("salaryMax", n)}
                        placeholder="13,00,000"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Target</label>
                      <SalaryInput
                        value={form.targetSalary}
                        onChange={(n) => set("targetSalary", n)}
                        placeholder="10,00,000"
                      />
                    </div>
                  </div>
                </section>

                {/* ── Notes ── */}
                <section className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <SectionLabel>Notes</SectionLabel>
                  <textarea
                    className={`${inputClass} min-h-[80px] resize-y`}
                    value={form.notes ?? ""}
                    onChange={(e) => set("notes", e.target.value || undefined)}
                    placeholder="Interview notes, impressions, next steps..."
                  />
                </section>
              </div>

              {/* Sticky footer */}
              <div className="shrink-0 border-t border-border bg-card px-5 py-4">
                <div className="flex gap-2.5">
                  <button
                    type="submit"
                    className="btn-glow flex-1 rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.98]"
                  >
                    {isEdit ? "Save Changes" : "Track Application"}
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
