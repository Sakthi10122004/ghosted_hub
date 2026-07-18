"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { fetchApi } from "@/lib/api-client";
import { useUserRole } from "@/hooks/use-user-role";
import { InviteUserDialog } from "./_components/invite-user-dialog";
import { EditUserDialog } from "./_components/edit-user-dialog";
import { DeleteUserDialog } from "./_components/delete-user-dialog";
import { RevokeInviteDialog } from "./_components/revoke-invite-dialog";
import { ResetPasswordDialog } from "./_components/reset-password-dialog";
import {
  Settings as SettingsIcon, Users, Bell, Shield,
  Save, Check, Loader2, Mail, X, Lock,
} from "lucide-react";
import { useAlert } from "@/hooks/use-alert";

// ── Constants ──

const ROLE_COLORS: Record<string, { bg: string, text: string }> = {
  SUPER_ADMIN: { bg: "bg-destructive/10", text: "text-destructive" },
  ORGANIZER: { bg: "bg-status-attention/10", text: "text-status-attention" },
  STUDENT: { bg: "bg-primary/10", text: "text-primary" },
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Admin",
  ORGANIZER: "Organizer",
  STUDENT: "Student",
};

export default function SettingsPage() {
  const { isPending, isStudent } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && isStudent) {
      router.push("/dashboard");
    }
  }, [isPending, isStudent, router]);

  if (isPending) return null;

  return (
    <div className="max-w-[1320px] mx-auto pb-16">
      
      {/* Header Row */}
      <div className="flex justify-between items-end mb-[30px] relative">
        <div className="relative">
          <svg className="absolute left-[-6px] top-[-22px] opacity-50 z-0 animate-dash" style={{ strokeDasharray: 340, strokeDashoffset: 340, animationDelay: '500ms' }} width="70" height="34" viewBox="0 0 70 34" fill="none">
            <path d="M2 22C10 8 18 30 26 16S42 4 50 18s14-6 18 2" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase font-semibold mb-[6px] opacity-0 animate-fade-up">
            Platform Configuration
          </div>
          <h1 className="font-serif font-medium text-[36px] m-0 text-foreground relative z-10 opacity-0 animate-fade-up" style={{ animationDelay: '70ms' }}>
            Settings
          </h1>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none p-0 h-auto gap-[24px]">
          {[
            { value: "general", label: "General", icon: SettingsIcon },
            { value: "users", label: "Users & Roles", icon: Users },
            { value: "notifications", label: "Notifications", icon: Bell },
          ].map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              className="flex items-center gap-[8px] px-0 py-[12px] text-[12px] font-semibold tracking-wider uppercase border-b-[2px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground rounded-none shadow-none bg-transparent data-[state=active]:shadow-none transition-colors"
            >
              <tab.icon className="w-[14px] h-[14px]" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="mt-[32px] focus-visible:outline-none">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="users" className="mt-[32px] focus-visible:outline-none">
          <UsersSettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-[32px] focus-visible:outline-none">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── General Settings ──
function GeneralSettings() {
  return (
    <div className="space-y-[32px] max-w-4xl animate-fade-up">
      <div className="bg-card border border-border rounded-[14px] overflow-hidden">
        <div className="p-[24px_32px]">
          <div className="flex items-center gap-[12px] pb-[16px] border-b border-border/60 mb-[24px]">
            <SettingsIcon className="w-[18px] h-[18px] text-muted-foreground" />
            <h2 className="text-[16px] font-serif font-semibold text-foreground">Platform Defaults</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-[24px]">
            {[
              { label: "Platform Name", value: "Ghosted Hub", placeholder: "Platform name" },
              { label: "Organization", value: "Tech4Good Community", placeholder: "Organization" },
              { label: "Default Timezone", value: "America/New_York", placeholder: "Timezone" },
              { label: "Support Email", value: "support@ghosted.org", placeholder: "Email" },
            ].map((field) => (
              <div key={field.label} className="space-y-[8px]">
                <label className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">{field.label}</label>
                <input
                  type="text"
                  defaultValue={field.value}
                  placeholder={field.placeholder}
                  className="w-full bg-background border border-border rounded-[8px] px-[16px] py-[10px] text-[13px] text-foreground focus-visible:outline-none focus-visible:border-primary transition-colors"
                />
              </div>
            ))}
          </div>
          <div className="space-y-[8px] md:w-1/2 mt-[24px]">
            <label className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Current Cohort</label>
            <select className="w-full bg-background border border-border rounded-[8px] px-[16px] py-[10px] text-[13px] text-foreground focus-visible:outline-none focus-visible:border-primary transition-colors cursor-pointer">
              <option>Cohort 8 — Spring 2026</option>
              <option>Cohort 7 — Fall 2025</option>
            </select>
          </div>
        </div>
        <div className="bg-muted/30 border-t border-border p-[16px_32px] flex justify-end">
          <button className="bg-primary text-primary-foreground font-semibold text-[13px] px-[20px] py-[10px] rounded-[8px] flex items-center gap-[8px] hover:bg-primary/90 transition-colors shadow-sm">
            <Save className="w-[14px] h-[14px]" /> Save Changes
          </button>
        </div>
      </div>

      <SmtpSettings />

          <RolePermissionsEditor />
    </div>
  );
}

function UsersSettings() {
  const [roleFilter, setRoleFilter] = useState("all");
  
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchApi<{ data: any[] }>("/users"),
  });
  
  const { data: invitesData, isLoading: invitesLoading } = useQuery({
    queryKey: ["invitations", "pending"],
    queryFn: () => fetchApi<{ data: any[] }>("/invitations/pending"),
  });

  const isLoading = usersLoading || invitesLoading;
  
  const users = usersData?.data || [];
  const invites = invitesData?.data || [];

  // Map invitations to user-like objects for the table
  const pendingUsers = invites.map((inv: any) => ({
    id: inv.id,
    email: inv.email,
    name: "Pending Invite",
    isActive: false,
    isInvitation: true,
    roles: [{ role: inv.role }],
    role: inv.role,
  }));

  const allUsers = [...pendingUsers, ...users];
  const filtered = roleFilter === "all" ? allUsers : allUsers.filter((u: any) => u.roles?.[0]?.role === roleFilter || u.role === roleFilter);

  return (
    <div className="space-y-[24px] max-w-5xl animate-fade-up">
      <div className="flex items-center justify-between">
        <select 
          className="bg-card border border-border rounded-[8px] px-[16px] py-[8px] text-[12px] font-semibold text-foreground focus-visible:outline-none focus-visible:border-primary shadow-sm cursor-pointer"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <InviteUserDialog />
      </div>

      <div className="bg-card border border-border rounded-[14px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-[14px_24px] text-[10.5px] font-mono tracking-widest uppercase text-muted-foreground font-semibold border-r border-border/50">User</th>
                <th className="text-left p-[14px_24px] text-[10.5px] font-mono tracking-widest uppercase text-muted-foreground font-semibold border-r border-border/50">Role</th>
                <th className="text-left p-[14px_24px] text-[10.5px] font-mono tracking-widest uppercase text-muted-foreground font-semibold border-r border-border/50">Status</th>
                <th className="text-right p-[14px_24px] text-[10.5px] font-mono tracking-widest uppercase text-muted-foreground font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-[48px] text-center text-muted-foreground text-[13px] flex items-center justify-center gap-[8px]">
                    <Loader2 className="w-[16px] h-[16px] animate-spin" />
                    Loading users...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-[48px] text-center text-muted-foreground text-[13px]">No users found.</td>
                </tr>
              ) : (
                filtered.map((user: any) => {
                  const role = user.roles?.[0]?.role || user.role || "STUDENT";
                  const initials = user.isInvitation ? "@" : (user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : "U");
                  const status = user.isInvitation ? "Invited" : (user.isActive ? "Active" : "Inactive");
                  const colorConfig = ROLE_COLORS[role] || ROLE_COLORS.STUDENT || { bg: "bg-[#DEEAE7]", text: "text-[#0A4F44]" };
                  
                  return (
                    <tr key={user.id} className="hover:bg-muted/40 transition-colors group">
                      <td className="p-[16px_24px] border-r border-border/50">
                        <div className="flex items-center gap-[14px]">
                          <div className="w-[36px] h-[36px] rounded-[9px] bg-secondary flex items-center justify-center text-[12px] font-mono font-bold text-secondary-foreground shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <div className="text-[14px] font-semibold text-foreground">{user.name || 'Unnamed User'}</div>
                            <div className="text-[12px] text-muted-foreground mt-[2px]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-[16px_24px] border-r border-border/50">
                        <span className={`inline-flex items-center px-[8px] py-[3px] rounded-[4px] text-[9.5px] font-bold uppercase tracking-wider ${colorConfig.bg} ${colorConfig.text}`}>
                          {ROLE_LABELS[role] || role}
                        </span>
                      </td>
                      <td className="p-[16px_24px] border-r border-border/50">
                        <div className="flex items-center gap-[8px]">
                          <div className={`w-[8px] h-[8px] rounded-full ${status === "Active" ? "bg-status-on-track" : "bg-status-attention"}`}></div>
                          <span className="text-[12.5px] font-medium text-foreground">{status}</span>
                        </div>
                      </td>
                      <td className="p-[16px_24px] text-right">
                        <div className="flex items-center justify-end gap-[4px] opacity-0 group-hover:opacity-100 transition-opacity">
                          {!user.isInvitation && <ResetPasswordDialog user={user} />}
                          {!user.isInvitation && <EditUserDialog user={user} />}
                          {!user.isInvitation && <DeleteUserDialog user={user} />}
                          {user.isInvitation && <RevokeInviteDialog invite={user} />}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    reviewAssigned: true, reviewCompleted: true, projectBlocked: true,
    weeklyDigest: false, mentionNotif: true, deadlineReminder: true,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="bg-card border border-border rounded-[14px] overflow-hidden max-w-4xl animate-fade-up">
      <div className="p-[24px_32px]">
        <div className="flex items-center gap-[12px] pb-[16px] border-b border-border/60 mb-[24px]">
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          <h2 className="text-[16px] font-serif font-semibold text-foreground">Notification Preferences</h2>
        </div>
        <div className="space-y-[20px]">
          {[
            { key: "reviewAssigned" as const, label: "Review Assigned", desc: "When a new review is assigned to you" },
            { key: "reviewCompleted" as const, label: "Review Completed", desc: "When a review you submitted is approved or needs changes" },
            { key: "projectBlocked" as const, label: "Project Blocked", desc: "When a project in your portfolio is marked as blocked" },
            { key: "deadlineReminder" as const, label: "Deadline Reminders", desc: "24h and 72h reminders before deliverable deadlines" },
            { key: "mentionNotif" as const, label: "Mentions", desc: "When someone mentions you in a comment or note" },
            { key: "weeklyDigest" as const, label: "Weekly Digest", desc: "Weekly summary email of program activity" },
          ].map((item) => (
            <div key={item.key} className="flex items-start justify-between">
              <div>
                <p className="text-[14px] font-semibold text-foreground">{item.label}</p>
                <p className="text-[12.5px] text-muted-foreground mt-[2px]">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative inline-flex h-[22px] w-[42px] items-center rounded-full transition-colors ${prefs[item.key] ? "bg-primary" : "bg-muted border border-border"}`}
              >
                <span className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform shadow-sm ${prefs[item.key] ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-muted/30 border-t border-border p-[16px_32px] flex justify-end">
        <button className="bg-primary text-primary-foreground font-semibold text-[13px] px-[20px] py-[10px] rounded-[8px] flex items-center gap-[8px] hover:bg-primary/90 transition-colors shadow-sm">
          <Save className="w-[14px] h-[14px]" /> Save Preferences
        </button>
      </div>
    </div>
  );
}

function SmtpSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    SMTP_USER: "",
    SMTP_PASSWORD: "",
  });
  const [AlertDialogComponent, customAlert] = useAlert();

  const { isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetchApi<{ data: Record<string, string> }>("/settings");
      setFormData({
        SMTP_USER: res.data.SMTP_USER || "",
        SMTP_PASSWORD: res.data.SMTP_PASSWORD || "",
      });
      return res;
    },
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      return fetchApi("/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      customAlert("Success", "SMTP settings saved successfully!");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <>
    <AlertDialogComponent />
    <div className="bg-card border border-border rounded-[14px] overflow-hidden">
      <div className="p-[24px_32px]">
        <div className="flex items-center gap-[12px] pb-[16px] border-b border-border/60 mb-[16px]">
          <Mail className="w-[18px] h-[18px] text-muted-foreground" />
          <h2 className="text-[16px] font-serif font-semibold text-foreground">Email Configuration (SMTP)</h2>
        </div>
        <p className="text-[13px] text-muted-foreground mb-[24px]">
          Configure Google App Password to enable sending invitation emails to new users.
        </p>
        
        {isLoading ? (
          <div className="py-[16px] text-[13px] text-muted-foreground flex items-center gap-[8px]">
            <Loader2 className="w-[16px] h-[16px] animate-spin" />
            Loading settings...
          </div>
        ) : (
          <form id="smtp-form" onSubmit={handleSubmit} className="space-y-[24px]">
            <div className="grid md:grid-cols-2 gap-[24px]">
              <div className="space-y-[8px]">
                <label htmlFor="SMTP_USER" className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Google Email</label>
                <input
                  id="SMTP_USER"
                  type="email"
                  value={formData.SMTP_USER}
                  onChange={handleChange}
                  placeholder="admin@ghosted.org"
                  className="w-full bg-background border border-border rounded-[8px] px-[16px] py-[10px] text-[13px] text-foreground focus-visible:outline-none focus-visible:border-primary transition-colors"
                />
              </div>
              <div className="space-y-[8px]">
                <label htmlFor="SMTP_PASSWORD" className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">App Password</label>
                <input
                  id="SMTP_PASSWORD"
                  type="password"
                  value={formData.SMTP_PASSWORD}
                  onChange={handleChange}
                  placeholder="16-character App Password"
                  className="w-full bg-background border border-border rounded-[8px] px-[16px] py-[10px] text-[13px] text-foreground focus-visible:outline-none focus-visible:border-primary transition-colors font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-[6px]">
                  Create an App Password in your Google Account security settings.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
      
      {!isLoading && (
        <div className="bg-muted/30 border-t border-border p-[16px_32px] flex justify-end">
          <button 
            type="submit" 
            form="smtp-form"
            disabled={mutation.isPending}
            className="bg-primary text-primary-foreground font-semibold text-[13px] px-[20px] py-[10px] rounded-[8px] flex items-center gap-[8px] hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="w-[14px] h-[14px] animate-spin" /> : <Save className="w-[14px] h-[14px]" />}
            Save Configuration
          </button>
        </div>
      )}
    </div>
    </>
  );
}

// ── Permission labels mapping ──
const PERMISSION_LABELS: Record<string, string> = {
  manage_projects: "Manage Projects",
  submit_reviews: "Submit Reviews",
  approve_reviews: "Approve Reviews",
  upload_files: "Upload Files",
  manage_users: "Manage Users",
  view_deployments: "View Deployments",
  platform_settings: "Platform Settings",
};

const ROLE_KEYS = ["admin", "organizer", "student"] as const;
const ROLE_HEADERS: Record<string, string> = {
  admin: "Admin",
  organizer: "Organizer",
  student: "Student",
};

function RolePermissionsEditor() {
  const queryClient = useQueryClient();
  const [AlertDialogComponent, customAlert] = useAlert();
  const [savingCell, setSavingCell] = useState<string | null>(null);

  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ["role-permissions"],
    queryFn: () => fetchApi<{ data: Record<string, Record<string, boolean>> }>("/settings/permissions"),
  });

  const mutation = useMutation({
    mutationFn: (data: Record<string, Record<string, boolean>>) => {
      return fetchApi("/settings/permissions", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      setSavingCell(null);
    },
    onError: (err: any) => {
      setSavingCell(null);
      customAlert("Error", err.message || "Failed to update permissions.");
    },
  });

  const permissions = permissionsData?.data;

  const handleToggle = (permKey: string, roleKey: string) => {
    // Admin permissions are locked
    if (roleKey === "admin") return;
    if (!permissions) return;

    const cellId = `${permKey}-${roleKey}`;
    setSavingCell(cellId);

    const updated = { ...permissions };
    updated[permKey] = {
      ...updated[permKey],
      [roleKey]: !updated[permKey][roleKey],
    };

    mutation.mutate(updated);
  };

  return (
    <>
    <AlertDialogComponent />
    <div className="bg-card border border-border rounded-[14px] overflow-hidden">
      <div className="p-[24px_32px]">
        <div className="flex items-center justify-between pb-[16px] border-b border-border/60 mb-[24px]">
          <div className="flex items-center gap-[12px]">
            <Shield className="w-[18px] h-[18px] text-muted-foreground" />
            <h2 className="text-[16px] font-serif font-semibold text-foreground">Role Permissions</h2>
          </div>
          {mutation.isPending && (
            <div className="flex items-center gap-[6px] text-[11px] text-muted-foreground">
              <Loader2 className="w-[12px] h-[12px] animate-spin" />
              Saving...
            </div>
          )}
        </div>

        <p className="text-[12.5px] text-muted-foreground mb-[20px]">
          Click on a cell to toggle permissions for each role. Admin permissions are locked and cannot be changed.
        </p>
        
        <div className="border border-border rounded-[10px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left p-[12px_20px] text-[10.5px] font-mono tracking-widest uppercase text-muted-foreground font-semibold border-r border-border">Permission</th>
                  {ROLE_KEYS.map((role) => (
                    <th key={role} className="text-center p-[12px_16px] text-[10.5px] font-mono tracking-widest uppercase text-muted-foreground font-semibold border-r border-border last:border-0">
                      <div className="flex items-center justify-center gap-[4px]">
                        {ROLE_HEADERS[role]}
                        {role === "admin" && <Lock className="w-[10px] h-[10px] opacity-40" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-[48px] text-center text-muted-foreground text-[13px]">
                      <div className="flex items-center justify-center gap-[8px]">
                        <Loader2 className="w-[16px] h-[16px] animate-spin" />
                        Loading permissions...
                      </div>
                    </td>
                  </tr>
                ) : permissions && Object.entries(permissions).map(([permKey, roles]) => (
                  <tr key={permKey} className="group">
                    <td className="p-[14px_20px] font-medium text-foreground border-r border-border">
                      {PERMISSION_LABELS[permKey] || permKey}
                    </td>
                    {ROLE_KEYS.map((roleKey) => {
                      const isEnabled = roles[roleKey];
                      const isAdmin = roleKey === "admin";
                      const cellId = `${permKey}-${roleKey}`;
                      const isSaving = savingCell === cellId;

                      return (
                        <td key={roleKey} className="text-center p-[14px_16px] border-r border-border last:border-0">
                          <button
                            type="button"
                            onClick={() => handleToggle(permKey, roleKey)}
                            disabled={isAdmin || isSaving}
                            className={`inline-flex items-center justify-center w-[28px] h-[28px] rounded-[6px] transition-all duration-200 ${
                              isAdmin
                                ? "bg-status-on-track/10 text-status-on-track cursor-not-allowed opacity-60"
                                : isEnabled
                                  ? "bg-status-on-track/10 text-status-on-track hover:bg-status-on-track/20 hover:scale-110 cursor-pointer"
                                  : "bg-transparent text-muted-foreground/25 hover:bg-destructive/10 hover:text-destructive/60 hover:scale-110 cursor-pointer"
                            }`}
                            title={
                              isAdmin
                                ? "Admin permissions are locked"
                                : isEnabled
                                  ? `Revoke "${PERMISSION_LABELS[permKey]}" from ${ROLE_HEADERS[roleKey]}`
                                  : `Grant "${PERMISSION_LABELS[permKey]}" to ${ROLE_HEADERS[roleKey]}`
                            }
                          >
                            {isSaving ? (
                              <Loader2 className="w-[14px] h-[14px] animate-spin" />
                            ) : isEnabled ? (
                              <Check className="w-[14px] h-[14px]" />
                            ) : (
                              <X className="w-[12px] h-[12px]" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
