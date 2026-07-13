"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import { authClient } from "@/lib/auth-client";
import { Search, Bell, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", label: "Dashboard", exact: true, svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg> },
  { href: "/dashboard/projects", label: "Projects", svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.22-1.8A2 2 0 0 0 8.53 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v6"/><path d="M12 10v6"/><path d="M16 10v6"/></svg> },
  { href: "/dashboard/reviews", label: "Reviews", svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg> },
  { href: "/dashboard/files", label: "Files", svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M3 13h18"/></svg> },
];

const programItems = [
  { href: "/dashboard/cohorts", label: "Cohorts", svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> },
  { href: "/dashboard/teams", label: "Student Teams", svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: "/dashboard/nonprofits", label: "Nonprofits", svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg> },
];

const workspaceItems = [
  { href: "/dashboard/settings", label: "Settings", adminOnly: true, svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> },
  { href: "/dashboard/deployments", label: "Deployments", superAdminOnly: true, svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg> },
  { href: "/dashboard/logs", label: "System Logs", superAdminOnly: true, svg: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg> },
];

function NavLink({ href, label, svg, pathname, exact, onClick }: {
  href: string;
  label: string;
  svg: React.ReactNode;
  pathname: string;
  exact?: boolean;
  onClick?: () => void;
}) {
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-3 py-2 text-[11px] font-mono uppercase tracking-widest font-semibold transition-colors border-l-2 ${
        isActive
          ? "bg-accent/10 border-primary text-primary"
          : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <div className={`w-4 h-4 mr-3 flex-shrink-0 flex items-center justify-center ${isActive ? "text-primary" : "text-muted-foreground"}`}>
        {svg}
      </div>
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
  const { session, isPending, isStudent, isAdmin, isSuperAdmin } = useUserRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when pathname changes (navigation)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  const breadcrumbSegments = pathname.split('/').filter(Boolean);
  const formattedBreadcrumbs = breadcrumbSegments.map(segment => 
    segment.charAt(0).toUpperCase() + segment.slice(1)
  ).join(' / ');

  const userInitials = session.user?.name ? session.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 md:w-60 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shadow-sm z-50 fixed md:relative h-full transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Logo Area */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-border shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary flex items-center justify-center text-white font-mono font-bold text-xs">
              G
            </div>
            <span className="text-sm font-mono font-bold uppercase tracking-widest">Ghosted</span>
          </Link>
          <button 
            className="md:hidden text-muted-foreground hover:text-foreground p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Links */}
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
            ))}
          </div>

          {/* Program Section */}
          <div>
            <h3 className="px-3 text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2">Program</h3>
            <div className="space-y-1">
              {programItems.map((item) => (
                <NavLink key={item.href} {...item} pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
              ))}
            </div>
          </div>

          {/* Workspace Section */}
          <div>
            <h3 className="px-3 text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2">Workspace</h3>
            <div className="space-y-1">
              {workspaceItems.map((item: any) => {
                if (item.adminOnly && !isAdmin) return null;
                if (item.superAdminOnly && !isSuperAdmin) return null;
                return <NavLink key={item.href} {...item} pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />;
              })}
            </div>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-border mt-auto shrink-0 bg-sidebar">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <button className="w-full flex items-center space-x-3 p-2 hover:bg-muted transition-colors text-left border border-transparent hover:border-border outline-none">
                 <div className="h-8 w-8 bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold shrink-0">
                   {userInitials}
                 </div>
                 <div className="flex flex-col min-w-0 flex-1">
                   <span className="text-xs font-mono font-semibold uppercase tracking-tight text-foreground truncate">{session.user?.name || 'User'}</span>
                   <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground truncate">
                     {isAdmin ? 'Admin' : 'Org'}
                   </span>
                 </div>
               </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-none font-mono uppercase tracking-widest" align="start" side="right" sideOffset={8}>
              <DropdownMenuLabel className="text-xs">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!isStudent && (
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="text-[10px] cursor-pointer">
                  Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={async () => {
                  await authClient.signOut();
                  window.location.href = "/login";
                }} 
                className="text-[10px] text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 bg-background w-full">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-20 w-full">
          <div className="flex items-center min-w-0">
            <button 
              className="md:hidden mr-3 sm:mr-4 text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-muted-foreground truncate">
              {formattedBreadcrumbs || 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="SEARCH..." 
                className="pl-9 pr-4 py-1.5 h-8 border border-input bg-background text-[11px] font-mono uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-ring w-48 transition-all focus:w-64"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground relative p-1.5 rounded-md hover:bg-muted transition-colors outline-none">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-none font-mono" align="end" sideOffset={8}>
                <DropdownMenuLabel className="uppercase tracking-widest text-xs">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-4 text-center text-muted-foreground text-[10px] uppercase tracking-widest">
                  No new notifications
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
