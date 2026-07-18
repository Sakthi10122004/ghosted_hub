"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2 } from "lucide-react";

export function EditUserDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [role, setRole] = useState(user.roles?.[0]?.role || user.role || "STUDENT");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { name: string; role: string }) => {
      return fetchApi(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, role });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-none border-border">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-widest text-lg">Edit User</DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest">
            Modify user details and roles.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-mono font-bold uppercase tracking-widest">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono text-sm rounded-none border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] font-mono font-bold uppercase tracking-widest">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="font-mono text-sm bg-muted rounded-none border-border opacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-[10px] font-mono font-bold uppercase tracking-widest">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex h-9 w-full border border-input bg-card px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-none"
            >
              <option value="SUPER_ADMIN">Admin</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending} className="rounded-none font-mono uppercase tracking-widest text-[10px]">
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
