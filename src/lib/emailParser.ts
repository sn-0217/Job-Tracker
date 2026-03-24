/**
 * Parses an email address (e.g. firstname.lastname@company.com)
 * Returns { name: "Firstname Lastname", company: "Company" }
 * Returns null if parsing fails.
 */
export function parseEmailData(email: string) {
  if (!email || !email.includes("@")) return null;

  const [localPart, domainPart] = email.trim().split("@");
  if (!localPart || !domainPart) return null;

  // Cleanup local part for name: replace dots, underscores, plus with space
  const cleanName = localPart.replace(/[._+]/g, " ");
  
  // Title Case name (e.g. "mehreen firzada" -> "Mehreen Firzada")
  const name = cleanName
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Cleanup domain part for company (e.g. "tollywood.com" -> "tollywood")
  const parts = domainPart.split(".");
  const rawCompany = parts[0] || ""; // Just grab the primary domain segment
  
  // Title Case company
  const company = rawCompany
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return { name, company };
}
