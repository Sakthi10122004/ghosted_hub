"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import {
  Crown,
  Search,
  FolderKanban,
  UserCheck,
  AlertTriangle,
  Trash2,
  Users,
} from "lucide-react"
import { CreateTeamDialog } from "./_components/create-team-dialog"
import { TeamDetailDialog } from "./_components/team-detail-dialog"
import { useUserRole } from "@/hooks/use-user-role"
import { useConfirm } from "@/hooks/use-confirm"

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

export default function TeamsPage() {
  const { isAdmin } = useUserRole()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [cohortFilter, setCohortFilter] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [ConfirmDialog, confirm] = useConfirm()

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

  const { data: teamDetail } = useQuery({
    queryKey: ["team", selectedTeam?.id],
    queryFn: () => fetchApi<any>(`/teams/${selectedTeam?.id}`),
    enabled: !!selectedTeam?.id && detailOpen,
  })

  const totalTeams = teams.length
  const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0)
  const atCapacity = teams.filter((t) => (t.members?.length || 0) >= t.capacity).length

  const handleOpenDetail = (team: Team) => {
    setSelectedTeam(team)
    setDetailOpen(true)
  }

  function getInitials(name: string | undefined | null) {
    if (!name) return "?";
    try {
      return String(name).split(" ").map((n) => n?.[0] || "").join("").toUpperCase().slice(0, 2) || "?";
    } catch (e) {
      return "?";
    }
  }

  return (
    <div className="max-w-[1320px] mx-auto pb-16">
      <ConfirmDialog />
      {/* Header Row */}
      <div className="flex justify-between items-end mb-[30px] relative">
        <div className="relative">
          <svg className="absolute left-[-6px] top-[-22px] opacity-50 z-0 animate-dash" style={{ strokeDasharray: 340, strokeDashoffset: 340, animationDelay: '500ms' }} width="70" height="34" viewBox="0 0 70 34" fill="none">
            <path d="M2 22C10 8 18 30 26 16S42 4 50 18s14-6 18 2" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase font-semibold mb-[6px] opacity-0 animate-fade-up">
            Members & Capacity
          </div>
          <h1 className="font-serif font-medium text-[36px] m-0 text-foreground relative z-10 opacity-0 animate-fade-up" style={{ animationDelay: '70ms' }}>
            Student Teams
          </h1>
        </div>
        
        {isAdmin && (
          <div className="opacity-0 animate-pop-in" style={{ animationDelay: '220ms' }}>
            <CreateTeamDialog />
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] mb-[34px]">
        {[
          { label: "Total Teams", value: totalTeams, icon: <FolderKanban className="w-4 h-4"/>, colorClass: "text-primary", bgClass: "bg-secondary" },
          { label: "Total Members", value: totalMembers, icon: <UserCheck className="w-4 h-4"/>, colorClass: "text-primary", bgClass: "bg-secondary" },
          { label: "At Capacity", value: atCapacity, icon: <AlertTriangle className="w-4 h-4"/>, colorClass: "text-status-attention", bgClass: "bg-status-attention/10" },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-card border border-border rounded-[14px] p-[18px_20px] opacity-0 animate-fade-up hover:-translate-y-[3px] hover:shadow-[0_10px_22px_-16px_rgba(22,21,26,0.35)] transition-all group" style={{ animationDelay: `${i * 90 + 260}ms` }}>
            <div className="flex justify-between items-start mb-[14px]">
              <div className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground font-semibold">{stat.label}</div>
              <div className={`w-[28px] h-[28px] rounded-[7px] ${stat.bgClass} ${stat.colorClass} flex items-center justify-center shrink-0 group-hover:animate-wiggle`}>
                {stat.icon}
              </div>
            </div>
            <div className="font-serif text-[30px] font-medium text-foreground leading-none animate-count-glow" style={{ animationDelay: '500ms' }}>
              {isLoading ? "-" : stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex justify-between items-end mb-[14px]">
        <div className="font-serif text-[19px] font-semibold flex items-center gap-[10px] hidden md:flex">
          All Teams
          <span className="text-[11px] font-mono bg-muted text-muted-foreground px-[6px] py-[2px] rounded-[4px] border border-border tracking-widest">{teams.length}</span>
        </div>

        <div className="flex items-center gap-[12px] w-full md:w-auto opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <select
            value={cohortFilter}
            onChange={(e) => setCohortFilter(e.target.value)}
            className="flex h-[32px] w-48 border border-border bg-card rounded-[8px] px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors focus-visible:outline-none focus-visible:border-primary shadow-sm"
          >
            <option value="">All Cohorts</option>
            {cohorts.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-[8px] bg-card border border-border rounded-[9px] px-[12px] py-[7px] w-full md:w-[240px] text-muted-foreground text-[12.5px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
            <Search className="w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search teams..." 
              className="border-none outline-none bg-transparent font-sans text-[13px] w-full text-foreground placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-card border border-border rounded-[14px] overflow-hidden mb-[36px] opacity-0 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_60px] p-[12px_24px] text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground font-semibold border-b border-border bg-muted/30 hidden lg:grid">
          <div>Team</div>
          <div>Cohort</div>
          <div>Capacity</div>
          <div>Captain</div>
          <div>Projects</div>
          <div className="text-right"></div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin mb-3 opacity-50"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Loading teams...
          </div>
        ) : teams.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
             <Users className="w-8 h-8 opacity-20 mb-3 text-foreground" />
            No teams found matching your criteria.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {teams.map((team) => {
              const activeMembers = team.members?.filter((m) => !m.leftAt) || []
              const captain = activeMembers.find((m) => m.role === "TEAM_LEAD")
              const capacityPercent = Math.min((activeMembers.length / team.capacity) * 100, 100)
              const isAtCap = activeMembers.length >= team.capacity

              return (
                <div 
                  key={team.id} 
                  className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_60px] gap-y-4 p-[18px_24px] items-center hover:bg-muted/40 transition-colors group cursor-pointer"
                  onClick={() => handleOpenDetail(team)}
                >
                  <div className="flex items-center gap-[14px]">
                    <div className="flex -space-x-2">
                      {activeMembers.slice(0, 3).map((member, i) => (
                        <div key={member.id} className={`w-[28px] h-[28px] rounded-full border-[2px] border-card flex items-center justify-center text-[10px] font-bold font-mono shadow-sm z-10 ${
                          i === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                        }`}>
                          {getInitials(member.user.name)}
                        </div>
                      ))}
                      {activeMembers.length === 0 && (
                        <div className="w-[28px] h-[28px] rounded-full border-[2px] border-card flex items-center justify-center text-muted-foreground bg-muted font-bold font-mono shadow-sm z-10">
                          0
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-serif text-[16px] font-semibold text-foreground group-hover:text-primary transition-colors">{team.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-[2px]">{activeMembers.length} MEMBERS</p>
                    </div>
                  </div>

                  <div>
                    <span className="inline-flex items-center px-[8px] py-[3px] rounded-[4px] text-[9.5px] font-bold uppercase tracking-wider bg-[#E4E1D8] text-[#6F6D63]">
                      {team.cohort?.name || "—"}
                    </span>
                  </div>

                  <div className="pr-8">
                    <div className="flex items-center justify-between mb-[6px]">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground">{activeMembers.length} / {team.capacity}</span>
                    </div>
                    <div className="w-full h-[6px] rounded-full bg-border overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAtCap ? "bg-[#AE4B34]" : "bg-primary"
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    {captain ? (
                      <div className="flex items-center gap-[8px]">
                        <Crown className="w-[14px] h-[14px] text-[#B5842A]" />
                        <span className="text-[13px] font-semibold text-foreground">{captain.user.name}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-[4px]">NO CAPTAIN</span>
                    )}
                  </div>

                  <div>
                    {team._count?.projects > 0 ? (
                      <div className="flex items-center gap-[6px] text-[11px] font-semibold text-foreground bg-primary/5 border border-primary/20 px-2 py-1 rounded-[6px] w-max">
                        <FolderKanban className="w-3.5 h-3.5 text-primary" />
                        {team._count.projects} ACTIVE
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      {isAdmin && (
                        <button 
                          className="h-[32px] w-[32px] rounded-[8px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
                          onClick={async (e) => {
                            e.stopPropagation()
                            const ok = await confirm("Delete Team", `Are you sure you want to delete ${team.name}? This cannot be undone.`)
                            if (ok) {
                              deleteTeamMutation.mutate(team.id)
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

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
