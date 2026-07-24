"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch && token;

  // Redirect after success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success) {
      timer = setTimeout(() => {
        router.push("/login");
      }, 2500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const response = await fetch(`${baseUrl}/invitations/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to set up your account.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Invalid token state
  if (!token) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center lg:text-left border-b border-border pb-4">
          <h1 className="text-2xl font-mono font-bold uppercase tracking-widest text-foreground">Invalid Link</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
            Missing invite token
          </p>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">This invitation link is invalid or incomplete.</p>
            <p className="text-xs text-muted-foreground mt-1">Please check the link from your email and try again, or contact your administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center lg:text-left border-b border-border pb-4">
          <h1 className="text-2xl font-mono font-bold uppercase tracking-widest text-foreground">Account Ready</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
            Credentials configured
          </p>
        </div>
        <div className="flex flex-col items-center lg:items-start gap-4 py-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary animate-in zoom-in duration-300" />
          </div>
          <div className="text-center lg:text-left space-y-1">
            <p className="text-base font-semibold text-foreground">Your password has been set successfully!</p>
            <p className="text-sm text-muted-foreground">Redirecting you to sign in...</p>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mt-2">
            <div className="bg-primary h-full rounded-full animate-[progress_2.5s_ease-in-out_forwards]" />
          </div>
        </div>
        <style jsx>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left border-b border-border pb-4">
        <h1 className="text-2xl font-mono font-bold uppercase tracking-widest text-foreground">Set Password</h1>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
          Initialize your credentials
        </p>
      </div>

      {/* Welcome message */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Welcome to Ghosted, {name || "team member"}!</p>
          <p className="text-xs text-muted-foreground mt-0.5">Create a secure password to activate your account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="invite-email" className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Email</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            readOnly
            className="h-10 bg-muted/50 text-muted-foreground cursor-not-allowed"
          />
        </div>

        {/* Name (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="invite-name" className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Name</Label>
          <Input
            id="invite-name"
            value={name}
            readOnly
            className="h-10 bg-muted/50 text-muted-foreground cursor-not-allowed"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="invite-password" className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Password</Label>
          <div className="relative">
            <Input
              id="invite-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 pr-10"
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

        {/* Password strength indicators */}
        {password.length > 0 && (
          <div className="space-y-1.5 px-1">
            <StrengthCheck passed={hasMinLength} label="At least 8 characters" />
            <StrengthCheck passed={hasUppercase} label="One uppercase letter" />
            <StrengthCheck passed={hasNumber} label="One number" />
          </div>
        )}

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="invite-confirm-password" className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Confirm Password</Label>
          <div className="relative">
            <Input
              id="invite-confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-destructive font-mono mt-1">Passwords do not match</p>
          )}
          {passwordsMatch && (
            <p className="text-xs text-primary font-mono mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Passwords match
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-10 mt-2" 
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Setting up account...
            </span>
          ) : (
            "Activate Account"
          )}
        </Button>
      </form>
    </div>
  );
}

function StrengthCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${passed ? "bg-primary" : "bg-muted-foreground/30"}`} />
      <span className={`text-[11px] font-mono transition-colors duration-200 ${passed ? "text-primary" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="space-y-2 text-center lg:text-left border-b border-border pb-4">
          <h1 className="text-2xl font-mono font-bold uppercase tracking-widest text-foreground">Set Password</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
            Loading invitation...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}
