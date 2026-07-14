"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { useUserRole } from "@/hooks/use-user-role";
import { Loader2, Save, User as UserIcon, Mail, Shield, Check } from "lucide-react";

export default function AccountPage() {
  const { dbUser, session, isPending, primaryRole } = useUserRole();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (dbUser) {
      setFormData({
        name: dbUser.name || "",
        bio: dbUser.bio || "",
        phone: dbUser.phone || "",
      });
    }
  }, [dbUser]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!session?.user?.id) throw new Error("Not logged in");
      
      await fetchApi(`/users/${session.user.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      await authClient.updateUser({ name: data.name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", session?.user?.id] });
      alert("Profile updated successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update profile.");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      const { error } = await authClient.changePassword({
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: true,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setPasswordData({ currentPassword: "", newPassword: "" });
      alert("Password updated successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update password.");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePasswordMutation.mutate(passwordData);
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin opacity-50"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto pb-16">
      
      {/* Header Row */}
      <div className="flex justify-between items-end mb-[30px] relative">
        <div className="relative">
          <svg className="absolute left-[-6px] top-[-22px] opacity-50 z-0 animate-dash" style={{ strokeDasharray: 340, strokeDashoffset: 340, animationDelay: '500ms' }} width="70" height="34" viewBox="0 0 70 34" fill="none">
            <path d="M2 22C10 8 18 30 26 16S42 4 50 18s14-6 18 2" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase font-semibold mb-[6px] opacity-0 animate-fade-up">
            Personal Settings
          </div>
          <h1 className="font-serif font-medium text-[36px] m-0 text-foreground relative z-10 opacity-0 animate-fade-up" style={{ animationDelay: '70ms' }}>
            My Account
          </h1>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-[24px] opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="space-y-[24px]">
          {/* Profile Form */}
          <div className="bg-card border border-border rounded-[14px] overflow-hidden">
            <div className="p-[24px_32px]">
              <div className="flex items-center gap-[12px] pb-[16px] border-b border-border/60 mb-[24px]">
                <UserIcon className="w-[18px] h-[18px] text-muted-foreground" />
                <h2 className="text-[16px] font-serif font-semibold text-foreground">Profile Information</h2>
              </div>
              
              <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-[24px]">
                <div className="space-y-[8px]">
                  <label htmlFor="name" className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Full Name</label>
                  <input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-[8px] px-[16px] py-[10px] text-[13px] text-foreground focus-visible:outline-none focus-visible:border-primary transition-colors"
                  />
                </div>
                
                <div className="space-y-[8px]">
                  <label htmlFor="email" className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Email Address</label>
                  <input
                    id="email"
                    value={dbUser?.email || ""}
                    disabled
                    className="w-full bg-muted border border-border rounded-[8px] px-[16px] py-[10px] text-[13px] text-muted-foreground cursor-not-allowed opacity-70"
                  />
                  <p className="text-[11px] text-muted-foreground">Email address cannot be changed directly.</p>
                </div>
                
                <div className="space-y-[8px]">
                  <label htmlFor="phone" className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Phone Number</label>
                  <input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-background border border-border rounded-[8px] px-[16px] py-[10px] text-[13px] text-foreground focus-visible:outline-none focus-visible:border-primary transition-colors font-mono"
                  />
                </div>
                
                <div className="space-y-[8px]">
                  <label htmlFor="bio" className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Bio / About Me</label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us a little about yourself..."
                    className="w-full bg-background border border-border rounded-[8px] px-[16px] py-[14px] text-[13px] text-foreground focus-visible:outline-none focus-visible:border-primary transition-colors min-h-[100px] resize-none"
                  />
                </div>
              </form>
            </div>
            <div className="bg-muted/30 border-t border-border p-[16px_32px] flex justify-end">
              <button 
                type="submit" 
                form="profile-form"
                disabled={updateProfileMutation.isPending}
                className="bg-primary text-primary-foreground font-semibold text-[13px] px-[20px] py-[10px] rounded-[8px] flex items-center gap-[8px] hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? <Loader2 className="w-[14px] h-[14px] animate-spin" /> : <Save className="w-[14px] h-[14px]" />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Security Form */}
          <div className="bg-card border border-border rounded-[14px] overflow-hidden">
            <div className="p-[24px_32px]">
              <div className="flex items-center gap-[12px] pb-[16px] border-b border-border/60 mb-[24px]">
                <Shield className="w-[18px] h-[18px] text-muted-foreground" />
                <h2 className="text-[16px] font-serif font-semibold text-foreground">Security</h2>
              </div>
              
              <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-[24px]">
                <div className="space-y-[8px]">
                  <label htmlFor="currentPassword" className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full bg-background border border-border rounded-[8px] px-[16px] py-[10px] text-[13px] text-foreground focus-visible:outline-none focus-visible:border-primary transition-colors font-mono"
                    required
                  />
                </div>
                
                <div className="space-y-[8px]">
                  <label htmlFor="newPassword" className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-background border border-border rounded-[8px] px-[16px] py-[10px] text-[13px] text-foreground focus-visible:outline-none focus-visible:border-primary transition-colors font-mono"
                    required
                  />
                </div>
              </form>
            </div>
            <div className="bg-muted/30 border-t border-border p-[16px_32px] flex justify-end">
              <button 
                type="submit" 
                form="password-form"
                disabled={updatePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword}
                className="bg-background text-foreground border border-border font-semibold text-[13px] px-[20px] py-[10px] rounded-[8px] flex items-center gap-[8px] hover:bg-muted transition-colors shadow-sm disabled:opacity-50"
              >
                {updatePasswordMutation.isPending && <Loader2 className="w-[14px] h-[14px] animate-spin" />}
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-[24px]">
          <div className="bg-card border border-border rounded-[14px] p-[24px]">
            <div className="flex flex-col items-center text-center">
              <div className="w-[84px] h-[84px] rounded-full bg-status-on-track/10 text-status-on-track flex items-center justify-center text-[28px] font-mono font-bold mb-[16px] shadow-inner">
                {dbUser?.name ? dbUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
              </div>
              <h3 className="text-[20px] font-serif font-semibold text-foreground">{dbUser?.name}</h3>
              <p className="text-[13px] text-muted-foreground mt-[2px] mb-[20px]">{dbUser?.email}</p>
              
              <div className="w-full bg-muted/30 rounded-[8px] p-[12px] flex flex-col items-center justify-center border border-border/50">
                <span className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase mb-[4px]">Primary Role</span>
                <span className="text-[13px] font-semibold text-primary capitalize">{primaryRole.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-[14px] p-[24px]">
            <h3 className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase mb-[16px]">Account Status</h3>
            <div className="space-y-[16px]">
              <div className="flex items-center gap-[12px]">
                <div className="w-[32px] h-[32px] rounded-[8px] bg-status-on-track/10 flex items-center justify-center shrink-0">
                  <Check className="w-[16px] h-[16px] text-status-on-track" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Active Account</p>
                  <p className="text-[11px] text-muted-foreground mt-[2px]">Your account is in good standing.</p>
                </div>
              </div>
              {dbUser?.emailVerified && (
                <div className="flex items-center gap-[12px]">
                  <div className="w-[32px] h-[32px] rounded-[8px] bg-[#EAE4F2] flex items-center justify-center shrink-0">
                    <Mail className="w-[16px] h-[16px] text-[#55387C]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Email Verified</p>
                    <p className="text-[11px] text-muted-foreground mt-[2px]">Your email has been confirmed.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
