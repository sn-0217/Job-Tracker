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
    <aside className="z-50 flex shrink-0 flex-row items-center justify-around border-t border-border bg-card/95 px-2 pb-3 pt-2 backdrop-blur-md sm:w-64 sm:flex-col sm:justify-start sm:border-r sm:border-t-0 sm:px-4 sm:py-6 sm:pb-6">
      <div className="hidden items-center gap-3 px-2 mb-8 sm:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20">
          <Briefcase className="h-4 w-4 text-primary" />
        </div>
        <span className="font-display text-[15px] font-bold tracking-tight text-foreground">
          The Hunt
        </span>
      </div>

      <nav className="flex w-full flex-row justify-around gap-1 sm:flex-1 sm:flex-col sm:justify-start">
        <span className="hidden mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60 sm:block">
          Main Menu
        </span>

        {links.map((link) => {
          const isActive = location.pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-[13px] font-medium transition-all flex-1 sm:flex-none ${
                isActive
                  ? "sm:bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 sm:h-4 sm:w-4 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
              <span className="block sm:inline truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden sm:mt-auto sm:block sm:pt-4 sm:border-t sm:border-border/50 w-full">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center justify-center sm:justify-start gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
