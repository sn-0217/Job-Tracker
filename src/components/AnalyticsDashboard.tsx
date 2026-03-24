import type { ApplicationStatus, JobApplication } from "@/types/job";
import { STATUS_CONFIG } from "@/types/job";
import type { NetworkingContact } from "@/types/networking";
import type { LinkedInPost } from "@/types/linkedinPost";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface AnalyticsDashboardProps {
  applications: JobApplication[];
  networkingContacts: NetworkingContact[];
  linkedInPosts: LinkedInPost[];
}

const STATUS_COLORS: Record<string, string> = {
  saved:        "#71717a",
  applied:      "#6366f1",
  interviewing: "#a78bfa",
  offer:        "#34d399",
  rejected:     "#52525b",
};

const CHART_COLORS = ["#6366f1", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#71717a"];

const PIPELINE_ORDER: ApplicationStatus[] = [
  "rejected", "applied", "interviewing", "offer",
];

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid hsl(226, 16%, 18%)",
  backgroundColor: "hsl(226, 22%, 9%)",
  color: "#e2e8f0",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
};

export function AnalyticsDashboard({ applications, networkingContacts, linkedInPosts }: AnalyticsDashboardProps) {
  const active = useMemo(() => applications.filter((a) => !a.archived), [applications]);

  const pipelineData = useMemo(() => {
    return PIPELINE_ORDER.map((status) => ({
      name: STATUS_CONFIG[status].label,
      count: active.filter((a) => a.status === status).length,
      color: STATUS_COLORS[status],
    })); // show all 4 pipeline statuses always
  }, [active]);

  const responseRate = useMemo(() => {
    // "responded" = anything past "applied"
    const total     = active.filter((a) => a.status !== "saved").length;
    if (total === 0) return { rate: 0, responded: 0, total: 0 };
    const responded = active.filter((a) =>
      ["interviewing", "offer", "rejected"].includes(a.status)
    ).length;
    return { rate: Math.round((responded / total) * 100), responded, total };
  }, [active]);

  const interviewRate = useMemo(() => {
    const total       = active.filter((a) => a.status !== "saved").length;
    const interviewing = active.filter((a) =>
      ["interviewing", "offer"].includes(a.status)
    ).length;
    return { rate: total > 0 ? Math.round((interviewing / total) * 100) : 0, count: interviewing };
  }, [active]);

  const offerRate = useMemo(() => {
    const total  = active.filter((a) => a.status !== "saved").length;
    const offers = active.filter((a) => a.status === "offer").length;
    return { rate: total > 0 ? Math.round((offers / total) * 100) : 0, count: offers };
  }, [active]);

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    active.forEach((a) => {
      const src = a.jobSource || "other";
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value], i) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
        value,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      }))
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

  const networkingActive = useMemo(() => networkingContacts.filter((c) => !c.done), [networkingContacts]);
  const linkedInActive = useMemo(() => linkedInPosts.filter((p) => !p.done), [linkedInPosts]);

  const statCards = [
    {
      label: "Active Jobs",
      value: active.length,
      sub: `${applications.filter((a) => a.archived).length} archived`,
      accent: "text-foreground",
    },
    {
      label: "Interview Rate",
      value: `${interviewRate.rate}%`,
      sub: `${interviewRate.count} interviews`,
      accent: interviewRate.rate > 20 ? "text-violet-400" : "text-foreground",
    },
    {
      label: "Active Contacts",
      value: networkingActive.length,
      sub: `${networkingContacts.filter((c) => c.done).length} completed`,
      accent: "text-sky-400",
    },
    {
      label: "Saved Posts",
      value: linkedInActive.length,
      sub: `${linkedInPosts.filter((c) => c.done).length} completed`,
      accent: "text-emerald-400",
    },
  ];

  const cardClass = "rounded-xl border border-border/60 bg-card p-5";
  const labelClass = "text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60";

  /** Format a salary number to Indian lakh shorthand */
  function fmtINR(n: number) {
    if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
    if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(1)}L`;
    return `₹${(n / 1000).toFixed(0)}K`;
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col border-b border-border bg-card/60 backdrop-blur-md z-30 sticky top-0 shrink-0">
        <div className="flex sm:h-14 flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-0">
          <h1 className="text-lg font-semibold text-foreground mr-auto shrink-0">Analytics Overview</h1>
        </div>
      </header>

      <div className="space-y-5 px-5 py-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cardClass}
            >
              <p className={labelClass}>{s.label}</p>
              <p className={`mt-1.5 font-display text-2xl tabular-nums ${s.accent}`}>{s.value}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground/70">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pipeline Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
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
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "#6366f1" }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                    {pipelineData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-[13px] text-muted-foreground/50">
                No data yet
              </div>
            )}
          </motion.div>

          {/* Sources */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cardClass}
          >
            <p className={`${labelClass} mb-4`}>Application Sources</p>
            {sourceData.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={3}
                      strokeWidth={0}
                    />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#6366f1" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5">
                  {sourceData.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.fill }} />
                      <span className="text-[12px] text-muted-foreground">{s.name}</span>
                      <span className="ml-auto tabular-nums text-[12px] font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-[13px] text-muted-foreground/50">
                No data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
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
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" fill="#6366f1" fillOpacity={0.8} radius={[4, 4, 0, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[180px] items-center justify-center text-[13px] text-muted-foreground/50">
                No data yet
              </div>
            )}
          </motion.div>

          {/* Compensation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cardClass}
          >
            <p className={`${labelClass} mb-4`}>Compensation Overview</p>
            <div className="flex h-[180px] flex-col items-center justify-center">
              {avgSalary ? (
                <>
                  <p className="font-display text-3xl tabular-nums text-emerald-400">
                    {fmtINR(avgSalary)}
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground">avg. CTC target</p>
                  <div className="mt-5 flex gap-8">
                    {active.filter((a) => a.salaryMin).length > 0 && (
                      <div className="text-center">
                        <p className="tabular-nums text-sm font-semibold text-foreground">
                          {fmtINR(Math.min(...active.filter((a) => a.salaryMin).map((a) => a.salaryMin!)))}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60">lowest</p>
                      </div>
                    )}
                    {active.filter((a) => a.salaryMax).length > 0 && (
                      <div className="text-center">
                        <p className="tabular-nums text-sm font-semibold text-foreground">
                          {fmtINR(Math.max(...active.filter((a) => a.salaryMax).map((a) => a.salaryMax!)))}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60">highest</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-[13px] text-muted-foreground/50">Add salary data to see insights</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
