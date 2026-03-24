import { LayoutDashboard, Briefcase, Mail, Linkedin, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Applications", icon: Briefcase },
    { href: "/networking", label: "Networking", icon: Mail },
    { href: "/linkedin", label: "LinkedIn", icon: Linkedin },
  ];

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card/40 px-4 py-6">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20">
          <Briefcase className="h-4 w-4 text-primary" />
        </div>
        <span className="font-display text-[15px] font-bold tracking-tight text-foreground">
          The Hunt
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <span className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
          Main Menu
        </span>

        {links.map((link) => {
          const isActive = location.pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-border/50">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
