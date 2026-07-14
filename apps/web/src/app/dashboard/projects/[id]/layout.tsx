"use client";

import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";

export default function ProjectWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const pathname = usePathname();

  const { data: project } = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => fetchApi<any>(`/projects/${projectId}`),
  });

  const tabs = [
    { name: "Overview", href: `/dashboard/projects/${projectId}` },
    { name: "Discovery", href: `/dashboard/projects/${projectId}/discovery` },
    { name: "Tasks", href: `/dashboard/projects/${projectId}/tasks` },
    { name: "Files", href: `/dashboard/projects/${projectId}/files` },
    { name: "Reviews", href: `/dashboard/projects/${projectId}/reviews` },
    { name: "Deliverables", href: `/dashboard/projects/${projectId}/deliverables` },
  ];
  
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

  const stage = getStageInfo(project?.status || "CREATED");

  return (
    <div className="max-w-[1320px] mx-auto pb-16 pt-8">
      
      {/* Signature Element: Persistent Lifecycle Rail */}
      <div className="mb-[36px] bg-card border border-border rounded-[14px] p-[24px_32px] opacity-0 animate-fade-up">
        <div className="flex flex-col gap-[12px]">
          <div className="flex justify-between text-[11px] text-muted-foreground font-mono tracking-[0.04em] uppercase mb-[4px]">
            <span className={stage.filled >= 1 ? 'text-primary font-bold' : ''}>Discovery</span>
            <span className={stage.filled >= 2 ? 'text-primary font-bold' : ''}>Build</span>
            <span className={stage.filled >= 3 ? 'text-primary font-bold' : ''}>Review</span>
            <span className={stage.filled >= 4 ? 'text-primary font-bold' : ''}>Launch</span>
          </div>
          
          <div className="flex gap-[6px] origin-left">
            {[1, 2, 3, 4].map((step) => {
              let segClass = "flex-1 h-[8px] rounded-[4px] bg-border relative";
              if (step < stage.filled) {
                segClass = "flex-1 h-[8px] rounded-[4px] bg-primary relative animate-grow-seg origin-left scale-x-0";
              }
              if (step === stage.filled) {
                segClass = "flex-1 h-[8px] rounded-[4px] bg-primary relative overflow-visible animate-grow-seg origin-left scale-x-0 after:content-[''] after:absolute after:-right-[3px] after:-top-[3px] after:w-[14px] after:h-[14px] after:rounded-full after:bg-primary after:border-[3px] after:border-card";
              }
              return (
                <div key={step} className={segClass} style={{ animationDelay: '300ms' }}></div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-1 mb-[24px] relative">
        <h1 className="text-[32px] font-serif font-semibold text-foreground opacity-0 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {project?.name || "Loading Project..."}
        </h1>
        <p className="text-[13px] text-muted-foreground opacity-0 animate-fade-up" style={{ animationDelay: '150ms' }}>
          Workspace for {project?.team?.name || "your team"} and {project?.nonprofit?.name || "the partner organization"}.
        </p>
      </div>

      <div className="border-b border-border mb-[24px] opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`whitespace-nowrap py-3 px-1 border-b-2 text-[13px] font-sans font-semibold transition-colors
                  ${isActive 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="opacity-0 animate-fade-up" style={{ animationDelay: '300ms' }}>
        {children}
      </div>
    </div>
  );
}
