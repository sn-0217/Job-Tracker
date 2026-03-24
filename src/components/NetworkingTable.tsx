import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NetworkingContact } from "@/types/networking";
import { isPast, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Building2, ExternalLink, Mail, MoreHorizontal, Plus } from "lucide-react";

interface NetworkingTableProps {
  contacts: NetworkingContact[];
  isLoading: boolean;
  onSelect: (c: NetworkingContact) => void;
  onDelete: (id: string) => void;
  onMarkDone: (id: string, done: boolean) => void;
  onAddNew: () => void;
}

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—";

function avatarColor(name: string) {
  const palette = [
    "bg-indigo-500/20 text-indigo-300",
    "bg-violet-500/20 text-violet-300",
    "bg-sky-500/20 text-sky-300",
    "bg-emerald-500/20 text-emerald-300",
    "bg-amber-500/20 text-amber-300",
    "bg-rose-500/20 text-rose-300",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

export function NetworkingTable({
  contacts,
  isLoading,
  onSelect,
  onDelete,
  onMarkDone,
  onAddNew,
}: NetworkingTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center space-y-4 py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-[13px] text-muted-foreground animate-pulse">Loading contacts...</p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/50 px-16 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-6 w-6 text-primary/50" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-foreground">No networking contacts yet</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Track emails you've sent and set follow-up reminders
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="btn-glow flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Contact
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 grid grid-cols-[1fr_1.5fr_110px_90px_90px_40px] items-center border-b border-border bg-background/95 px-6 py-2.5 backdrop-blur-sm min-w-[700px]">
        {["Contact / Company", "Context", "Email", "Sent", "Follow-up", ""].map((h) => (
          <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {contacts.map((c, i) => {
        const isOverdue =
          !c.done && c.followUpDate && isPast(parseISO(c.followUpDate));
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: i * 0.02 }}
            onClick={() => onSelect(c)}
            className={`group grid cursor-pointer grid-cols-[1fr_1.5fr_110px_90px_90px_40px] items-start border-b px-6 py-3 transition-all duration-100 min-w-[700px] ${
              c.done 
                ? "opacity-40 border-border/40" 
                : isOverdue
                  ? "bg-amber-500/[0.03] hover:bg-amber-500/[0.08] border-border/40 shadow-[inset_2px_0_0_#f59e0b]"
                  : "border-border/40 hover:bg-white/[0.025]"
            }`}
          >
            {/* Name + company */}
            <div className="flex items-center gap-3 overflow-hidden pr-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold uppercase ${avatarColor(c.name)}`}>
                {c.name.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-foreground">{c.name}</p>
                {c.company && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-2.5 w-2.5 text-muted-foreground/40" />
                    <p className="truncate text-[12px] text-muted-foreground">{c.company}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Context */}
            <p className="line-clamp-2 text-[12px] text-muted-foreground pr-4 leading-relaxed mt-0.5">
              {c.context || <span className="text-muted-foreground/25">—</span>}
            </p>

            {/* Email Link */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 mt-0.5"
            >
              {c.emailLink ? (
                <a
                  href={c.emailLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span>View email</span>
                </a>
              ) : (
                <span className="text-[11px] text-muted-foreground/25">—</span>
              )}
            </div>

            {/* Date sent */}
            <div className="mt-0.5">
              <p className="text-[12px] tabular-nums text-muted-foreground">{formatDate(c.dateSent)}</p>
            </div>

            {/* Follow-up */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {isOverdue && (
                <div
                  title="Follow-up overdue"
                  className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                />
              )}
              <span className={`text-[12px] tabular-nums ${isOverdue ? "text-amber-400 font-medium" : "text-muted-foreground"}`}>
                {formatDate(c.followUpDate)}
              </span>
            </div>

            {/* Actions */}
            <div onClick={(e) => e.stopPropagation()} className="mt-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-white/8 hover:text-foreground group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onSelect(c)}>Edit</DropdownMenuItem>
                  {c.emailLink && (
                    <DropdownMenuItem
                      onClick={() => window.open(c.emailLink, "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Email
                    </DropdownMenuItem>
                  )}
                  {c.email && (
                    <DropdownMenuItem
                      onClick={() => {
                        const subject = encodeURIComponent(`Following up`);
                        window.open(`mailto:${c.email}?subject=${subject}`, "_blank");
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Draft Follow-up
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onMarkDone(c.id, !c.done)}>
                    {c.done ? "Mark as Active" : "Mark as Done"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(c.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
