"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Crown,
  Search,
  FolderKanban,
  UserCheck,
  AlertTriangle,
  Trash2,
  Loader2,
} from "lucide-react"
import { CreateTeamDialog } from "./_components/create-team-dialog"
import { TeamDetailDialog } from "./_components/team-detail-dialog"
import { useUserRole } from "@/hooks/use-user-role"

/* ─── helpers ─── */


/* ─── types ─── */

interface TeamMember {
  id: string
  userId: string
  role: string
  joinedAt: string
  leftAt?: string | null
  user: { id: string; name: string; email: string; avatarUrl?: string }
}

interface Team {
  id: string
  name: string
  capacity: number
  cohortId: string
  cohort: { id: string; name: string; status?: string }
  members: TeamMember[]
  _count: { projects: number; members: number }
}

/* ─── page ─── */

export default function TeamsPage() {
  const { isAdmin } = useUserRole()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [cohortFilter, setCohortFilter] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["teams", search, cohortFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (cohortFilter) params.set("cohortId", cohortFilter)
      params.set("limit", "50")
      return fetchApi<{ data: Team[]; meta: any }>(`/teams?${params.toString()}`)
    },
  })

  const { data: cohortsData } = useQuery({
    queryKey: ["cohorts"],
    queryFn: () => fetchApi<{ data: any[] }>("/cohorts"),
  })

  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/teams/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  })

  const teams: Team[] = data?.data || []
  const cohorts = cohortsData?.data || []

  // Fetch full detail for selected team
  const { data: teamDetail } = useQuery({
    queryKey: ["team", selectedTeam?.id],
    queryFn: () => fetchApi<any>(`/teams/${selectedTeam?.id}`),
    enabled: !!selectedTeam?.id && detailOpen,
  })

  /* ─── stats ─── */
  const totalTeams = teams.length
  const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0)
  const atCapacity = teams.filter((t) => (t.members?.length || 0) >= t.capacity).length

  const handleOpenDetail = (team: Team) => {
    setSelectedTeam(team)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold uppercase tracking-widest text-foreground">Student Teams</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
            Index // Members & Capacity
          </p>
        </div>
        {isAdmin && <CreateTeamDialog />}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 border border-border flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground uppercase">Total Teams</p>
              <p className="text-2xl font-mono font-bold text-foreground">{totalTeams}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 border border-border flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground uppercase">Total Members</p>
              <p className="text-2xl font-mono font-bold text-foreground">{totalMembers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 border border-border flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground uppercase">At Capacity</p>
              <p className="text-2xl font-mono font-bold text-foreground">{atCapacity}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="SEARCH TEAMS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64 font-mono text-[11px] uppercase tracking-widest"
            />
          </div>
          <select
            value={cohortFilter}
            onChange={(e) => setCohortFilter(e.target.value)}
            className="flex h-9 w-48 border border-input bg-card px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Cohorts</option>
            {cohorts.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teams Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground border-r border-border/50">Team</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground border-r border-border/50">Cohort</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground border-r border-border/50">Capacity</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground border-r border-border/50">Captain</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground border-r border-border/50">Projects</th>
                  <th className="text-right px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : teams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                      No teams found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  teams.map((team) => {
                    const activeMembers = team.members?.filter((m) => !m.leftAt) || []
                    const captain = activeMembers.find((m) => m.role === "TEAM_LEAD")
                    const capacityPercent = Math.min((activeMembers.length / team.capacity) * 100, 100)
                    const isAtCap = activeMembers.length >= team.capacity

                    return (
                      <tr 
                        key={team.id} 
                        className="hover:bg-muted/50 transition-colors group cursor-pointer"
                        onClick={() => handleOpenDetail(team)}
                      >
                        <td className="px-4 py-4 border-r border-border/50">
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {team.name}
                          </div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                            {activeMembers.length} MEMBERS
                          </div>
                        </td>
                        <td className="px-4 py-4 border-r border-border/50">
                          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest rounded-none border-border bg-transparent">
                            {team.cohort?.name || "—"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 w-32 border-r border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground">{activeMembers.length} / {team.capacity}</span>
                          </div>
                          <div className="w-full h-1 bg-muted overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isAtCap ? "bg-primary" : "bg-foreground"
                              }`}
                              style={{ width: `${capacityPercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 border-r border-border/50">
                          {captain ? (
                            <div className="flex items-center gap-2">
                              <Crown className="w-3 h-3 text-primary" />
                              <span className="text-xs font-mono uppercase tracking-widest text-foreground">{captain.user.name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">NO CAPTAIN</span>
                          )}
                        </td>
                        <td className="px-4 py-4 border-r border-border/50">
                          {team._count?.projects > 0 ? (
                            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">
                              <FolderKanban className="w-3.5 h-3.5 text-primary" />
                              {team._count.projects} ACTIVE
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isAdmin && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm("Delete this team?")) {
                                    deleteTeamMutation.mutate(team.id)
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <TeamDetailDialog
        team={teamDetail || selectedTeam}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) setSelectedTeam(null)
        }}
      />
    </div>
  )
}
