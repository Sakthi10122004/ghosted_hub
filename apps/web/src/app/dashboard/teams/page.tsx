"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Users,
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

/* ─── helpers ─── */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const avatarColors = [
  "bg-[#818CF8] text-white",
  "bg-[#F472B6] text-white",
  "bg-[#34D399] text-white",
  "bg-[#FBBF24] text-[#2C2245]",
  "bg-[#A78BFA] text-white",
  "bg-[#FB923C] text-white",
  "bg-[#38BDF8] text-white",
  "bg-[#F87171] text-white",
]

function getAvatarColor(i: number) {
  return avatarColors[i % avatarColors.length]
}

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Student Teams
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Form teams, assign captains, and manage members across cohorts.
          </p>
        </div>
        <CreateTeamDialog />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FA8A60]/10 flex items-center justify-center">
            <FolderKanban className="w-6 h-6 text-[#FA8A60]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground font-serif">{totalTeams}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Teams</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#818CF8]/10 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-[#818CF8]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground font-serif">{totalMembers}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Members</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground font-serif">{atCapacity}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">At Capacity</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl border-border bg-card focus-visible:ring-primary"
          />
        </div>
        <select
          value={cohortFilter}
          onChange={(e) => setCohortFilter(e.target.value)}
          className="h-11 rounded-xl border border-border bg-card px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          <option value="">All Cohorts</option>
          {cohorts.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : teams.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-muted/20">
          <div className="w-16 h-16 rounded-2xl bg-[#FA8A60]/10 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-[#FA8A60]/60" />
          </div>
          <h3 className="text-lg font-serif font-bold text-foreground">No teams yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs text-center">
            {search || cohortFilter
              ? "No teams match your filters. Try adjusting your search."
              : "Create your first student team to get started."}
          </p>
          {!search && !cohortFilter && (
            <div className="mt-5">
              <CreateTeamDialog />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {teams.map((team) => {
            const activeMembers = team.members?.filter((m) => !m.leftAt) || []
            const captain = activeMembers.find((m) => m.role === "TEAM_LEAD")
            const regularMembers = activeMembers.filter((m) => m.role !== "TEAM_LEAD")
            const capacityPercent = Math.min(
              (activeMembers.length / team.capacity) * 100,
              100
            )
            const isAtCap = activeMembers.length >= team.capacity

            return (
              <Card
                key={team.id}
                className="group relative rounded-2xl border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => handleOpenDetail(team)}
              >
                {/* Capacity rail — thin colored line at top */}
                <div className="absolute top-0 left-0 right-0 h-1">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isAtCap
                        ? "bg-[#EF4444]"
                        : capacityPercent > 70
                          ? "bg-[#F59E0B]"
                          : "bg-[#FA8A60]"
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>

                <CardContent className="p-5 pt-6">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-serif font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {team.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="mt-1.5 rounded-lg text-[10px] font-bold bg-[#EBE5FA] text-[#2C2245] border-0"
                      >
                        {team.cohort?.name || "—"}
                      </Badge>
                    </div>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm("Delete this team?")) {
                          deleteTeamMutation.mutate(team.id)
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>

                  {/* Capacity gauge */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Capacity
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {activeMembers.length}
                        <span className="text-muted-foreground font-medium">
                          {" "}/ {team.capacity}
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAtCap
                            ? "bg-[#EF4444]"
                            : capacityPercent > 70
                              ? "bg-[#F59E0B]"
                              : "bg-[#FA8A60]"
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Captain */}
                  <div className="mb-4">
                    {captain ? (
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-[#FBBF24]/8 to-[#FA8A60]/8 border border-[#FBBF24]/15">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(0)}`}
                        >
                          {captain.user.avatarUrl ? (
                            <img
                              src={captain.user.avatarUrl}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(captain.user.name)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {captain.user.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            Captain
                          </p>
                        </div>
                        <Crown className="w-4 h-4 text-[#FBBF24] flex-shrink-0" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-border">
                        <Crown className="w-4 h-4 text-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground">
                          No captain assigned
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Member Avatars */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center -space-x-2">
                      {regularMembers.slice(0, 4).map((member, idx) => (
                        <div
                          key={member.id}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-card ${getAvatarColor(idx + 1)}`}
                          title={member.user.name}
                        >
                          {member.user.avatarUrl ? (
                            <img
                              src={member.user.avatarUrl}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(member.user.name)
                          )}
                        </div>
                      ))}
                      {regularMembers.length > 4 && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-card bg-muted text-muted-foreground">
                          +{regularMembers.length - 4}
                        </div>
                      )}
                      {regularMembers.length === 0 && !captain && (
                        <span className="text-xs text-muted-foreground">No members</span>
                      )}
                    </div>

                    {/* Project count pill */}
                    {team._count?.projects > 0 && (
                      <Badge variant="outline" className="rounded-lg text-[10px] font-bold gap-1">
                        <FolderKanban className="w-3 h-3" />
                        {team._count.projects}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

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
