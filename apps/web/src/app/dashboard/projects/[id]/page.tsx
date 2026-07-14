"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { useParams } from "next/navigation"
import { ActivityFeed } from "@/components/activity-feed"
import { ProjectChat } from "./_components/project-chat"

export default function ProjectOverviewPage() {
  const params = useParams()
  const id = params.id as string

  const { data: project, isLoading } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => fetchApi<any>(`/projects/${id}`),
  })

  if (isLoading) return (
    <div className="py-12 flex justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin opacity-50"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    </div>
  )
  if (!project) return <div className="py-12 text-center text-muted-foreground">Project not found.</div>

  const mockActivity = [
    { id: "1", title: "Project Created", description: "The project workspace was initialized.", timestamp: "2 days ago" },
    { id: "2", title: "Team Assigned", description: "Team Alpha was assigned to this project.", timestamp: "1 day ago" },
  ]

  return (
    <div className="grid gap-[22px] md:grid-cols-3">
      
      <div className="md:col-span-2 space-y-[22px]">
        {/* Project Details */}
        <div className="bg-card border border-border rounded-[14px] p-[24px_32px] opacity-0 animate-fade-up">
          <div className="font-serif text-[19px] font-semibold mb-[20px] pb-[12px] border-b border-border">
            Project Details
          </div>
          
          <div className="space-y-[24px]">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-[8px]">Description</h3>
              <p className="text-[14px] text-foreground leading-relaxed">{project.description || "No description provided."}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-[16px] pt-[16px] border-t border-border">
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-[8px]">Status</h3>
                <div className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-[20px] text-[11.5px] font-semibold bg-[#E1EAE1] text-[#355940]">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5"/></svg>
                  {project.status?.replace(/_/g, " ")}
                </div>
              </div>
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-[8px]">Repository URL</h3>
                <p className="text-[13px] text-primary hover:underline cursor-pointer font-mono font-medium">
                  {project.githubRepoUrl || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Chat Room */}
        <div className="opacity-0 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <ProjectChat projectId={id} />
        </div>
      </div>

      <div className="space-y-[22px]">
        {/* Stakeholders */}
        <div className="bg-card border border-border rounded-[14px] p-[24px_32px] opacity-0 animate-fade-up" style={{ animationDelay: '50ms' }}>
          <div className="font-serif text-[19px] font-semibold mb-[20px] pb-[12px] border-b border-border">
            Stakeholders
          </div>
          
          <div className="space-y-[16px]">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-[4px]">Nonprofit</h3>
              <p className="font-sans font-medium text-[14px] text-foreground">{project.nonprofit?.name || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-[4px]">Team</h3>
              <p className="font-sans font-medium text-[14px] text-foreground">{project.team?.name || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-[4px]">Cohort</h3>
              <p className="font-sans font-medium text-[14px] text-foreground">{project.cohort?.name || "Not assigned"}</p>
            </div>
          </div>
        </div>
        
        <div className="opacity-0 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <ActivityFeed items={mockActivity} />
        </div>
      </div>
      
    </div>
  )
}
