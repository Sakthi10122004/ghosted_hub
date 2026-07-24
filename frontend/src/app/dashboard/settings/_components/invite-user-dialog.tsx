"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { useAlert } from "@/hooks/use-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "STUDENT",
  });
  const queryClient = useQueryClient();
  const [AlertDialogComponent, customAlert] = useAlert();

  const mutation = useMutation({
    mutationFn: (newUser: any) => {
      return fetchApi("/invitations", {
        method: "POST",
        body: JSON.stringify(newUser),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      setFormData({ name: "", email: "", role: "STUDENT" });
      customAlert("Success", "Invitation sent successfully!");
    },
    onError: (err: any) => {
      customAlert("Error", err.message || "Failed to send invitation.");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    mutation.mutate(formData);
  };

  return (
    <>
    <AlertDialogComponent />
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 hover:scale-[1.02] transition-all">
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-8 border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">Invite User</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Send an invitation to join the Ghosted platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-bold text-foreground">
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g. Maya Alvarez"
              value={formData.name}
              onChange={handleChange}
              className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              required
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-bold text-foreground">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. maya@ghosted.org"
              value={formData.email}
              onChange={handleChange}
              className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="role" className="text-sm font-bold text-foreground">
              Assign Role *
            </Label>
            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
              className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="SUPER_ADMIN">Admin</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="STUDENT">Student</option>
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
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
