"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import Link from "next/link";
import { useUserRole } from "@/hooks/use-user-role";
import { format } from "date-fns";

export default function DashboardPage() {
  const { session, isAdmin, isStudent, isPending: rolePending } = useUserRole();
  const userName = session?.user?.name?.split(" ")[0] || "User";
  const [formattedWeek, setFormattedWeek] = React.useState("Week of ...");
  React.useEffect(() => {
    setFormattedWeek(`Week of ${format(new Date(), "MMM d")}`);
  }, []);

  // Fetch projects (backend already scopes for students)
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["dashboard-projects"],
    queryFn: () => fetchApi<{ data: any[]; meta: any }>("/projects?limit=10"),
  });

  // Admin-only metrics
  const { data: teamsData } = useQuery({
    queryKey: ["dashboard-teams"],
    queryFn: () => fetchApi<{ data: any[] }>("/teams"),
    enabled: isAdmin,
  });

  const { data: cohortsData } = useQuery({
    queryKey: ["dashboard-cohorts"],
    queryFn: () => fetchApi<{ data: any[] }>("/cohorts"),
    enabled: isAdmin,
  });

  const { data: nonprofitsData } = useQuery({
    queryKey: ["dashboard-nonprofits"],
    queryFn: () => fetchApi<{ data: any[] }>("/nonprofits"),
    enabled: isAdmin,
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: () => fetchApi<{ data: any[] }>("/activity?mine=true"),
    enabled: !rolePending,
    refetchInterval: 15000,
  });

  const projects = projectsData?.data || [];
  const activities = activityData?.data || [];
  const totalProjects = projects.length;
  const totalTeams = teamsData?.data?.length || 0;
  const totalCohorts = cohortsData?.data?.length || 0;
  const totalNonprofits = nonprofitsData?.data?.length || 0;

  const isLoading = rolePending || projectsLoading;

  // Helper to get initials
  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const getStageInfo = (status: string) => {
    const stages: Record<string, { label: string; filled: number }> = {
      CREATED: { label: "Discovery", filled: 1 },
      DISCOVERY: { label: "Discovery", filled: 1 },
      DEVELOPMENT: { label: "Build", filled: 2 },
      INTERNAL_REVIEW: { label: "Review", filled: 3 },
      REVISION: { label: "Review", filled: 3 },
      NONPROFIT_REVIEW: { label: "Review", filled: 3 },
      FINAL_DELIVERABLES: { label: "Review", filled: 3 },
      DEPLOYMENT_DECISION: { label: "Launch", filled: 4 },
      COMPLETED: { label: "Launch", filled: 4 },
    };
    return stages[status] || { label: "Discovery", filled: 1 };
  };

  const attentionItems = projects.filter(p => ["BLOCKED", "REVISION", "INTERNAL_REVIEW"].includes(p.status)).slice(0, 3);
  const displayAttention = attentionItems;

  if (isLoading) {
    return <div className="h-[60vh] flex items-center justify-center text-muted-foreground font-mono text-sm uppercase tracking-widest">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin mr-3 opacity-50"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      Loading workspace...
    </div>;
  }

  return (
    <div className="max-w-[1320px] mx-auto pb-16">
      
      {/* Header Row */}
      <div className="flex justify-between items-end mb-[30px] relative">
        <div className="relative">
          <svg className="absolute left-[-6px] top-[-22px] opacity-50 z-0 animate-dash" style={{ strokeDasharray: 340, strokeDashoffset: 340, animationDelay: '500ms' }} width="70" height="34" viewBox="0 0 70 34" fill="none">
            <path d="M2 22C10 8 18 30 26 16S42 4 50 18s14-6 18 2" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <svg className="absolute left-[210px] top-[-14px] pointer-events-none animate-twinkle" style={{ animationDelay: '.3s' }} width="16" height="16" viewBox="0 0 24 24" fill="var(--primary)"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>
          <svg className="absolute left-[296px] top-[8px] pointer-events-none animate-twinkle" style={{ animationDelay: '1.1s' }} width="10" height="10" viewBox="0 0 24 24" fill="var(--status-attention)"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>
          
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase font-semibold mb-[6px] opacity-0 animate-fade-up">
            {isStudent ? "Your Workspace" : `Status report · ${formattedWeek}`}
          </div>
          <h1 className="font-serif font-medium italic text-[36px] m-0 text-foreground relative z-10 opacity-0 animate-fade-up" style={{ animationDelay: '70ms' }}>
            {isStudent ? `Welcome, ${userName}.` : `Good morning, ${userName}.`}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="inline-block align-[-2px] ml-[2px] animate-float-y">
              <path d="M12 3C8 3 5.5 6 5.5 10v8l2.3-2 1.9 2 2.3-1.8 2.3 1.8 1.9-2 2.3 2v-8C18.5 6 16 3 12 3z" fill="var(--primary)" opacity="0.4"/>
              <circle cx="9.6" cy="10" r="1" fill="var(--primary)"/>
              <circle cx="14.4" cy="10" r="1" fill="var(--primary)"/>
            </svg>
          </h1>
        </div>
        
        {isAdmin && (
          <Link href="/dashboard/projects" className="inline-flex items-center gap-[8px] bg-primary text-primary-foreground border-none rounded-[9px] px-[18px] py-[11px] font-sans font-semibold text-[13px] cursor-pointer shadow-[0_1px_0_rgba(0,0,0,0.06)] transition-all hover:bg-primary/90 hover:shadow-[0_0_0_9px_rgba(14,107,92,0)] opacity-0 animate-pop-in active:translate-y-[1px]" style={{ animationDelay: '220ms' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14"/></svg>
            New Project
          </Link>
        )}
      </div>

      {/* Signature: ATTENTION RAIL */}
      {displayAttention.length > 0 && (
        <div className="bg-sidebar rounded-[16px] p-[20px_22px] mb-[22px] text-sidebar-foreground relative overflow-hidden opacity-0 animate-fade-up shadow-sm border border-border" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between gap-[10px] mb-[14px]">
            <div className="flex items-center gap-[9px] text-[13px] font-semibold tracking-[0.02em] text-status-attention">
              <span className="w-[7px] h-[7px] rounded-full bg-status-attention shadow-[0_0_0_0_rgba(181,132,42,0.5)] animate-[pulse_2.4s_infinite]"></span>
              Needs your attention
            </div>
            <div className="font-mono text-[11px] text-sidebar-foreground/70">{displayAttention.length} open items</div>
          </div>
          <div className="flex flex-col gap-[2px]">
            {displayAttention.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between p-[11px_4px] border-t border-sidebar-border text-[13.5px] opacity-0 animate-slide-in-right" style={{ animationDelay: `${i * 110 + 160}ms` }}>
                <div className="flex items-center gap-[11px]">
                  <span className={`w-[8px] h-[8px] rounded-[2px] shrink-0 ${item.status === 'BLOCKED' ? 'bg-status-blocked animate-wiggle-infinite' : 'bg-status-attention'}`}></span>
                  <span>
                    <span className="text-sidebar-foreground font-semibold">{item.name}</span>
                    <span className="text-sidebar-foreground/60 ml-[6px]">— action required</span>
                  </span>
                </div>
                <Link href={`/dashboard/projects/${item.id}`} className="text-primary text-[12px] font-semibold whitespace-nowrap flex items-center gap-[4px] hover:text-primary/80 hover:gap-[8px] transition-all">
                  Resolve →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAT ROW */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] mb-[34px]">
          {[
            { label: 'Active Projects', icon: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>, value: totalProjects, sub: 'across all cohorts' },
            { label: 'Student Teams', icon: <g><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2"/></g>, value: totalTeams, sub: 'registered teams' },
            { label: 'Cohorts', icon: <path d="M12 2 2 7l10 5 10-5-10-5z"/>, value: totalCohorts, sub: 'program cycles' },
            { label: 'Nonprofits', icon: <path d="M4 22V6l8-4 8 4v16"/>, value: totalNonprofits, sub: 'partner organizations' }
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-[14px] p-[18px_20px] opacity-0 animate-fade-up hover:-translate-y-[3px] hover:shadow-[0_10px_22px_-16px_rgba(22,21,26,0.35)] transition-all group" style={{ animationDelay: `${i * 90 + 260}ms` }}>
              <div className="flex justify-between items-start mb-[14px]">
                <div className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground font-semibold">{stat.label}</div>
                <div className="w-[28px] h-[28px] rounded-[7px] bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 group-hover:animate-wiggle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{stat.icon}</svg>
                </div>
              </div>
              <div className="font-serif text-[30px] font-medium text-foreground leading-none animate-count-glow" style={{ animationDelay: '500ms' }}>{stat.value}</div>
              <div className="text-[12px] text-muted-foreground mt-[6px]">{stat.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* LOWER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[22px] items-start relative">
        <svg className="absolute right-[6px] top-[-58px] opacity-50 animate-float-y pointer-events-none hidden lg:block" width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M12 3C8 3 5.5 6 5.5 10v8l2.3-2 1.9 2 2.3-1.8 2.3 1.8 1.9-2 2.3 2v-8C18.5 6 16 3 12 3z" fill="var(--primary)"/>
          <circle cx="9.6" cy="10" r="1" fill="var(--background)"/>
          <circle cx="14.4" cy="10" r="1" fill="var(--background)"/>
        </svg>

        {/* Project Table */}
        <div>
          <div className="flex justify-between items-baseline mb-[14px] relative">
            <div className="font-serif text-[19px] font-semibold">
              Project Index
              <svg width="86" height="10" viewBox="0 0 86 10" fill="none" className="block mt-[2px]">
                <path className="animate-dash opacity-[0.55]" style={{ strokeDasharray: 100, strokeDashoffset: 100, animationDelay: '.9s' }} d="M2 6c6-6 12 4 18-2s12 4 18-2 12 4 18-2 12 4 18-2 12 4 10 0" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-[12px] text-muted-foreground">Sorted by last activity</div>
          </div>

          <div className="bg-card border border-border rounded-[14px] overflow-hidden mb-[36px]">
            <div className="grid grid-cols-[2.1fr_2.3fr_1fr_1fr] p-[12px_22px] text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground font-semibold border-b border-border bg-muted/30">
              <div>Project</div>
              <div>Lifecycle</div>
              <div>Team</div>
              <div className="text-right">Status</div>
            </div>

            {projects.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-20 mb-3"><path d="M12 2C7 2 4 6 4 11v9l3-2.5L9.5 20l2.5-2 2.5 2 2.5-2.5L20 20v-9c0-5-3-9-8-9z" fill="currentColor"/></svg>
                {isStudent ? "No active projects found." : "No projects created yet."}
              </div>
            ) : (
              projects.map((project, i) => {
                const stage = getStageInfo(project.status);
                return (
                  <Link href={`/dashboard/projects/${project.id}`} key={project.id} className="grid grid-cols-[2.1fr_2.3fr_1fr_1fr] p-[18px_22px] items-center border-b border-border last:border-0 hover:bg-muted/30 hover:-translate-y-[2px] hover:shadow-md hover:z-10 transition-all opacity-0 animate-fade-up group" style={{ animationDelay: `${i * 100 + 420}ms` }}>
                    <div>
                      <div className="font-serif text-[16.5px] font-semibold text-foreground group-hover:text-primary-foreground/90 transition-colors">{project.name}</div>
                      <div className="text-[12px] text-muted-foreground mt-[2px]">{project.nonprofit?.name || "Unassigned NPO"}</div>
                    </div>
                    
                    <div className="flex flex-col gap-[6px] pr-8">
                      <div className="flex gap-[4px] origin-left">
                        {[1, 2, 3, 4].map((step) => {
                          let segClass = "flex-1 h-[5px] rounded-[3px] bg-border relative";
                          if (step < stage.filled) segClass = "flex-1 h-[5px] rounded-[3px] bg-primary relative animate-grow-seg origin-left scale-x-0";
                          if (step === stage.filled) segClass = "flex-1 h-[5px] rounded-[3px] bg-primary relative overflow-visible animate-grow-seg origin-left scale-x-0 after:content-[''] after:absolute after:-right-[2px] after:-top-[2.5px] after:w-[10px] after:h-[10px] after:rounded-full after:bg-primary after:border-[2px] after:border-card";
                          return (
                            <div key={step} className={segClass} style={{ animationDelay: '700ms' }}></div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[9.5px] text-muted-foreground font-mono tracking-[0.02em]">
                        <span className={stage.filled === 1 ? 'text-secondary-foreground font-semibold' : ''}>Discovery</span>
                        <span className={stage.filled === 2 ? 'text-secondary-foreground font-semibold' : ''}>Build</span>
                        <span className={stage.filled === 3 ? 'text-secondary-foreground font-semibold' : ''}>Review</span>
                        <span className={stage.filled === 4 ? 'text-secondary-foreground font-semibold' : ''}>Launch</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-[8px]">
                      <div className="flex">
                        {project.team?.members?.slice(0, 3).map((member: any) => (
                          <div key={member.user.id} className="w-[26px] h-[26px] rounded-full bg-secondary text-secondary-foreground font-mono text-[10.5px] font-bold flex items-center justify-center border-[2px] border-card -ml-[8px] first:ml-0 hover:-translate-y-[3px] hover:scale-105 hover:z-20 transition-transform">
                            {getInitials(member.user.name)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center gap-[6px] p-[5px_11px] rounded-[20px] text-[11.5px] font-semibold justify-self-end ${
                        project.status === 'BLOCKED' ? 'bg-destructive/10 text-destructive' :
                        ['REVISION', 'INTERNAL_REVIEW'].includes(project.status) ? 'bg-status-attention/10 text-status-attention' :
                        'bg-status-on-track/10 text-status-on-track'
                      }`}>
                        {project.status === 'BLOCKED' ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
                        ) : ['REVISION', 'INTERNAL_REVIEW'].includes(project.status) ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5"/></svg>
                        )}
                        {project.status === "CREATED" ? "On Track" : project.status?.replace(/_/g, " ")}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Activity Panel */}
        <div>
          <div className="flex justify-between items-baseline mb-[14px]">
            <div className="font-serif text-[16px] font-semibold">Your Activity</div>
          </div>
          <div className="bg-card border border-border rounded-[14px] p-[18px_20px] relative min-h-[300px]">
            <svg width="2" height="88%" className="absolute left-[23px] top-[22px]">
              <line className="animate-dash" style={{ strokeDasharray: 200, strokeDashoffset: 200, animationDelay: '.6s' }} x1="1" y1="0" x2="1" y2="100%" stroke="var(--border)" strokeWidth="2"></line>
            </svg>
            
            {activityLoading ? (
              <div className="p-8 flex justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin text-muted-foreground"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-20 mb-3"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-7.5v-5h2v5h-2zm0 2h2v2h-2v-2z" fill="currentColor"/></svg>
                No recent activity.
              </div>
            ) : (
              <div className="flex flex-col gap-5 relative z-10">
                {activities.map((act: any, idx: number) => {
                  let colorClass = "text-muted-foreground";
                  if (act.action.includes('review')) {
                    colorClass = "text-status-on-track";
                  } else if (act.action.includes('project')) {
                    colorClass = "text-primary";
                  } else if (act.action.includes('delete')) {
                    colorClass = "text-destructive";
                  } else if (act.action.includes('upload') || act.action.includes('create')) {
                    colorClass = "text-status-on-track";
                  }

                  // Format action text nicely
                  const actionText = act.action
                    .replace(/\./g, ' ')
                    .replace(/_/g, ' ')
                    .replace(/^(\w)/, (_: string, c: string) => c.toUpperCase());

                  return (
                    <div key={act.id} className="flex gap-[24px] opacity-0 animate-fade-up group" style={{ animationDelay: `${idx * 80 + 300}ms` }}>
                      <div className="w-[8px] shrink-0 flex justify-center mt-1.5">
                        <div className={`w-[6px] h-[6px] rounded-full ring-4 ring-card ${colorClass === 'text-muted-foreground' ? 'bg-border' : `bg-current ${colorClass}`}`} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="text-[13px] font-medium text-foreground truncate">
                          {actionText}
                        </div>
                        <div className="text-[11.5px] text-muted-foreground truncate mt-0.5">
                          {act.entityType ? `on ${act.entityType}` : ""}
                        </div>
                        <div className="text-[10px] text-muted-foreground/60 font-mono mt-1 uppercase">
                          {format(new Date(act.createdAt), "MMM d, h:mm a")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
