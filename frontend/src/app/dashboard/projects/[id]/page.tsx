"use client"

import { motion } from "motion/react"

import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { useParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ActivityFeed } from "@/components/activity-feed"
import { ProjectChat } from "./_components/project-chat"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useConfirm } from "@/hooks/use-confirm"
import { useAlert } from "@/hooks/use-alert"

export default function ProjectOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: project, isLoading } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => fetchApi<any>(`/projects/${id}`),
  })
  const { data: session } = authClient.useSession()
  const [ConfirmDialog, confirm] = useConfirm()
  const [AlertDialogComponent, customAlert] = useAlert()

  if (isLoading) return (
    <div className="py-12 flex justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin opacity-50"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    </div>
  )
  if (!project) return <div className="py-12 text-center text-muted-foreground">Project not found.</div>

  const handleDelete = async () => {
    const ok = await confirm("Delete Project", "Are you sure you want to remove this project? This action cannot be undone.")
    if (!ok) return
    try {
      await fetchApi(`/projects/${id}`, { method: "DELETE" })
      router.push("/dashboard/projects")
    } catch (err) {
      console.error("Failed to delete project", err)
      customAlert("Error", "Failed to delete project")
    }
  }

  const mockActivity = [
    { id: "1", title: "Project Created", description: "The project workspace was initialized.", timestamp: "2 days ago" },
    { id: "2", title: "Team Assigned", description: "Team Alpha was assigned to this project.", timestamp: "1 day ago" },
  ]

  const userId = session?.user?.id
  const isStudentMember = project?.team?.members?.some((m: any) => m.userId === userId || m.user?.id === userId)
  const isNpoRep = project?.nonprofit?.contacts?.some((c: any) => c.userId === userId || c.user?.id === userId)
  const canDelete = session?.user && !isStudentMember && !isNpoRep

  return (
    <>
    <AlertDialogComponent />
    <ConfirmDialog />
    <motion.div 
      className="grid gap-[22px] md:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.15 }
        }
      }}
    >
      
      <div className="md:col-span-2 space-y-[22px]">
        {/* Project Details */}
        <motion.div 
          className="bg-card border border-border rounded-[14px] p-[24px_32px] shadow-sm hover:shadow-md transition-shadow"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
          }}
        >
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
        </motion.div>

        {/* Deliverables / Scope Placeholder */}
        <motion.div 
          className="bg-card border border-border rounded-[14px] p-[24px_32px] shadow-sm hover:shadow-md transition-shadow"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
          }}
        >
          <div className="font-serif text-[19px] font-semibold mb-[20px] pb-[12px] border-b border-border">
            Project Files
          </div>
          <div className="text-[13px] text-muted-foreground bg-muted/20 p-[24px] rounded-[9px] border border-dashed border-border/60 flex flex-col items-center justify-center gap-3">
            <p>Upload and manage project files, assets, and deliverables.</p>
            <Button variant="outline" onClick={() => router.push(`/dashboard/projects/${id}/files`)}>
              View Files Repository
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="space-y-[22px]">
        {/* Stakeholders */}
        <motion.div 
          className="bg-card border border-border rounded-[14px] p-[24px_32px]"
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
          }}
        >
          <div className="font-serif text-[19px] font-semibold mb-[20px] pb-[12px] border-b border-border">
            Stakeholders
          </div>
          
          <div className="space-y-[20px]">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-[8px]">Nonprofit</h3>
              {project.nonprofit ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 rounded-md border border-border">
                    <AvatarImage src={project.nonprofit.logoUrl} />
                    <AvatarFallback className="rounded-md">{project.nonprofit.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-sans font-medium text-[14px] text-foreground">{project.nonprofit.name}</p>
                </div>
              ) : (
                <p className="font-sans font-medium text-[14px] text-muted-foreground">Not assigned</p>
              )}
            </div>
            
            <div className="pt-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-[8px]">Student Team</h3>
              {project.team ? (
                <div>
                  <p className="font-sans font-medium text-[14px] text-foreground mb-3">{project.team.name}</p>
                  {project.team.members && project.team.members.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {project.team.members.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={m.user.avatarUrl} />
                            <AvatarFallback>{m.user.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <span>{m.user.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="font-sans font-medium text-[14px] text-muted-foreground">Not assigned</p>
              )}
            </div>
            
            <div className="pt-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-[4px]">Cohort</h3>
              <p className="font-sans font-medium text-[14px] text-foreground">{project.cohort?.name || "Not assigned"}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Real-time Project Chat */}
        <motion.div
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
          }}
        >
          <ProjectChat projectId={id} />
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
          }}
        >
          <ActivityFeed title="Recent Activity" items={mockActivity} />
        </motion.div>

        {/* Danger Zone */}
        {canDelete && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-[14px] p-[24px_32px] opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="font-serif text-[19px] font-semibold mb-[12px] text-red-600">
              Danger Zone
            </div>
            <p className="text-[13px] text-red-600/80 mb-4">
              Deleting this project will mark it as archived and remove it from active views.
            </p>
            <Button variant="destructive" onClick={handleDelete} className="w-full">
              Remove Project
            </Button>
          </div>
        )}
      </div>
      
    </motion.div>
    </>
  )
}
