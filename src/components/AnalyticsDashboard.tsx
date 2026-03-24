import type { ApplicationStatus, JobApplication } from "@/types/job";
import { STATUS_CONFIG } from "@/types/job";
import type { NetworkingContact } from "@/types/networking";
import type { LinkedInPost } from "@/types/linkedinPost";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    Legend,
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
  const navigate = useNavigate();
  const active = useMemo(() => applications.filter((a) => !a.archived), [applications]);

  const pipelineData = useMemo(() => {
    return [
      {
        name: "Saved Posts",
        count: linkedInPosts.length,
        color: "#10b981",
      },
      {
        name: "Contacts",
        count: networkingContacts.length,
        color: "#38bdf8",
      },
      {
        name: "Applied",
        count: active.filter((a) => a.status === "applied").length,
        color: "#6366f1",
      },
      {
        name: "Interviewing",
        count: active.filter((a) => a.status === "interviewing").length,
        color: "#a78bfa",
      },
      {
        name: "Offers",
        count: active.filter((a) => a.status === "offer").length,
        color: "#34d399",
      },
    ];
  }, [active, networkingContacts, linkedInPosts]);

  const followUpsDue = useMemo(() => {
    const isDue = (d?: string) => d && new Date(d) <= new Date();
    const j = active.filter((a) => isDue(a.followUpDate)).length;
    const n = networkingContacts.filter((c) => !c.done && isDue(c.followUpDate)).length;
    const l = linkedInPosts.filter((p) => !p.done && isDue(p.followUpDate)).length;
    return {
      total: j + n + l,
      jobs: j,
      networking: n,
      linkedin: l,
    };
  }, [active, networkingContacts, linkedInPosts]);

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

  const unifiedWeeklyActivity = useMemo(() => {
    const weeks: Record<string, { jobs: number; networking: number; linkedin: number }> = {};
    
    const addDate = (isoString: string | undefined, type: "jobs" | "networking" | "linkedin") => {
      if (!isoString) return;
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return;
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay()); // Sunday
      const key = weekStart.toISOString().split("T")[0];
      if (!weeks[key]) weeks[key] = { jobs: 0, networking: 0, linkedin: 0 };
      weeks[key][type]++;
    };

    active.forEach((a) => addDate(a.dateApplied, "jobs"));
    networkingContacts.forEach((c) => addDate(c.dateSent, "networking"));
    linkedInPosts.forEach((p) => addDate(p.createdAt, "linkedin"));

    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, counts]) => ({
        week: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Jobs: counts.jobs,
        Networking: counts.networking,
        LinkedIn: counts.linkedin,
      }));
  }, [active, networkingContacts, linkedInPosts]);

  const networkingActive = useMemo(() => networkingContacts.filter((c) => !c.done), [networkingContacts]);
  const linkedInActive = useMemo(() => linkedInPosts.filter((p) => !p.done), [linkedInPosts]);

  const statCards = [
    {
      label: "Active Jobs",
      value: active.length,
      sub: `${applications.filter((a) => a.archived).length} archived`,
      accent: "text-foreground",
      link: "/jobs",
    },
    {
      label: "Follow-ups Due",
      value: followUpsDue.total,
      sub: `${followUpsDue.jobs} jobs, ${followUpsDue.networking} net, ${followUpsDue.linkedin} ln`,
      accent: followUpsDue.total > 0 ? "text-amber-400" : "text-foreground",
      link: "/jobs",
    },
    {
      label: "Active Contacts",
      value: networkingActive.length,
      sub: `${networkingContacts.filter((c) => c.done).length} completed`,
      accent: "text-sky-400",
      link: "/networking",
    },
    {
      label: "Saved Posts",
      value: linkedInActive.length,
      sub: `${linkedInPosts.filter((c) => c.done).length} completed`,
      accent: "text-emerald-400",
      link: "/linkedin",
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
              onClick={() => navigate(s.link)}
              className={`${cardClass} cursor-pointer hover:bg-white/[0.04] active:scale-[0.98] transition-all`}
            >
              <p className={labelClass}>{s.label}</p>
              <p className={`mt-1.5 font-display text-2xl tabular-nums ${s.accent}`}>{s.value}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground/70">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cardClass}
          >
            <p className={`${labelClass} mb-4`}>Job Search Journey</p>
            {pipelineData.length > 0 && pipelineData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={pipelineData} margin={{ top: 10, right: 16, left: 16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: "#71717a" }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "#38bdf8" }}
                    cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#38bdf8" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-[13px] text-muted-foreground/50">
                No pipeline data yet
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
          {/* Unified Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cardClass}
          >
            <p className={`${labelClass} mb-4`}>Unified Activity (Weekly)</p>
            {unifiedWeeklyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={unifiedWeeklyActivity}>
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="Jobs" stackId="a" fill="#6366f1" fillOpacity={0.8} barSize={26} />
                  <Bar dataKey="Networking" stackId="a" fill="#38bdf8" fillOpacity={0.8} />
                  <Bar dataKey="LinkedIn" stackId="a" fill="#34d399" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[180px] items-center justify-center text-[13px] text-muted-foreground/50">
                No activity recorded yet
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
