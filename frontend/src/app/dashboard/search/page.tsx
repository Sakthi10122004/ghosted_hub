"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search as SearchIcon, Folder, Users, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects", "search", query],
    queryFn: () => fetchApi<{ data: any[] }>(`/projects?search=${encodeURIComponent(query)}`),
    enabled: !!query,
  });

  const { data: teamsData, isLoading: loadingTeams } = useQuery({
    queryKey: ["teams", "search", query],
    queryFn: () => fetchApi<{ data: any[] }>(`/teams?search=${encodeURIComponent(query)}`),
    enabled: !!query,
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => fetchApi<{ data: any[] }>(`/users?search=${encodeURIComponent(query)}`),
    enabled: !!query,
  });

  const projects = Array.isArray(projectsData?.data) ? projectsData.data : [];
  const teams = Array.isArray(teamsData?.data) ? teamsData.data : [];
  const users = Array.isArray(usersData?.data) ? usersData.data : [];

  const isLoading = loadingProjects || loadingTeams || loadingUsers;
  const hasResults = projects.length > 0 || teams.length > 0 || users.length > 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <SearchIcon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1">Global Search</p>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            {query ? `Results for "${query}"` : "Search"}
          </h1>
        </div>
      </div>

      {!query ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground font-medium">Enter a search term in the top navigation bar to begin.</p>
        </div>
      ) : isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Searching across platform...</p>
        </div>
      ) : !hasResults ? (
        <div className="py-20 text-center">
          <p className="text-lg font-bold text-foreground mb-2">No results found for "{query}"</p>
          <p className="text-muted-foreground">Try checking for typos or using different keywords.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Projects Results */}
          {projects.length > 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <Folder className="w-4 h-4" /> Projects ({projects.length})
              </h2>
              <div className="space-y-3">
                {projects.slice(0, 10).map((project) => (
                  <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                    <Card className="hover:border-primary/50 transition-colors group cursor-pointer bg-card border-border/60 shadow-sm mb-3">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{project.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{project.nonprofit?.name || "No Organization"}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Teams Results */}
          {teams.length > 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <Users className="w-4 h-4" /> Teams ({teams.length})
              </h2>
              <div className="space-y-3">
                {teams.slice(0, 10).map((team) => (
                  <Link href={`/dashboard/teams`} key={team.id}>
                    <Card className="hover:border-primary/50 transition-colors group cursor-pointer bg-card border-border/60 shadow-sm mb-3">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{team.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">Cohort: {team.cohort?.name || "Unknown"}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Users Results */}
          {users.length > 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <User className="w-4 h-4" /> Users ({users.length})
              </h2>
              <div className="space-y-3">
                {users.slice(0, 10).map((user) => (
                  <Link href={`/dashboard/users`} key={user.id}>
                    <Card className="hover:border-primary/50 transition-colors group cursor-pointer bg-card border-border/60 shadow-sm mb-3">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">{user.email}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
