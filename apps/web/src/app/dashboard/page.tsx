"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FolderKanban, Users, Building2, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/use-user-role";

export default function DashboardPage() {
  const { session, isAdmin, isStudent, isPending: rolePending } = useUserRole();
  const userName = session?.user?.name?.split(" ")[0] || "User";

  // Fetch projects (backend already scopes for students)
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["dashboard-projects"],
    queryFn: () => fetchApi<{ data: any[]; meta: any }>("/projects?limit=10"),
  });

  // Admin-only: fetch real counts
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

  const projects = projectsData?.data || [];
  const totalProjects = projects.length;
  const totalTeams = teamsData?.data?.length || 0;
  const totalCohorts = cohortsData?.data?.length || 0;
  const totalNonprofits = nonprofitsData?.data?.length || 0;

  const isLoading = rolePending || projectsLoading;

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BLOCKED": return "bg-destructive/10 text-destructive";
      case "CANCELLED": return "bg-muted text-muted-foreground";
      case "COMPLETED": return "bg-status-on-track/10 text-status-on-track";
      default: return "bg-status-on-track/10 text-status-on-track";
    }
  };

  const getStageInfo = (status: string) => {
    const stages: Record<string, { label: string; filled: number }> = {
      CREATED: { label: "Created", filled: 0 },
      DISCOVERY: { label: "Discovery", filled: 1 },
      DEVELOPMENT: { label: "Development", filled: 2 },
      INTERNAL_REVIEW: { label: "Internal Review", filled: 2 },
      REVISION: { label: "Revision", filled: 2 },
      NONPROFIT_REVIEW: { label: "NPO Review", filled: 3 },
      TRAINING: { label: "Training", filled: 3 },
      FINAL_DELIVERABLES: { label: "Final Deliverables", filled: 3 },
      DEPLOYMENT_DECISION: { label: "Deployment", filled: 4 },
      COMPLETED: { label: "Completed", filled: 4 },
      ARCHIVED: { label: "Archived", filled: 4 },
    };
    return stages[status] || { label: status, filled: 0 };
  };

  if (isLoading) {
    return <div className="h-[60vh] flex items-center justify-center text-muted-foreground font-mono text-sm uppercase tracking-widest">Loading workspace...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold uppercase tracking-widest text-foreground">
            {isStudent ? `Welcome, ${userName}` : `Good morning, ${userName}`}
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
            {isStudent ? "Your Team // Your Project" : "Status Report // Active Modules"}
          </p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/dashboard/projects">
              <Plus className="w-4 h-4 mr-2" />
              NEW PROJECT
            </Link>
          </Button>
        )}
      </div>

      {/* Admin Metrics Row — real data */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground uppercase">Active Projects</p>
                <div className="p-2 border border-border">
                  <FolderKanban className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-foreground">{totalProjects}</p>
              <p className="text-xs text-muted-foreground mt-1">across all cohorts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground uppercase">Student Teams</p>
                <div className="p-2 border border-border">
                  <Users className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-foreground">{totalTeams}</p>
              <p className="text-xs text-muted-foreground mt-1">registered teams</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground uppercase">Cohorts</p>
                <div className="p-2 border border-border">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-foreground">{totalCohorts}</p>
              <p className="text-xs text-muted-foreground mt-1">program cycles</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground uppercase">Nonprofits</p>
                <div className="p-2 border border-border">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-foreground">{totalNonprofits}</p>
              <p className="text-xs text-muted-foreground mt-1">partner organizations</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project Index */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground">
            {isStudent ? "My Project" : "Project Index"}
          </h2>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground border-r border-border/50">Project Name</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground border-r border-border/50">Stage</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground border-r border-border/50">Team</th>
                    <th className="text-right px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                        {isStudent ? "You are not assigned to any projects yet." : "No projects found."}
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => {
                      const stage = getStageInfo(project.status);
                      return (
                        <tr key={project.id} className="hover:bg-muted/50 transition-colors group relative">
                          <td className="px-4 py-4 border-r border-border/50">
                            <Link href={`/dashboard/projects/${project.id}`} className="absolute inset-0 z-10" />
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.name}</div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">{project.nonprofit?.name || "Unassigned NPO"}</div>
                          </td>
                          <td className="px-4 py-4 w-[280px] border-r border-border/50">
                            <div className="flex flex-col gap-2 mt-1 relative z-20">
                              <div className="flex gap-1 w-full">
                                {[1, 2, 3, 4].map((i) => (
                                  <div key={i} className={`h-1 flex-1 ${i <= stage.filled ? "bg-primary" : "bg-muted"}`}></div>
                                ))}
                              </div>
                              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{stage.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-r border-border/50">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {project.team?.members?.slice(0, 3).map((member: any, i: number) => (
                                  <div key={member.user.id} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium border border-card shadow-sm ${
                                    i === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                                  }`}>
                                    {getInitials(member.user.name)}
                                  </div>
                                ))}
                                {(!project.team?.members || project.team.members.length === 0) && (
                                  <span className="text-xs text-muted-foreground">Unassigned</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`inline-flex items-center px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border border-border ${getStatusColor(project.status)}`}>
                              {project.status === "CREATED" ? "On Track" : project.status?.replace(/_/g, " ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
