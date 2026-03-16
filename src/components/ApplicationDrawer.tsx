import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  JobApplication,
  ApplicationStatus,
  WorkLocation,
  EmploymentType,
  JobSource,
  Priority,
} from "@/types/job";
import { STATUS_CONFIG, JOB_SOURCES, WORK_LOCATIONS, EMPLOYMENT_TYPES } from "@/types/job";
import { StatusBadge } from "./StatusBadge";

interface ApplicationDrawerProps {
  open: boolean;
  onClose: () => void;
  application?: JobApplication | null;
  onSave: (data: Omit<JobApplication, "id" | "dateUpdated">) => void;
  onUpdate: (id: string, data: Partial<JobApplication>) => void;
}

const defaultForm = (): Omit<JobApplication, "id" | "dateUpdated"> => ({
  jobTitle: "",
  company: "",
  status: "applied",
  dateApplied: new Date().toISOString().split("T")[0],
  priority: 3 as Priority,
  archived: false,
});

export function ApplicationDrawer({ open, onClose, application, onSave, onUpdate }: ApplicationDrawerProps) {
  const [form, setForm] = useState(defaultForm());
  const isEdit = !!application;

  useEffect(() => {
    if (application) {
      setForm({
        ...application,
        dateApplied: application.dateApplied.split("T")[0],
        followUpDate: application.followUpDate?.split("T")[0],
      });
    } else {
      setForm(defaultForm());
    }
  }, [application, open]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

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
    "w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] transition-all focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary";
  const labelClass = "block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5";
  const selectClass = `${inputClass} appearance-none`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/10"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[540px] flex-col border-l border-border bg-background shadow-xl"
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-border px-6">
              <h2 className="font-display text-sm">
                {isEdit ? "Edit Application" : "Track Application"}
              </h2>
              <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                {/* Identity */}
                <section>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Role Details
                  </p>
                  <div className="grid gap-3">
                    <div>
                      <label className={labelClass}>Job Title *</label>
                      <input
                        className={inputClass}
                        value={form.jobTitle}
                        onChange={(e) => set("jobTitle", e.target.value)}
                        placeholder="Senior Product Manager"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Company *</label>
                      <input
                        className={inputClass}
                        value={form.company}
                        onChange={(e) => set("company", e.target.value)}
                        placeholder="Stripe Inc."
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Job Posting URL</label>
                      <input
                        className={inputClass}
                        value={form.jobPostingUrl ?? ""}
                        onChange={(e) => set("jobPostingUrl", e.target.value)}
                        placeholder="https://..."
                        type="url"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Source</label>
                        <select
                          className={selectClass}
                          value={form.jobSource ?? ""}
                          onChange={(e) => set("jobSource", (e.target.value || undefined) as JobSource)}
                        >
                          <option value="">Select...</option>
                          {JOB_SOURCES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Location Type</label>
                        <select
                          className={selectClass}
                          value={form.workLocation ?? ""}
                          onChange={(e) => set("workLocation", (e.target.value || undefined) as WorkLocation)}
                        >
                          <option value="">Select...</option>
                          {WORK_LOCATIONS.map((l) => (
                            <option key={l.value} value={l.value}>
                              {l.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Employment Type</label>
                        <select
                          className={selectClass}
                          value={form.employmentType ?? ""}
                          onChange={(e) => set("employmentType", (e.target.value || undefined) as EmploymentType)}
                        >
                          <option value="">Select...</option>
                          {EMPLOYMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Office Location</label>
                        <input
                          className={inputClass}
                          value={form.officeLocation ?? ""}
                          onChange={(e) => set("officeLocation", e.target.value)}
                          placeholder="San Francisco, CA"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Status & Dates */}
                <section>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Status & Timeline
                  </p>
                  <div className="grid gap-3">
                    <div>
                      <label className={labelClass}>Status</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => set("status", s)}
                            className={`transition-all ${form.status === s ? "ring-2 ring-ring/30 scale-105" : "opacity-70 hover:opacity-100"}`}
                          >
                            <StatusBadge status={s} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
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
                      <div className="flex gap-1">
                        {([1, 2, 3, 4, 5] as Priority[]).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => set("priority", p)}
                            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
                              form.priority >= p
                                ? "bg-amber-100 text-amber-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Compensation */}
                <section>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Compensation
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Min Salary</label>
                      <input
                        type="number"
                        className={`${inputClass} tabular-nums`}
                        value={form.salaryMin ?? ""}
                        onChange={(e) => set("salaryMin", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="120000"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Max Salary</label>
                      <input
                        type="number"
                        className={`${inputClass} tabular-nums`}
                        value={form.salaryMax ?? ""}
                        onChange={(e) => set("salaryMax", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="150000"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Target</label>
                      <input
                        type="number"
                        className={`${inputClass} tabular-nums`}
                        value={form.targetSalary ?? ""}
                        onChange={(e) => set("targetSalary", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="140000"
                      />
                    </div>
                  </div>
                </section>

                {/* Notes */}
                <section>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Notes
                  </p>
                  <textarea
                    className={`${inputClass} min-h-[100px] resize-y`}
                    value={form.notes ?? ""}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Interview notes, thoughts, next steps..."
                  />
                </section>
              </div>

              {/* Submit */}
              <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-border bg-background pt-4 pb-6">
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {isEdit ? "Save Changes" : "Track Application"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-border px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
