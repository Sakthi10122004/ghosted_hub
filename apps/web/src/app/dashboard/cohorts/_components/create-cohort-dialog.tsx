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
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newCohort: { name: string }) => {
      return fetchApi("/cohorts", {
        method: "POST",
        body: JSON.stringify(newCohort),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
      setOpen(false);
      setName("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({ name });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-foreground hover:bg-foreground/90 text-background px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 transition-all hover:scale-[1.02]">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Cohort
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-8 border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">Create New Cohort</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Define a new time-bound program sprint.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-bold text-foreground">
              Cohort Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Summer 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              required
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
