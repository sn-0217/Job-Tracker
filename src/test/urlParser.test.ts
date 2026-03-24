import { describe, expect, it } from "vitest";
import { parseJobUrl } from "../lib/urlParser";

describe("parseJobUrl", () => {
  it("parses LinkedIn job URL with at-format slug", () => {
    const result = parseJobUrl(
      "https://www.linkedin.com/jobs/view/software-engineer-at-google-123456789/"
    );
    expect(result.jobTitle).toBe("Software Engineer");
    expect(result.company).toBe("Google");
    expect(result.jobSource).toBe("linkedin");
    expect(result.jobPostingUrl).toContain("linkedin.com");
  });

  it("parses LinkedIn URL without at-format (strips trailing ID)", () => {
    const result = parseJobUrl(
      "https://www.linkedin.com/jobs/view/senior-frontend-developer-7654321/"
    );
    expect(result.jobTitle).toBe("Senior Frontend Developer");
    expect(result.jobSource).toBe("linkedin");
  });

  it("parses Workday URL", () => {
    const result = parseJobUrl(
      "https://google.wd5.myworkdayjobs.com/en-US/careers/job/Software-Engineer_JR-12345"
    );
    expect(result.company).toBe("Google");
    expect(result.jobTitle).toBe("Software Engineer");
    expect(result.jobSource).toBe("company-site");
  });

  it("parses Greenhouse URL", () => {
    const result = parseJobUrl(
      "https://boards.greenhouse.io/stripe/jobs/1234567"
    );
    expect(result.company).toBe("Stripe");
    expect(result.jobSource).toBe("company-site");
  });

  it("parses Lever URL", () => {
    const result = parseJobUrl(
      "https://jobs.lever.co/openai/some-uuid-1234"
    );
    expect(result.company).toBe("Openai");
    expect(result.jobSource).toBe("company-site");
  });

  it("parses Indeed URL — stores URL only", () => {
    const result = parseJobUrl(
      "https://www.indeed.com/viewjob?jk=abc123def456"
    );
    expect(result.jobSource).toBe("indeed");
    expect(result.jobPostingUrl).toContain("indeed.com");
  });

  it("parses Glassdoor URL", () => {
    const result = parseJobUrl(
      "https://www.glassdoor.com/job-listing/product-manager-airbnb-JV_IC1147401_KO0,15_KE16,22.htm"
    );
    expect(result.jobSource).toBe("glassdoor");
    expect(result.jobPostingUrl).toContain("glassdoor.com");
  });

  it("returns just the URL for unknown platforms", () => {
    const result = parseJobUrl("https://careers.example.com/jobs/12345");
    expect(result.jobPostingUrl).toBe("https://careers.example.com/jobs/12345");
    expect(result.jobTitle).toBeUndefined();
  });

  it("handles empty string gracefully", () => {
    const result = parseJobUrl("");
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("always pre-fills jobPostingUrl", () => {
    const url = "https://www.linkedin.com/jobs/view/test-role-at-meta-999/";
    const result = parseJobUrl(url);
    expect(result.jobPostingUrl).toBe(url);
  });
});
