"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export function CreateCohortDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sprintStartDate: "",
    sprintEndDate: "",
    maxTeams: "",
    maxStudentsPerTeam: "",
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newCohort: any) => {
      return fetchApi("/cohorts", {
        method: "POST",
        body: JSON.stringify(newCohort),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        sprintStartDate: "",
        sprintEndDate: "",
        maxTeams: "",
        maxStudentsPerTeam: "",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    // Parse dates and numbers before sending
    const payload = {
      ...formData,
      sprintStartDate: formData.sprintStartDate ? new Date(formData.sprintStartDate).toISOString() : null,
      sprintEndDate: formData.sprintEndDate ? new Date(formData.sprintEndDate).toISOString() : null,
      maxTeams: formData.maxTeams ? parseInt(formData.maxTeams) : null,
      maxStudentsPerTeam: formData.maxStudentsPerTeam ? parseInt(formData.maxStudentsPerTeam) : null,
    };
    
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-foreground hover:bg-foreground/90 text-background px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 transition-all hover:scale-[1.02]">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Cohort
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-3xl p-8 border-border/50 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">Create New Cohort</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Define a new time-bound program sprint.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 col-span-2">
              <Label htmlFor="name" className="text-sm font-bold text-foreground">Cohort Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Summer 2026"
                value={formData.name}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
                required
              />
            </div>
            
            <div className="space-y-3 col-span-2">
              <Label htmlFor="description" className="text-sm font-bold text-foreground">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of this cohort"
                value={formData.description}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="sprintStartDate" className="text-sm font-bold text-foreground">Start Date</Label>
              <Input
                id="sprintStartDate"
                type="date"
                value={formData.sprintStartDate}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="sprintEndDate" className="text-sm font-bold text-foreground">End Date</Label>
              <Input
                id="sprintEndDate"
                type="date"
                value={formData.sprintEndDate}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="maxTeams" className="text-sm font-bold text-foreground">Max Teams</Label>
              <Input
                id="maxTeams"
                type="number"
                placeholder="e.g. 10"
                value={formData.maxTeams}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="maxStudentsPerTeam" className="text-sm font-bold text-foreground">Students per Team</Label>
              <Input
                id="maxStudentsPerTeam"
                type="number"
                placeholder="e.g. 5"
                value={formData.maxStudentsPerTeam}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              />
            </div>
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
              Create Cohort
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
