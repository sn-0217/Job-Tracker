import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { ApplicationStatus, JobApplication } from "@/types/job";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function useJobStore() {
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // Map camelCase TS fields to snake_case DB fields (Moved up for migration use)
  const toDbCoords = (app: Partial<JobApplication>) => {
    const coords: any = { ...app };
    if (app.jobTitle !== undefined) { coords.job_title = app.jobTitle; delete coords.jobTitle; }
    if (app.jobPostingUrl !== undefined) { coords.job_posting_url = app.jobPostingUrl; delete coords.jobPostingUrl; }
    if (app.jobSource !== undefined) { coords.job_source = app.jobSource; delete coords.jobSource; }
    if (app.workLocation !== undefined) { coords.work_location = app.workLocation; delete coords.workLocation; }
    if (app.employmentType !== undefined) { coords.employment_type = app.employmentType; delete coords.employmentType; }
    if (app.officeLocation !== undefined) { coords.office_location = app.officeLocation; delete coords.officeLocation; }
    if (app.dateApplied !== undefined) { coords.date_applied = app.dateApplied; delete coords.dateApplied; }
    if (app.dateUpdated !== undefined) { coords.date_updated = app.dateUpdated; delete coords.dateUpdated; }
    if (app.followUpDate !== undefined) { coords.follow_up_date = app.followUpDate; delete coords.followUpDate; }
    if (app.salaryMin !== undefined) { coords.salary_min = app.salaryMin; delete coords.salaryMin; }
    if (app.salaryMax !== undefined) { coords.salary_max = app.salaryMax; delete coords.salaryMax; }
    if (app.targetSalary !== undefined) { coords.target_salary = app.targetSalary; delete coords.targetSalary; }
    // Clean up undefined values
    Object.keys(coords).forEach(key => coords[key] === undefined && delete coords[key]);
    return coords;
  };

  // Legacy Status Migration Map
  const STATUS_MIGRATION: Record<string, ApplicationStatus> = {
    wishlist:      "saved",
    reviewing:     "interviewing",
    "phone-screen":"interviewing",
    "final-round": "interviewing",
    accepted:      "offer",
    declined:      "rejected",
    ghosted:       "rejected",
    withdrawn:     "rejected",
  };
  function migrateStatus(status: string): ApplicationStatus {
    return STATUS_MIGRATION[status] ?? (status as ApplicationStatus);
  }
  const [isLoading, setIsLoading]       = useState(true);
  const [searchQuery, setSearchQuery]   = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [showArchived, setShowArchived] = useState(false);
  const { user } = useAuth();

  // Load from Supabase on mount
  useEffect(() => {
    async function fetchApplications() {
      if (!user) {
        setApplications([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      // --- MIGRATION: LocalStorage -> Supabase ---
      const STORAGE_KEY = "jobtracker_applications";
      const localDataRaw = localStorage.getItem(STORAGE_KEY);
      if (localDataRaw) {
        try {
          const localData: JobApplication[] = JSON.parse(localDataRaw);
          if (Array.isArray(localData) && localData.length > 0) {
            console.log("Migrating", localData.length, "local applications to Supabase...");
            const insertPayload = localData.map(app => ({
              ...toDbCoords(app),
              id: undefined, // Let PG generate the UUID to avoid format issues
              status: migrateStatus(app.status), // Remap legacy 12 statuses -> 5 statuses
              user_id: user.id
            }));

            const { error: migError } = await supabase.from("applications").insert(insertPayload);
            if (!migError) {
              toast.success(`Migrated ${localData.length} existing applications to cloud`);
              localStorage.removeItem(STORAGE_KEY);
            } else {
              console.error("Migration error:", migError);
            }
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (e) {
          console.error("Error parsing local migration data", e);
        }
      }
      // --- END MIGRATION ---

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("date_updated", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
      } else if (data) {
        // Map snake_case DB fields to camelCase TS fields
        const mapped = data.map((d: any) => ({
          ...d,
          jobTitle: d.job_title,
          jobPostingUrl: d.job_posting_url,
          jobSource: d.job_source,
          workLocation: d.work_location,
          employmentType: d.employment_type,
          officeLocation: d.office_location,
          dateApplied: d.date_applied,
          dateUpdated: d.date_updated,
          followUpDate: d.follow_up_date,
          salaryMin: d.salary_min !== null ? Number(d.salary_min) : undefined,
          salaryMax: d.salary_max !== null ? Number(d.salary_max) : undefined,
          targetSalary: d.target_salary !== null ? Number(d.target_salary) : undefined,
        }));
        setApplications(mapped);
      }
      setIsLoading(false);
    }
    fetchApplications();
  }, [user]);

  // (toDbCoords moved up)

  const addApplication = useCallback(async (app: Omit<JobApplication, "id" | "dateUpdated">) => {
    const dateUpdated = new Date().toISOString();
    // Temporary ID for optimistic UI
    const tempId = crypto.randomUUID();
    const newApp: JobApplication = { ...app, id: tempId, dateUpdated };

    // Optimistic UI update
    setApplications(prev => [newApp, ...prev]);

    const { data, error } = await supabase
      .from("applications")
      .insert([{ ...toDbCoords({ ...app, dateUpdated }), user_id: user?.id }])
      .select()
      .single();

    if (error) {
      console.error("Error adding application:", error);
      toast.error("Failed to add application");
      // Revert optimistic update
      setApplications(prev => prev.filter(a => a.id !== tempId));
    } else if (data) {
      // Replace tempId with actual DB ID
      setApplications(prev => prev.map(a => a.id === tempId ? { ...a, id: data.id } : a));
      toast.success("Application added");
    }
  }, [user]);

  const updateApplication = useCallback(async (id: string, updates: Partial<JobApplication>) => {
    const dateUpdated = new Date().toISOString();
    const fullUpdates = { ...updates, dateUpdated };

    // Optimistic UI
    setApplications(prev => prev.map(a => a.id === id ? { ...a, ...fullUpdates } : a));

    const { error } = await supabase
      .from("applications")
      .update(toDbCoords(fullUpdates))
      .eq("id", id);

    if (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
      // Could fetch to revert to DB state here, but optimistic is usually fine for simple updates
    } else {
      toast.success("Saved");
    }
  }, []);

  const deleteApplication = useCallback(async (id: string) => {
    // Optimistic UI
    const snapshot = applications; // shallow copy for revert
    setApplications(prev => prev.filter(a => a.id !== id));

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
      // Revert
      setApplications(snapshot);
    } else {
      toast.success("Application deleted");
    }
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (app.archived !== showArchived) return false;
      if (statusFilter !== "all") {
        if (statusFilter === "interviewing") {
          if (!["phone-screen", "interviewing", "final-round"].includes(app.status)) return false;
        } else {
          if (app.status !== statusFilter) return false;
        }
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          app.jobTitle.toLowerCase().includes(q) ||
          app.company.toLowerCase().includes(q) ||
          (app.officeLocation?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [applications, searchQuery, statusFilter, showArchived]);

  const stats = useMemo(() => {
    const active = applications.filter((a) => !a.archived);
    const now    = new Date();
    const followUpsDue = active.filter((a) => {
      if (!a.followUpDate) return false;
      return new Date(a.followUpDate) <= now;
    });
    return {
      total:        active.length,
      applied:      active.filter((a) => a.status === "applied").length,
      interviewing: active.filter((a) => a.status === "interviewing").length,
      offers:       active.filter((a) => a.status === "offer").length,
      followUpsDue: followUpsDue.length,
    };
  }, [applications]);

  return {
    applications: filteredApplications,
    allApplications: applications,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    showArchived,
    setShowArchived,
    addApplication,
    updateApplication,
    deleteApplication,
    stats,
  };
}
