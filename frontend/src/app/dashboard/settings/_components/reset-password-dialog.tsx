"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { KeyRound, Loader2, Eye, EyeOff } from "lucide-react";

export function ResetPasswordDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (newPassword: string) => {
      return fetchApi(`/users/${user.id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ password: newPassword }),
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setError("");
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setPassword("");
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to reset password.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    mutation.mutate(password);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { setSuccess(false); setError(""); setPassword(""); } }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <KeyRound className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-none border-border">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-widest text-lg">Reset Password</DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest">
            Set a new password for {user.name || user.email}.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="py-6 text-center space-y-2">
            <div className="text-status-on-track font-mono uppercase tracking-widest text-sm font-bold">Password Reset Successful</div>
            <p className="text-xs text-muted-foreground">The user can now login with the new password.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && (
              <div className="p-2 text-xs font-mono bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2 relative">
              <Label htmlFor="new-password" className="text-[10px] font-mono font-bold uppercase tracking-widest">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono text-sm rounded-none border-border pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending} className="rounded-none font-mono uppercase tracking-widest text-[10px] w-full">
                {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
