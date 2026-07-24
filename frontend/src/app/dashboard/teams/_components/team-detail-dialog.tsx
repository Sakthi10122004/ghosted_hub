"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  UserPlus,
  UserMinus,
  Search,
  Shield,
  X,
  Pencil,
  Check,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUserRole } from "@/hooks/use-user-role";

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

interface TeamDetail {
  id: string;
  name: string;
  capacity: number;
  cohort: { id: string; name: string; status: string };
  members: TeamMember[];
  projects: { id: string; name: string; status: string }[];
}

interface TeamDetailDialogProps {
  team: TeamDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getInitials(name: string | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
];

function getAvatarColor(index: number) {
  return avatarColors[index % avatarColors.length];
}

export function TeamDetailDialog({ team, open, onOpenChange }: TeamDetailDialogProps) {
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const { isAdmin } = useUserRole();

  // Fetch available users to add
  const { data: usersData } = useQuery({
    queryKey: ["users", "student", userSearch],
    queryFn: () =>
      fetchApi<{ data: any[] }>(`/users?role=STUDENT&search=${encodeURIComponent(userSearch)}&limit=10`),
    enabled: open && userSearch.length > 0,
  });

  // Filter out users already in the team
  const availableUsers = (usersData?.data || []).filter(
    (u: any) => !team?.members.some((m) => m.user.id === u.id)
  );

  // Mutations
  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      fetchApi(`/teams/${teamId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team", team?.id] });
      setUserSearch("");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      fetchApi(`/teams/${teamId}/members/${userId}/remove`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team", team?.id] });
    },
  });

  const setRoleMutation = useMutation({
    mutationFn: ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) =>
      fetchApi(`/teams/${teamId}/members/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team", team?.id] });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchApi(`/teams/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setEditingName(false);
      setEditingCapacity(false);
    },
  });

  if (!team) return null;

  const captain = team.members.find((m) => m.role === "TEAM_LEAD");
  const activeMembers = team.members.filter((m) => !("leftAt" in m && m.leftAt));
  const capacityPercent = Math.min((activeMembers.length / team.capacity) * 100, 100);
  const isAtCapacity = activeMembers.length >= team.capacity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] rounded-3xl p-0 border-border/50 shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-[#2C2245]/5 to-[#FA8A60]/5">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-10 rounded-xl text-lg font-bold font-serif bg-white/80"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      className="rounded-xl"
                      onClick={() => {
                        if (newName.trim()) {
                          updateTeamMutation.mutate({ id: team.id, data: { name: newName.trim() } });
                        }
                      }}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl"
                      onClick={() => setEditingName(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <DialogTitle className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                    {team.name}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setNewName(team.name);
                          setEditingName(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </DialogTitle>
                )}
                <DialogDescription asChild>
                  <div className="mt-2 flex items-center gap-3 text-muted-foreground">
                    <Badge variant="secondary" className="rounded-lg font-bold text-xs bg-[#EBE5FA] text-[#2C2245]">
                      {team.cohort?.name || "No Cohort"}
                    </Badge>
                    {team.cohort?.status && (
                      <span className="text-xs font-medium">
                        {team.cohort.status.charAt(0) + team.cohort.status.slice(1).toLowerCase()}
                      </span>
                    )}
                  </div>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Capacity Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Team Capacity
              </span>
              <div className="flex items-center gap-2">
                {editingCapacity ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={activeMembers.length}
                      max={20}
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(e.target.value)}
                      className="h-7 w-16 rounded-lg text-xs font-bold text-center"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      className="h-7 w-7 p-0 rounded-lg"
                      onClick={() => {
                        const cap = parseInt(newCapacity);
                        if (cap >= activeMembers.length && cap <= 20) {
                          updateTeamMutation.mutate({ id: team.id, data: { capacity: cap } });
                        }
                      }}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 rounded-lg"
                      onClick={() => setEditingCapacity(false)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : isAdmin ? (
                  <button
                    onClick={() => {
                      setNewCapacity(String(team.capacity));
                      setEditingCapacity(true);
                    }}
                    className="flex items-center gap-1 group"
                  >
                    <span className="text-sm font-bold text-foreground">
                      {activeMembers.length}
                      <span className="text-muted-foreground font-medium"> / {team.capacity}</span>
                    </span>
                    <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ) : (
                  <span className="text-sm font-bold text-foreground">
                    {activeMembers.length}
                    <span className="text-muted-foreground font-medium"> / {team.capacity}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isAtCapacity
                    ? "bg-[#EF4444]"
                    : capacityPercent > 70
                      ? "bg-[#F59E0B]"
                      : "bg-[#FA8A60]"
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 space-y-6">
          {/* Captain Section */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-[#FBBF24]" />
              Team Captain
            </h3>
            {captain ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#FBBF24]/10 to-[#FA8A60]/10 border border-[#FBBF24]/20">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getAvatarColor(0)}`}>
                  {captain.user.avatarUrl ? (
                    <img src={captain.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(captain.user.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{captain.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{captain.user.email}</p>
                </div>
                <Crown className="w-5 h-5 text-[#FBBF24] flex-shrink-0" />
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-[#FBBF24]/30 bg-[#FBBF24]/5 text-center">
                <p className="text-sm text-muted-foreground">
                  No captain assigned — promote a member below
                </p>
              </div>
            )}
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Members ({activeMembers.length})
            </h3>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {activeMembers.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-border bg-muted/30 text-center">
                  <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No members yet — add students below</p>
                </div>
              ) : (
                activeMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(index)}`}>
                      {member.user.avatarUrl ? (
                        <img src={member.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(member.user.name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{member.user.name}</p>
                        {member.role === "TEAM_LEAD" && (
                          <Badge className="bg-[#FBBF24]/20 text-[#B45309] border-0 text-[10px] px-1.5 py-0 font-bold">
                            Captain
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                    </div>

                    {/* Actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {member.role !== "TEAM_LEAD" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-[#FBBF24]/20"
                            onClick={() =>
                              setRoleMutation.mutate({
                                teamId: team.id,
                                userId: member.user.id,
                                role: "TEAM_LEAD",
                              })
                            }
                            disabled={setRoleMutation.isPending}
                            title="Promote to Captain"
                          >
                            <Crown className="w-3.5 h-3.5 text-[#B45309]" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10"
                          onClick={() =>
                            removeMemberMutation.mutate({
                              teamId: team.id,
                              userId: member.user.id,
                            })
                          }
                          disabled={removeMemberMutation.isPending}
                          title="Remove from team"
                        >
                          <UserMinus className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Members */}
          {isAdmin && !isAtCapacity && (
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5" />
                Add Member
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 rounded-xl border-border bg-muted/30 focus-visible:ring-primary h-11"
                />
              </div>

              {/* Search Results Dropdown */}
              {userSearch.length > 0 && (
                <div className="mt-2 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                  {availableUsers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {usersData ? "No matching students found" : "Searching..."}
                    </div>
                  ) : (
                    <div className="max-h-[180px] overflow-y-auto">
                      {availableUsers.map((user: any, idx: number) => (
                        <div
                          key={user.id}
                          role="button"
                          tabIndex={addMemberMutation.isPending ? -1 : 0}
                          className={`w-full flex items-center gap-3 p-3 transition-colors text-left ${addMemberMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50 cursor-pointer'}`}
                          onClick={() => {
                            if (!addMemberMutation.isPending) {
                              addMemberMutation.mutate({
                                teamId: team.id,
                                userId: user.id,
                              })
                            }
                          }}
                          onKeyDown={(e) => {
                            if (!addMemberMutation.isPending && (e.key === "Enter" || e.key === " ")) {
                              e.preventDefault();
                              addMemberMutation.mutate({
                                teamId: team.id,
                                userId: user.id,
                              })
                            }
                          }}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(idx + 3)}`}>
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              getInitials(user.name)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          <UserPlus className="w-4 h-4 text-primary flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Projects assigned to this team */}
          {team.projects && team.projects.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Assigned Projects ({team.projects.length})
              </h3>
              <div className="space-y-1.5">
                {team.projects.map((project) => (
                  <div key={project.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{project.name}</span>
                    <Badge variant="outline" className="ml-auto text-[10px] rounded-lg">
                      {project.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
