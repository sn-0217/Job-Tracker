import type { JobApplication, JobSource } from "@/types/job";

export type ParsedJobUrl = Pick<
  JobApplication,
  "jobTitle" | "company" | "jobPostingUrl" | "jobSource"
>;

/**
 * Parse a job-posting URL and extract as much structured data as possible
 * using client-side regex (no network requests).
 */
export function parseJobUrl(rawUrl: string): Partial<ParsedJobUrl> {
  const url = rawUrl.trim();
  if (!url) return {};

  const result: Partial<ParsedJobUrl> = {
    jobPostingUrl: url,
  };

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // ── LinkedIn ──────────────────────────────────────────────────────────
    // e.g. https://www.linkedin.com/jobs/view/software-engineer-at-google-123456789/
    if (hostname.includes("linkedin.com")) {
      result.jobSource = "linkedin" as JobSource;

      const m = pathname.match(/\/jobs\/view\/(.+?)(?:\/|$)/);
      if (m) {
        const slug = decodeURIComponent(m[1]).replace(/-+/g, " ");
        // Try to split "role at company" or "role-jobId"
        const atMatch = slug.match(/^(.+?)\s+at\s+(.+?)(?:\s+\d+)?$/i);
        if (atMatch) {
          result.jobTitle = titleCase(atMatch[1].trim());
          result.company = titleCase(atMatch[2].trim());
        } else {
          // Slug may be "Software Engineer 1234567" — strip trailing number
          const clean = slug.replace(/\s+\d{6,}$/, "").trim();
          result.jobTitle = titleCase(clean);
        }
      }
      return result;
    }

    // ── Workday ───────────────────────────────────────────────────────────
    // e.g. https://google.wd5.myworkdayjobs.com/en-US/careers/job/Software-Engineer_JR-12345
    if (hostname.includes("myworkdayjobs.com")) {
      result.jobSource = "company-site" as JobSource;

      // Company is the subdomain (before the first dot)
      const companySlug = hostname.split(".")[0];
      result.company = titleCase(companySlug.replace(/-/g, " "));

      // Role is the last path segment before the job ID
      const parts = pathname.split("/").filter(Boolean);
      const jobIdx = parts.findIndex((p) => p === "job");
      if (jobIdx !== -1 && parts[jobIdx + 1]) {
        const roleSlug = parts[jobIdx + 1]
          .split("_")[0]             // strip "_JR-12345"
          .replace(/-/g, " ");
        result.jobTitle = titleCase(roleSlug);
      }
      return result;
    }

    // ── Greenhouse ────────────────────────────────────────────────────────
    // e.g. https://boards.greenhouse.io/google/jobs/1234567
    if (hostname.includes("greenhouse.io")) {
      result.jobSource = "company-site" as JobSource;

      const parts = pathname.split("/").filter(Boolean);
      // parts[0] = company slug
      if (parts[0]) {
        result.company = titleCase(parts[0].replace(/-/g, " "));
      }
      return result;
    }

    // ── Lever ─────────────────────────────────────────────────────────────
    // e.g. https://jobs.lever.co/google/uuid-here
    if (hostname.includes("lever.co")) {
      result.jobSource = "company-site" as JobSource;

      const parts = pathname.split("/").filter(Boolean);
      if (parts[0]) {
        result.company = titleCase(parts[0].replace(/-/g, " "));
      }
      return result;
    }

    // ── Indeed ────────────────────────────────────────────────────────────
    if (hostname.includes("indeed.com")) {
      result.jobSource = "indeed" as JobSource;
      return result;
    }

    // ── Glassdoor ─────────────────────────────────────────────────────────
    // e.g. https://www.glassdoor.com/job-listing/software-engineer-google-JV_...
    if (hostname.includes("glassdoor.com")) {
      result.jobSource = "glassdoor" as JobSource;

      const m = pathname.match(/\/job-listing\/(.+?)(?:-JV|$)/);
      if (m) {
        const parts = decodeURIComponent(m[1]).replace(/-/g, " ").split("  ");
        if (parts.length >= 2) {
          result.jobTitle = titleCase(parts[0]);
          result.company  = titleCase(parts[1]);
        } else {
          result.jobTitle = titleCase(parts[0]);
        }
      }
      return result;
    }

  } catch {
    // Invalid URL — return just the raw string
  }

  return result;
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
