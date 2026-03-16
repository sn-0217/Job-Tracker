import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import type { JobApplication, ApplicationStatus } from "@/types/job";
import { STATUS_CONFIG } from "@/types/job";

interface AnalyticsDashboardProps {
  applications: JobApplication[];
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  wishlist: "#71717a",
  applied: "#3b82f6",
  reviewing: "#60a5fa",
  "phone-screen": "#8b5cf6",
  interviewing: "#8b5cf6",
  "final-round": "#7c3aed",
  offer: "#10b981",
  accepted: "#059669",
  declined: "#71717a",
  rejected: "#71717a",
  ghosted: "#f59e0b",
  withdrawn: "#71717a",
};

const PIPELINE_ORDER: ApplicationStatus[] = [
  "wishlist",
  "applied",
  "reviewing",
  "phone-screen",
  "interviewing",
  "final-round",
  "offer",
  "accepted",
];

export function AnalyticsDashboard({ applications, onClose }: AnalyticsDashboardProps) {
  const active = useMemo(() => applications.filter((a) => !a.archived), [applications]);

  const pipelineData = useMemo(() => {
    return PIPELINE_ORDER.map((status) => ({
      name: STATUS_CONFIG[status].label,
      count: active.filter((a) => a.status === status).length,
      color: STATUS_COLORS[status],
    })).filter((d) => d.count > 0 || PIPELINE_ORDER.indexOf(d.name as any) < 4);
  }, [active]);

  const responseRate = useMemo(() => {
    const applied = active.filter((a) => a.status !== "wishlist").length;
    if (applied === 0) return { rate: 0, responded: 0, total: 0 };
    const responded = active.filter((a) =>
      ["reviewing", "phone-screen", "interviewing", "final-round", "offer", "accepted", "rejected"].includes(a.status)
    ).length;
    return { rate: applied > 0 ? Math.round((responded / applied) * 100) : 0, responded, total: applied };
  }, [active]);

  const interviewRate = useMemo(() => {
    const applied = active.filter((a) => a.status !== "wishlist").length;
    const interviewing = active.filter((a) =>
      ["phone-screen", "interviewing", "final-round", "offer", "accepted"].includes(a.status)
    ).length;
    return { rate: applied > 0 ? Math.round((interviewing / applied) * 100) : 0, count: interviewing, total: applied };
  }, [active]);

  const offerRate = useMemo(() => {
    const applied = active.filter((a) => a.status !== "wishlist").length;
    const offers = active.filter((a) => ["offer", "accepted"].includes(a.status)).length;
    return { rate: applied > 0 ? Math.round((offers / applied) * 100) : 0, count: offers, total: applied };
  }, [active]);

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    active.forEach((a) => {
      const src = a.jobSource || "unknown";
      counts[src] = (counts[src] || 0) + 1;
    });
    const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#71717a"];
    return Object.entries(counts)
      .map(([name, value], i) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, fill: colors[i % colors.length] }))
      .sort((a, b) => b.value - a.value);
  }, [active]);

  const avgSalary = useMemo(() => {
    const withSalary = active.filter((a) => a.salaryMin || a.salaryMax);
    if (withSalary.length === 0) return null;
    const total = withSalary.reduce((sum, a) => {
      const avg = a.salaryMin && a.salaryMax ? (a.salaryMin + a.salaryMax) / 2 : (a.salaryMin || a.salaryMax || 0);
      return sum + avg;
    }, 0);
    return Math.round(total / withSalary.length);
  }, [active]);

  const weeklyActivity = useMemo(() => {
    const weeks: Record<string, number> = {};
    active.forEach((a) => {
      const d = new Date(a.dateApplied);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, count]) => ({
        week: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      }));
  }, [active]);

  const labelClass = "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground";
  const cardClass = "rounded-lg border border-border bg-card p-5";

  const statCards = [
    { label: "Total Active", value: active.length, sub: `${applications.filter((a) => a.archived).length} archived` },
    { label: "Response Rate", value: `${responseRate.rate}%`, sub: `${responseRate.responded}/${responseRate.total}` },
    { label: "Interview Rate", value: `${interviewRate.rate}%`, sub: `${interviewRate.count} interviews` },
    { label: "Offer Rate", value: `${offerRate.rate}%`, sub: `${offerRate.count} offers` },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-6">
        <p className="font-display text-sm text-foreground">Analytics</p>
        <button
          onClick={onClose}
          className="rounded-md border border-border px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted"
        >
          Back to Pipeline
        </button>
      </div>

      <div className="space-y-6 px-6 py-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cardClass}
            >
              <p className={labelClass}>{s.label}</p>
              <p className="mt-1 font-display text-2xl text-foreground">{s.value}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Pipeline Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cardClass}
          >
            <p className={`${labelClass} mb-4`}>Pipeline Funnel</p>
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={pipelineData} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 12, fill: "#71717a" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 6,
                      border: "1px solid hsl(220, 13%, 91%)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {pipelineData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-[13px] text-muted-foreground">
                No data yet
              </div>
            )}
          </motion.div>

          {/* Sources */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cardClass}
          >
            <p className={`${labelClass} mb-4`}>Application Sources</p>
            {sourceData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      strokeWidth={0}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 6,
                        border: "1px solid hsl(220, 13%, 91%)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {sourceData.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.fill }} />
                      <span className="text-[12px] text-muted-foreground">{s.name}</span>
                      <span className="tabular-nums text-[12px] font-medium text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-[13px] text-muted-foreground">
                No data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Weekly Activity + Salary */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cardClass}
          >
            <p className={`${labelClass} mb-4`}>Weekly Activity</p>
            {weeklyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyActivity}>
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 6,
                      border: "1px solid hsl(220, 13%, 91%)",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[180px] items-center justify-center text-[13px] text-muted-foreground">
                No data yet
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cardClass}
          >
            <p className={`${labelClass} mb-4`}>Compensation Overview</p>
            <div className="flex h-[180px] flex-col items-center justify-center">
              {avgSalary ? (
                <>
                  <p className="font-display text-3xl text-foreground tabular-nums">
                    ${Math.round(avgSalary / 1000)}k
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground">avg. comp target</p>
                  <div className="mt-4 flex gap-6">
                    {active.filter((a) => a.salaryMin).length > 0 && (
                      <div className="text-center">
                        <p className="tabular-nums text-sm font-medium text-foreground">
                          ${Math.round(Math.min(...active.filter((a) => a.salaryMin).map((a) => a.salaryMin!)) / 1000)}k
                        </p>
                        <p className="text-[11px] text-muted-foreground">lowest</p>
                      </div>
                    )}
                    {active.filter((a) => a.salaryMax).length > 0 && (
                      <div className="text-center">
                        <p className="tabular-nums text-sm font-medium text-foreground">
                          ${Math.round(Math.max(...active.filter((a) => a.salaryMax).map((a) => a.salaryMax!)) / 1000)}k
                        </p>
                        <p className="text-[11px] text-muted-foreground">highest</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-[13px] text-muted-foreground">Add salary data to see insights</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
