"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityFeed } from "@/components/activity-feed"
import { ProjectChat } from "./_components/project-chat"

export default function ProjectOverviewPage() {
  const params = useParams()
  const id = params.id as string

  const { data: project, isLoading } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => fetchApi<any>(`/projects/${id}`),
  })

  if (isLoading) return <div className="p-8 text-center">Loading project details...</div>
  if (!project) return <div className="p-8 text-center">Project not found.</div>

  const mockActivity = [
    { id: "1", title: "Project Created", description: "The project workspace was initialized.", timestamp: "2 days ago" },
    { id: "2", title: "Team Assigned", description: "Team Alpha was assigned to this project.", timestamp: "1 day ago" },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground">{project.description || "No description provided."}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h3 className="font-semibold text-sm">Status</h3>
                <Badge variant="outline" className="mt-1">{project.status}</Badge>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Repository URL</h3>
                <p className="text-sm text-primary hover:underline cursor-pointer">
                  {project.githubRepoUrl || "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Chat Room */}
        <ProjectChat projectId={id} />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Stakeholders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Nonprofit</h3>
              <p className="font-medium">{project.nonprofit?.name || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Team</h3>
              <p className="font-medium">{project.team?.name || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Cohort</h3>
              <p className="font-medium">{project.cohort?.name || "Not assigned"}</p>
            </div>
          </CardContent>
        </Card>
        
        <ActivityFeed items={mockActivity} />
      </div>
    </div>
  )
}
