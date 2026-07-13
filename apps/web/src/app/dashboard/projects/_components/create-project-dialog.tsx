"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cohortId: "",
    nonprofitId: "",
    teamId: "",
  });
  const queryClient = useQueryClient();

  // Fetch dropdown data
  const { data: cohortsData } = useQuery({
    queryKey: ["cohorts"],
    queryFn: () => fetchApi<{ data: any[] }>("/cohorts?limit=50"),
  });
  const { data: nonprofitsData } = useQuery({
    queryKey: ["nonprofits"],
    queryFn: () => fetchApi<{ data: any[] }>("/nonprofits?limit=50"),
  });
  const { data: teamsData } = useQuery({
    queryKey: ["teams"],
    queryFn: () => fetchApi<{ data: any[] }>("/teams?limit=50"),
  });

  const cohorts = Array.isArray(cohortsData?.data) ? cohortsData.data : [];
  const nonprofits = Array.isArray(nonprofitsData?.data) ? nonprofitsData.data : [];
  const teams = Array.isArray(teamsData?.data) ? teamsData.data : [];

  const mutation = useMutation({
    mutationFn: (newProject: any) => {
      // Clean up empty teamId
      const payload = { ...newProject };
      if (!payload.teamId) delete payload.teamId;

      return fetchApi("/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        cohortId: "",
        nonprofitId: "",
        teamId: "",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cohortId || !formData.nonprofitId) return;
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-foreground hover:bg-foreground/90 text-background px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 transition-all hover:scale-[1.02]">
          <PlusCircle className="mr-2 w-4 h-4" />
          Map New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-3xl p-8 border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">Map New Project</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Link a student team to a nonprofit organization for a specific cohort.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-bold text-foreground">Project Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Wildlife Trust Website Redesign"
              value={formData.name}
              onChange={handleChange}
              className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-bold text-foreground">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the goals..."
              value={formData.description}
              onChange={handleChange}
              className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary px-4 py-3 resize-none h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="cohortId" className="text-sm font-bold text-foreground">Cohort *</Label>
              <select
                id="cohortId"
                value={formData.cohortId}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-muted/50 focus-visible:ring-primary h-12 px-4 text-sm"
                required
              >
                <option value="">Select Cohort...</option>
                {cohorts.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="nonprofitId" className="text-sm font-bold text-foreground">Nonprofit *</Label>
              <select
                id="nonprofitId"
                value={formData.nonprofitId}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-muted/50 focus-visible:ring-primary h-12 px-4 text-sm"
                required
              >
                <option value="">Select Nonprofit...</option>
                {nonprofits.map((np: any) => (
                  <option key={np.id} value={np.id}>{np.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="teamId" className="text-sm font-bold text-foreground">Assigned Team</Label>
            <select
              id="teamId"
              value={formData.teamId}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-muted/50 focus-visible:ring-primary h-12 px-4 text-sm"
            >
              <option value="">Select Student Team (Optional)...</option>
              {teams.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
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
              disabled={mutation.isPending}
              className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Project Mapping
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
