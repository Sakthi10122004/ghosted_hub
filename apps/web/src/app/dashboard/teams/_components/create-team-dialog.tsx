"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cohortId, setCohortId] = useState("");
  const queryClient = useQueryClient();

  const { data: cohortsData } = useQuery({
    queryKey: ["cohorts"],
    queryFn: () => fetchApi<{ data: any[] }>("/cohorts"),
  });
  const cohorts = cohortsData?.data || [];

  const mutation = useMutation({
    mutationFn: (newTeam: { name: string; cohortId: string }) => {
      return fetchApi("/teams", {
        method: "POST",
        body: JSON.stringify(newTeam),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setOpen(false);
      setName("");
      setCohortId("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cohortId) return;
    mutation.mutate({ name, cohortId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-foreground hover:bg-foreground/90 text-background px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 transition-all hover:scale-[1.02]">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-8 border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">Create New Team</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Form a new student team for a cohort.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-bold text-foreground">
              Team Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Design Ninjas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              required
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="cohort" className="text-sm font-bold text-foreground">
              Select Cohort
            </Label>
            <select
              id="cohort"
              value={cohortId}
              onChange={(e) => setCohortId(e.target.value)}
              className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="" disabled>Choose a cohort</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
              type="submit" 
              disabled={mutation.isPending || !cohortId}
              className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
