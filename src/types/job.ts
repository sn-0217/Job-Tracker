// ── 5 simple statuses ─────────────────────────────────────────────────────────
export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export type WorkLocation   = "remote" | "hybrid" | "onsite";
export type EmploymentType = "full-time" | "part-time" | "contract" | "freelance" | "internship";
export type JobSource      = "linkedin" | "glassdoor" | "indeed" | "referral" | "company-site" | "other";
export type Priority       = 1 | 2 | 3 | 4 | 5;

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  jobPostingUrl?: string;
  jobSource?: JobSource;
  workLocation?: WorkLocation;
  employmentType?: EmploymentType;
  officeLocation?: string;
  status: ApplicationStatus;
  dateApplied: string;   // ISO
  dateUpdated: string;   // ISO
  followUpDate?: string; // ISO
  salaryMin?: number;
  salaryMax?: number;
  targetSalary?: number;
  priority: Priority;
  notes?: string;
  tags?: string[];
  archived: boolean;
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  saved:        { label: "Saved",        color: "status-saved"        },
  applied:      { label: "Applied",      color: "status-applied"      },
  interviewing: { label: "Interviewing", color: "status-interviewing" },
  offer:        { label: "Offer",        color: "status-offer"        },
  rejected:     { label: "Rejected",     color: "status-rejected"     },
};

export const JOB_SOURCES: { value: JobSource; label: string }[] = [
  { value: "linkedin",      label: "LinkedIn"      },
  { value: "glassdoor",     label: "Glassdoor"     },
  { value: "indeed",        label: "Indeed"        },
  { value: "referral",      label: "Referral"      },
  { value: "company-site",  label: "Company Site"  },
  { value: "other",         label: "Other"         },
];

export const WORK_LOCATIONS: { value: WorkLocation; label: string }[] = [
  { value: "remote", label: "Remote"  },
  { value: "hybrid", label: "Hybrid"  },
  { value: "onsite", label: "On-site" },
];

export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: "full-time",  label: "Full-time"  },
  { value: "part-time",  label: "Part-time"  },
  { value: "contract",   label: "Contract"   },
  { value: "freelance",  label: "Freelance"  },
  { value: "internship", label: "Internship" },
];
