"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Bell, Search, Plus } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Maya";

  // Fetch projects
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["dashboard-projects"],
    queryFn: () => fetchApi<{ data: any[]; meta: any }>("/projects?limit=5"),
  });

  const projects = projectsData?.data || [];
  const totalProjects = projectsData?.meta?.total || 0;

  // Compute mock stats if actual dashboard stats endpoint doesn't exist
  const activeProjects = totalProjects;
  const pendingReviews = Math.floor(activeProjects * 0.4);
  const nonprofitsOnboarding = Math.max(0, 10 - activeProjects);

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
      case "BLOCKED": return "bg-red-100 text-red-700 marker-red-500";
      case "CANCELLED": return "bg-gray-100 text-gray-700 marker-gray-500";
      case "COMPLETED": return "bg-emerald-100 text-emerald-700 marker-emerald-500";
      case "ACTIVE":
      default: return "bg-emerald-100 text-emerald-700 marker-emerald-500";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 relative z-10">
      {/* Decorative blurred blobs for background vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl -z-10 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-secondary rounded-full blur-3xl -z-10 mix-blend-multiply pointer-events-none"></div>

      {/* Header Area */}
      <div className="flex items-end justify-between bg-card p-6 rounded-3xl shadow-sm border border-border/50">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">Good morning, {userName}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="pl-11 pr-4 py-3 rounded-2xl border-none bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-shadow"
            />
          </div>
          <button className="relative p-3 rounded-2xl bg-muted text-foreground hover:bg-secondary transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>
          </button>
          <button className="flex items-center space-x-2 bg-foreground hover:bg-foreground/90 text-background px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 transition-all hover:scale-[1.02]">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Needs Attention Panel */}
      <div className="bg-card rounded-3xl p-8 shadow-sm border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-status-blocked animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
            <h2 className="text-sm font-bold tracking-wider text-foreground uppercase">Needs Your Attention</h2>
          </div>
          <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">6 items across 4 projects</span>
        </div>
        
        <div className="grid md:grid-cols-3 gap-5">
          {/* Attention Card 1 */}
          <div className="bg-background border border-border/50 rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
            <div className="inline-block px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-status-blocked/10 text-status-blocked mb-4">
              Blocked
            </div>
            <h3 className="text-foreground font-bold mb-2 group-hover:text-primary transition-colors">Riverbend Youth Alliance</h3>
            <p className="text-sm text-muted-foreground font-medium">Waiting on nonprofit content — 9 days</p>
          </div>
          
          {/* Attention Card 2 */}
          <div className="bg-background border border-border/50 rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
            <div className="inline-block px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-status-attention/10 text-status-attention mb-4">
              Review Overdue
            </div>
            <h3 className="text-foreground font-bold mb-2 group-hover:text-primary transition-colors">Harbor Literacy Project</h3>
            <p className="text-sm text-muted-foreground font-medium">Homepage design — due 3 days ago</p>
          </div>

          {/* Attention Card 3 */}
          <div className="bg-background border border-border/50 rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
            <div className="inline-block px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary mb-4">
              Deadline Approaching
            </div>
            <h3 className="text-foreground font-bold mb-2 group-hover:text-primary transition-colors">Cascade Wildlife Trust</h3>
            <p className="text-sm text-muted-foreground font-medium">Launch review — due tomorrow</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid md:grid-cols-4 gap-5">
        <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden relative group hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-7 relative z-10">
            <p className="text-sm font-bold text-muted-foreground mb-2">Active Projects</p>
            <p className="text-5xl font-serif font-bold text-foreground mb-3">{isLoading ? "-" : activeProjects}</p>
            <p className="text-xs font-bold text-status-on-track flex items-center bg-status-on-track/10 w-fit px-2 py-1 rounded-md">
              ↑ 4 since last cohort
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden relative group hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-7 relative z-10">
            <p className="text-sm font-bold text-muted-foreground mb-2">Pending Reviews</p>
            <p className="text-5xl font-serif font-bold text-foreground mb-3">{isLoading ? "-" : pendingReviews}</p>
            <p className="text-xs font-bold text-primary flex items-center bg-primary/10 w-fit px-2 py-1 rounded-md">
              3 assigned to you
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden relative group hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-7 relative z-10">
            <p className="text-sm font-bold text-muted-foreground mb-2">Avg. Cycle Time</p>
            <p className="text-5xl font-serif font-bold text-foreground mb-3">18 <span className="text-xl font-sans font-medium text-muted-foreground">days</span></p>
            <p className="text-xs font-bold text-status-on-track flex items-center bg-status-on-track/10 w-fit px-2 py-1 rounded-md">
              ↓ 2 days vs. Cohort 7
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden relative group hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-7 relative z-10">
            <p className="text-sm font-bold text-muted-foreground mb-2">Nonprofits Onboarding</p>
            <p className="text-5xl font-serif font-bold text-foreground mb-3">{isLoading ? "-" : nonprofitsOnboarding}</p>
            <p className="text-xs font-bold text-status-attention flex items-center bg-status-attention/10 w-fit px-2 py-1 rounded-md">
              2 awaiting kickoff call
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Split Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Your Projects */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between mb-4 bg-card p-4 rounded-2xl shadow-sm">
            <h2 className="text-xl font-serif font-bold text-foreground px-2">Your Projects</h2>
            <div className="flex items-center space-x-1.5 text-sm p-1 bg-muted rounded-xl">
              <button className="px-4 py-1.5 rounded-lg bg-card text-foreground font-bold shadow-sm">All</button>
              <button className="px-4 py-1.5 rounded-lg text-muted-foreground hover:text-foreground font-bold transition-colors">Discovery</button>
              <button className="px-4 py-1.5 rounded-lg text-muted-foreground hover:text-foreground font-bold transition-colors">Build</button>
              <button className="px-4 py-1.5 rounded-lg text-muted-foreground hover:text-foreground font-bold transition-colors">Review</button>
              <button className="px-4 py-1.5 rounded-lg text-muted-foreground hover:text-foreground font-bold transition-colors">Launch</button>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground bg-card rounded-3xl font-bold">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground bg-card rounded-3xl font-bold">No projects found.</div>
            ) : (
              projects.map((project) => (
                <Link href={`/dashboard/projects/${project.id}`} key={project.id} className="block group">
                  <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/30 flex items-center gap-6 group-hover:shadow-lg group-hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors"></div>
                    <div className="w-64 flex-shrink-0">
                      <h3 className="font-serif font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
                      <p className="text-sm font-medium text-muted-foreground mt-1">Nonprofit · {project.nonprofit?.name || "Unassigned"}</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex text-[10px] tracking-widest font-bold text-muted-foreground uppercase mb-2 space-x-1">
                        <span className="text-foreground">DISCOVERY</span> <span className="opacity-50">·</span>
                        <span>BUILD</span> <span className="opacity-50">·</span>
                        <span>REVIEW</span> <span className="opacity-50">·</span>
                        <span>LAUNCH</span>
                      </div>
                      <div className="flex space-x-1.5 mb-2">
                        <div className="h-2 flex-1 bg-gradient-to-r from-primary to-accent rounded-full shadow-inner"></div>
                        <div className="h-2 flex-1 bg-muted rounded-full"></div>
                        <div className="h-2 flex-1 bg-muted rounded-full"></div>
                        <div className="h-2 flex-1 bg-muted rounded-full"></div>
                      </div>
                      <span className="text-xs font-bold text-foreground bg-muted w-fit px-2 py-0.5 rounded-md">Discovery — Initial</span>
                    </div>
                    <div className="flex items-center space-x-3 w-48 justify-end">
                      <div className="flex -space-x-3">
                        {project.team?.members?.slice(0, 3).map((member: any, i: number) => (
                          <div key={member.user.id} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-card z-${30-i*10} shadow-sm ${
                            i === 0 ? 'bg-primary/20 text-primary' : i === 1 ? 'bg-secondary text-foreground' : 'bg-status-on-track/20 text-status-on-track'
                          }`}>
                            {getInitials(member.user.name)}
                          </div>
                        ))}
                        {(!project.team?.members || project.team.members.length === 0) && (
                           <div className="text-xs text-muted-foreground italic font-medium">No team</div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-bold truncate w-24 text-right">
                        {project.team?.name || "Unassigned"}
                      </span>
                    </div>
                    <div className="w-28 flex justify-end">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider ${getStatusColor(project.status).split(' ')[0]} ${getStatusColor(project.status).split(' ')[1]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusColor(project.status).split(' ')[2].replace('marker-', 'bg-')}`}></span> 
                        {project.status === "ACTIVE" ? "On Track" : project.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-3xl p-8 shadow-sm border border-border/50 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/50 rounded-bl-full -z-10"></div>
            <h2 className="text-xl font-serif font-bold text-foreground mb-8">Activity</h2>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-card bg-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10"></div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border/50 bg-background shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-foreground text-sm">System</div>
                    <time className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Just now</time>
                  </div>
                  <div className="text-muted-foreground text-xs font-medium">Fetched the latest project timeline data.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
