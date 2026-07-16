"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useUserRole } from "@/hooks/use-user-role";
import { authClient } from "@/lib/auth-client";
import { Menu, X, Check, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", label: "Dashboard", exact: true, svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg> },
  { href: "/dashboard/projects", label: "Projects", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /></svg> },
  { href: "/dashboard/reviews", label: "Reviews", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg> },
  { href: "/dashboard/files", label: "Files", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M13 2v7h7" /></svg> },
];

const programItems = [
  { href: "/dashboard/cohorts", label: "Cohorts", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg> },
  { href: "/dashboard/teams", label: "Student Teams", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" /><circle cx="17.5" cy="9" r="2.4" /><path d="M15.5 13.5c2.7.3 4.8 2.4 5 5.2" /></svg> },
  { href: "/dashboard/nonprofits", label: "Nonprofits", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 22V6l8-4 8 4v16" /><path d="M9 22v-6h6v6" /><path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" /></svg> },
];

const workspaceItems = [
  { href: "/dashboard/settings", label: "Settings", adminOnly: true, svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg> },
  { href: "/dashboard/deployments", label: "Deployments", superAdminOnly: true, svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.08-2.92a2.18 2.18 0 0 0-2.92-.08z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /></svg> },
  { href: "/dashboard/logs", label: "System Logs", superAdminOnly: true, svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 15h6M9 11h6M9 19h3" /></svg> },
];

function NavLink({ href, label, svg, pathname, exact, onClick, delayIndex }: {
  href: string;
  label: string;
  svg: React.ReactNode;
  pathname: string;
  exact?: boolean;
  onClick?: () => void;
  delayIndex: number;
}) {
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      style={{ '--i': delayIndex } as any}
      className={`flex items-center gap-[11px] py-[9px] rounded-[8px] text-[13.5px] mb-[2px] transition-colors border-l-2 opacity-0 animate-slide-in-left ${isActive
          ? "bg-[#1D2A27] text-[#7FCBB9] border-primary pl-2 pr-2.5"
          : "text-[#C9C6D6] border-transparent px-[10px] hover:bg-[#201F27] hover:text-[#EFEDE6]"
        }`}
    >
      <div className={`shrink-0 ${isActive ? "opacity-100" : "opacity-75"}`}>
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
  const queryClient = useQueryClient();
  const { session, isPending, isStudent, isAdmin, isSuperAdmin } = useUserRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchApi<{ data: any[] }>("/notifications"),
    enabled: !!session,
    refetchInterval: 10000, // Poll every 10s for new notifications
  });

  const notifications = notifData?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => fetchApi('/notifications/read-all', { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => fetchApi('/notifications/clear-all', { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

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
    return null;
  }

  const breadcrumbSegments = pathname.split('/').filter(Boolean);
  const formattedBreadcrumbs = breadcrumbSegments.map(segment =>
    segment.charAt(0).toUpperCase() + segment.slice(1)
  ).join(' / ');

  const userInitials = session.user?.name ? session.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden app-grid md:grid md:grid-cols-[250px_1fr]">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`bg-sidebar text-[#EFEDE6] flex flex-col p-[22px_16px_20px] relative overflow-hidden z-50 fixed md:relative h-full w-[250px] transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Brand */}
        <div className="flex items-center gap-[10px] p-[4px_6px_26px]">
          <div className="w-[34px] h-[34px] rounded-[10px] overflow-hidden bg-white flex items-center justify-center shrink-0 border border-white/10 shadow-sm relative group cursor-pointer">
            <img src="/logo.jpg" alt="Ghosted Logo" className="w-[120%] h-[120%] object-cover object-center transform group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="font-serif font-semibold text-[20px] tracking-wide text-white">Ghosted</div>
          <button
            className="md:hidden ml-auto text-muted-foreground hover:text-white p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          <div className="mb-[22px]">
            {navItems.map((item, i) => (
              <NavLink key={item.href} {...item} pathname={pathname} delayIndex={i} onClick={() => setIsMobileMenuOpen(false)} />
            ))}
          </div>

          {isAdmin && (
            <div className="mb-[22px]">
              <div className="text-[10.5px] tracking-[0.14em] text-[#726F7E] uppercase px-[10px] pb-[8px] font-semibold">Program</div>
              {programItems.map((item, i) => (
                <NavLink key={item.href} {...item} pathname={pathname} delayIndex={i + 4} onClick={() => setIsMobileMenuOpen(false)} />
              ))}
            </div>
          )}

          {isAdmin && (
            <div className="mb-[22px]">
              <div className="text-[10.5px] tracking-[0.14em] text-[#726F7E] uppercase px-[10px] pb-[8px] font-semibold">Workspace</div>
              {workspaceItems.map((item: any, i) => {
                if (item.adminOnly && !isAdmin) return null;
                if (item.superAdminOnly && !isSuperAdmin) return null;
                return <NavLink key={item.href} {...item} pathname={pathname} delayIndex={i + 7} onClick={() => setIsMobileMenuOpen(false)} />;
              })}
            </div>
          )}
        </div>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-[10px] p-[12px_10px] border-t border-[#38363F] mt-[8px] hover:bg-[#201F27] transition-colors rounded-[8px] outline-none text-left w-full relative z-10">
              <div className="w-[30px] h-[30px] rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[12px] font-bold font-mono shrink-0">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#EFEDE6] truncate">{session.user?.name || 'User'}</span>
                <span className="text-[10.5px] text-[#8B889A] tracking-[0.05em] uppercase truncate">
                  {isAdmin ? 'Admin' : 'Org'}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl font-mono uppercase tracking-widest bg-card border-border shadow-sm p-1" align="center" side="right" sideOffset={12}>
            <DropdownMenuItem onClick={() => router.push('/dashboard/account')} className="text-[10.5px] cursor-pointer font-bold px-3 py-2 rounded-lg hover:bg-muted focus:bg-muted">
              My Account
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border my-1" />
            {!isStudent && (
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="text-[10.5px] cursor-pointer px-3 py-2 rounded-lg hover:bg-muted focus:bg-muted">
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-border my-1" />
            <DropdownMenuItem
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/login";
              }}
              className="text-[10.5px] text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer px-3 py-2 rounded-lg"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <svg className="absolute -right-[18px] bottom-[60px] opacity-[0.055] pointer-events-none" width="180" height="180" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C7 2 4 6 4 11v9l3-2.5L9.5 20l2.5-2 2.5 2 2.5-2.5L20 20v-9c0-5-3-9-8-9z" fill="#F5F3EE" />
        </svg>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full h-full overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between py-[16px] px-[20px] md:px-[32px] border-b border-border bg-background shrink-0 w-full z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-[11px] tracking-[0.14em] text-muted-foreground font-semibold uppercase truncate">
              {formattedBreadcrumbs || 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center gap-[14px]">
            <div className="hidden lg:flex items-center gap-[8px] bg-card border border-border rounded-[9px] px-[12px] py-[7px] w-[260px] text-muted-foreground text-[12.5px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
              <input
                type="text"
                placeholder="Search projects, files, people..."
                className="border-none outline-none bg-transparent font-sans text-[13px] w-full text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = e.currentTarget.value.trim();
                    if (query) {
                      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
                      setIsMobileMenuOpen(false);
                    }
                  }
                }}
              />
              <span className="font-mono text-[10px] bg-background border border-border rounded-[4px] px-[5px] py-[1px] text-muted-foreground">⌘K</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-[34px] h-[34px] rounded-[9px] border border-border flex items-center justify-center relative bg-card shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
                  <Bell className="w-4 h-4 text-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-[6px] right-[6px] w-[8px] h-[8px] rounded-full bg-destructive shadow-sm border border-card flex items-center justify-center">
                    </span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[360px] p-0 overflow-hidden border-border bg-card shadow-lg rounded-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Notifications</span>
                    {unreadCount > 0 && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono">{unreadCount} new</span>}
                  </div>
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllAsReadMutation.mutate();
                          }}
                          disabled={markAllAsReadMutation.isPending}
                          className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllMutation.mutate();
                        }}
                        disabled={clearAllMutation.isPending}
                        className="text-[11px] font-semibold text-muted-foreground hover:text-destructive transition-colors uppercase tracking-wider"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                      <Bell className="w-8 h-8 opacity-20" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif: any) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.isRead) markReadMutation.mutate(notif.id);
                          if (notif.link) router.push(notif.link);
                        }}
                        className={`flex gap-3 p-4 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {!notif.isRead ? (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_var(--primary)]" />
                          ) : (
                            <Check className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className={`text-sm ${!notif.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                            {notif.title}
                          </span>
                          <span className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-background p-[20px] md:p-[32px] pt-[24px] md:pt-[40px]">
          {children}
        </div>
      </main>
    </div>
  );
}
