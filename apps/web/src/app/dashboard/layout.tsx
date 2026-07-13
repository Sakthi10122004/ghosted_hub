"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardCheck,
  FileStack,
  Users,
  Building2,
  Layers3,
  Settings,
  Rocket,
  ScrollText,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/reviews", label: "Reviews", icon: ClipboardCheck },
  { href: "/dashboard/files", label: "Files", icon: FileStack },
];

const programItems = [
  { href: "/dashboard/cohorts", label: "Cohorts", icon: Layers3 },
  { href: "/dashboard/teams", label: "Student Teams", icon: Users },
  { href: "/dashboard/nonprofits", label: "Nonprofits", icon: Building2 },
];

const workspaceItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/deployments", label: "Deployments", icon: Rocket, adminOnly: true },
  { href: "/dashboard/logs", label: "System Logs", icon: ScrollText, adminOnly: true },
];

function NavLink({ href, label, icon: Icon, pathname, exact }: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
  exact?: boolean;
}) {
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 ${
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-100"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-white"
      }`}
    >
      <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${isActive ? "text-primary-foreground" : ""}`} />
      {label}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <div className="h-screen flex items-center justify-center bg-background text-muted-foreground font-sans">Loading workspace...</div>;
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground hidden md:flex md:flex-col border-r border-sidebar-border">
        {/* Logo Area */}
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-serif font-bold text-xl">
            G
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-serif font-bold leading-tight">Ghosted</span>
            <span className="text-[10px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase leading-tight">Program Console</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
          
          {/* Main Links */}
          <div className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} />
            ))}
          </div>

          {/* Program Section */}
          <div>
            <h3 className="px-5 text-[10px] font-bold tracking-widest text-sidebar-foreground/40 uppercase mb-3">Program</h3>
            <div className="space-y-1.5">
              {programItems.map((item) => (
                <NavLink key={item.href} {...item} pathname={pathname} />
              ))}
            </div>
          </div>

          {/* Workspace Section */}
          <div>
            <h3 className="px-5 text-[10px] font-bold tracking-widest text-sidebar-foreground/40 uppercase mb-3">Workspace</h3>
            <div className="space-y-1.5">
              {workspaceItems.map((item) => {
                // @ts-ignore - TODO: fix session types
                if (item.adminOnly && session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "admin") return null;
                return <NavLink key={item.href} {...item} pathname={pathname} />;
              })}
            </div>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4">
           <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#252429] border border-white/5">
             <div className="h-9 w-9 rounded-full bg-[#818CF8] text-white flex items-center justify-center text-sm font-medium">
               MA
             </div>
             <div className="flex flex-col">
               <span className="text-sm font-medium text-white leading-tight">Maya Alvarez</span>
               <span className="text-xs text-sidebar-foreground/50 leading-tight mt-0.5">Organizer</span>
             </div>
           </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8 shadow-sm">
          <div className="md:hidden font-heading font-semibold text-lg">Ghosted Hub</div>
          <div className="ml-auto flex items-center space-x-4">
            {/* Quick Actions Placeholder */}
          </div>
        </header>
        
        <div className="p-8 flex-1 overflow-auto bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
