"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      if (error) {
        setError(error.message || "Failed to sign in");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left border-b border-border pb-4">
        <h1 className="text-2xl font-mono font-bold uppercase tracking-widest text-foreground">Sign in</h1>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
          Authenticate session
        </p>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-4">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md font-medium">{error}</div>}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Password</Label>
            <Link
              href="#"
              className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
            >
              Recover Key
            </Link>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
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
        
        <Button type="submit" className="w-full h-10 mt-2" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      
      <div className="text-center lg:text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        NO ACCOUNT?{" "}
        <Link href="/register" className="text-primary font-bold hover:bg-primary/10 transition-colors">
          INITIALIZE
        </Link>
      </div>
    </div>
  );
}
