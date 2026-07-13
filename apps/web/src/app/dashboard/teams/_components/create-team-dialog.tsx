"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Loader2,
  Search,
  Crown,
  X,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/* ─── helpers ─── */

function getInitials(name: string) {
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

function getAvatarColor(i: number) {
  return avatarColors[i % avatarColors.length];
}

/* ─── types ─── */

interface SelectedMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isCaptain: boolean;
}

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // Step 1: details, Step 2: members
  const [formData, setFormData] = useState({
    name: "",
    cohortId: "",
    capacity: "5",
  });
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch cohorts
  const { data: cohortsData } = useQuery({
    queryKey: ["cohorts"],
    queryFn: () => fetchApi<{ data: any[] }>("/cohorts"),
  });
  const cohorts = cohortsData?.data || [];

  // Search available users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", "student", memberSearch],
    queryFn: () =>
      fetchApi<{ data: any[] }>(
        `/users?role=STUDENT&search=${encodeURIComponent(memberSearch)}&limit=10`
      ),
    enabled: step === 2 && memberSearch.length > 0,
  });

  // Filter out already-selected users
  const availableUsers = (usersData?.data || []).filter(
    (u: any) => !selectedMembers.some((m) => m.id === u.id)
  );

  const maxCapacity = parseInt(formData.capacity) || 5;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const addMember = (user: any) => {
    if (selectedMembers.length >= maxCapacity) return;
    setSelectedMembers((prev) => [
      ...prev,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isCaptain: prev.length === 0, // First member auto-set as captain
      },
    ]);
    setMemberSearch("");
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) => {
      const filtered = prev.filter((m) => m.id !== userId);
      // If we removed the captain, promote the first remaining member
      const first = filtered[0];
      if (first && !filtered.some((m) => m.isCaptain)) {
        first.isCaptain = true;
      }
      return [...filtered];
    });
  };

  const setCaptain = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.map((m) => ({ ...m, isCaptain: m.id === userId }))
    );
  };

  const resetForm = () => {
    setFormData({ name: "", cohortId: "", capacity: "5" });
    setSelectedMembers([]);
    setMemberSearch("");
    setStep(1);
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.cohortId) return;
    setIsSubmitting(true);

    try {
      // Step 1: Create the team
      const team = await fetchApi<{ id: string }>("/teams", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          cohortId: formData.cohortId,
          capacity: maxCapacity,
        }),
      });

      // Step 2: Add each selected member
      for (const member of selectedMembers) {
        await fetchApi(`/teams/${team.id}/members`, {
          method: "POST",
          body: JSON.stringify({
            userId: member.id,
            role: member.isCaptain ? "TEAM_LEAD" : "STUDENT",
          }),
        });
      }

      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to create team:", err);
      setIsSubmitting(false);
    }
  };

  const canGoToStep2 = formData.name.trim() && formData.cohortId;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-foreground hover:bg-foreground/90 text-background px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 transition-all hover:scale-[1.02]">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] rounded-3xl p-0 border-border/50 shadow-xl overflow-hidden">
        {/* Step indicator */}
        <div className="px-8 pt-8 pb-0">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                step === 1
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "bg-primary/10 text-primary"
              }`}
            >
              1
            </div>
            <div className="flex-1 h-0.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: step === 2 ? "100%" : "0%" }}
              />
            </div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                step === 2
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>

          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold text-foreground">
              {step === 1 ? "Create New Team" : "Add Team Members"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              {step === 1
                ? "Set up your team's name, cohort, and capacity."
                : `Search and add students to ${formData.name}. You can also set a captain.`}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Step 1: Team Details */}
        {step === 1 && (
          <div className="px-8 pb-8 space-y-5 mt-4">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-bold text-foreground">
                Team Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g. Design Ninjas"
                value={formData.name}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
                required
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="cohortId"
                className="text-sm font-bold text-foreground"
              >
                Select Cohort *
              </Label>
              <select
                id="cohortId"
                value={formData.cohortId}
                onChange={handleChange}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="" disabled>
                  Choose a cohort
                </option>
                {cohorts.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="capacity"
                className="text-sm font-bold text-foreground"
              >
                Team Capacity
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl font-bold text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canGoToStep2}
                onClick={() => setStep(2)}
                className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2"
              >
                Add Members
                <ArrowRight className="w-4 h-4" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 2: Add Members */}
        {step === 2 && (
          <div className="px-8 pb-8 space-y-5 mt-4">
            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Selected ({selectedMembers.length}/{maxCapacity})
                  </span>
                </div>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                  {selectedMembers.map((member, idx) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                        member.isCaptain
                          ? "bg-gradient-to-r from-[#FBBF24]/10 to-[#FA8A60]/10 border border-[#FBBF24]/20"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(idx)}`}
                      >
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(member.name)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {member.name}
                          </p>
                          {member.isCaptain && (
                            <Crown className="w-3.5 h-3.5 text-[#FBBF24] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {!member.isCaptain && (
                          <button
                            type="button"
                            onClick={() => setCaptain(member.id)}
                            className="p-1.5 rounded-lg hover:bg-[#FBBF24]/20 transition-colors"
                            title="Set as Captain"
                          >
                            <Crown className="w-3.5 h-3.5 text-[#B45309]" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMember(member.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search to add */}
            {selectedMembers.length < maxCapacity && (
              <div>
                <Label className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                  <UserPlus className="w-4 h-4" />
                  Search Students
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-9 rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-11"
                  />
                </div>

                {/* Search Results */}
                {memberSearch.length > 0 && (
                  <div className="mt-2 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                    {availableUsers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {usersLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Searching...
                          </span>
                        ) : (
                          "No matching students found"
                        )}
                      </div>
                    ) : (
                      <div className="max-h-[160px] overflow-y-auto">
                        {availableUsers.map((user: any, idx: number) => (
                          <div
                            key={user.id}
                            role="button"
                            tabIndex={0}
                            className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                            onClick={() => addMember(user)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                addMember(user);
                              }
                            }}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(idx + 3)}`}
                            >
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt=""
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                getInitials(user.name)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
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

            {/* At capacity notice */}
            {selectedMembers.length >= maxCapacity && (
              <div className="p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-center">
                <p className="text-sm text-[#B45309] font-medium">
                  Team is at full capacity ({maxCapacity} members)
                </p>
              </div>
            )}

            {/* Empty state */}
            {selectedMembers.length === 0 && memberSearch.length === 0 && (
              <div className="py-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20">
                <Users className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Search for students above to add them to your team.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  You can also skip this and add members later.
                </p>
              </div>
            )}

            <DialogFooter className="pt-2 flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="rounded-xl font-bold text-muted-foreground gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {selectedMembers.length > 0
                  ? `Create Team with ${selectedMembers.length} Member${selectedMembers.length > 1 ? "s" : ""}`
                  : "Create Team"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
