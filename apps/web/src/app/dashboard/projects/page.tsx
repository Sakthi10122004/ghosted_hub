"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import Link from "next/link";
import { useUserRole } from "@/hooks/use-user-role";
import { CreateProjectDialog } from "./_components/create-project-dialog";
import { useState } from "react";
import { Search } from "lucide-react";

export default function ProjectsPage() {
  const { isAdmin } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchApi<{ data: any[] }>("/projects"),
  });

  const projects = data?.data || [];
  
  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || 
           (p.nonprofit?.name || "").toLowerCase().includes(q) ||
           (p.cohort?.name || "").toLowerCase().includes(q);
  });

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

  return (
    <div className="max-w-[1320px] mx-auto pb-16">
      
      {/* Header Row */}
      <div className="flex justify-between items-end mb-[30px] relative">
        <div className="relative">
          <svg className="absolute left-[-6px] top-[-22px] opacity-50 z-0 animate-dash" style={{ strokeDasharray: 340, strokeDashoffset: 340, animationDelay: '500ms' }} width="70" height="34" viewBox="0 0 70 34" fill="none">
            <path d="M2 22C10 8 18 30 26 16S42 4 50 18s14-6 18 2" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase font-semibold mb-[6px] opacity-0 animate-fade-up">
            Program Workspace
          </div>
          <h1 className="font-serif font-medium text-[36px] m-0 text-foreground relative z-10 opacity-0 animate-fade-up" style={{ animationDelay: '70ms' }}>
            Projects
          </h1>
        </div>
        
        {isAdmin && <CreateProjectDialog />}
      </div>

      <div className="flex justify-between items-end mb-[14px]">
        <div className="font-serif text-[19px] font-semibold flex items-center gap-[10px]">
          All Active Projects
          <span className="text-[11px] font-mono bg-muted text-muted-foreground px-[6px] py-[2px] rounded-[4px] border border-border tracking-widest">{projects.length}</span>
        </div>
        <div className="flex items-center gap-[8px] bg-card border border-border rounded-[9px] px-[12px] py-[7px] w-[260px] text-muted-foreground text-[12.5px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all opacity-0 animate-fade-up">
          <Search className="w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="border-none outline-none bg-transparent font-sans text-[13px] w-full text-foreground placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-[14px] overflow-hidden mb-[36px] opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="grid grid-cols-[2.1fr_2.3fr_1fr_1fr] p-[12px_22px] text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground font-semibold border-b border-border bg-muted/30">
          <div>Project</div>
          <div>Lifecycle</div>
          <div>Team</div>
          <div className="text-right">Status</div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin mb-3 opacity-50"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-20 mb-3"><path d="M12 2C7 2 4 6 4 11v9l3-2.5L9.5 20l2.5-2 2.5 2 2.5-2.5L20 20v-9c0-5-3-9-8-9z" fill="currentColor"/></svg>
            No projects found.
          </div>
        ) : (
          filteredProjects.map((project) => {
            const stage = getStageInfo(project.status);
            return (
              <Link href={`/dashboard/projects/${project.id}`} key={project.id} className="grid grid-cols-[2.1fr_2.3fr_1fr_1fr] p-[18px_22px] items-center border-b border-border last:border-0 hover:bg-muted/40 hover:-translate-y-[2px] hover:shadow-md hover:z-10 transition-all group">
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
                        <div key={step} className={segClass} style={{ animationDelay: '100ms' }}></div>
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
                    {(!project.team?.members || project.team.members.length === 0) && (
                      <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest text-[10px]">Unassigned</span>
                    )}
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
  );
}
