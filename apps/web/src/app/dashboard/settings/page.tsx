"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { fetchApi } from "@/lib/api-client";
import { useUserRole } from "@/hooks/use-user-role";
import { InviteUserDialog } from "./_components/invite-user-dialog";
import { EditUserDialog } from "./_components/edit-user-dialog";
import { DeleteUserDialog } from "./_components/delete-user-dialog";
import { ResetPasswordDialog } from "./_components/reset-password-dialog";
import {
  Settings as SettingsIcon, Users, Bell, Shield,
  Save, Check, Loader2, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Constants ──

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border border-destructive/20",
  event_manager: "bg-purple-100 text-purple-700 border border-purple-200",
  student: "bg-blue-100 text-blue-700 border border-blue-200",
  npo: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  event_manager: "Event Manager",
  student: "Student",
  npo: "NPO Partner",
};

// ── Page ──
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold uppercase tracking-widest text-foreground">Settings</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Platform preferences, user management, and notifications.</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none p-0 h-auto gap-4">
          {[
            { value: "general", label: "General", icon: SettingsIcon },
            { value: "users", label: "Users & Roles", icon: Users },
            { value: "notifications", label: "Notifications", icon: Bell },
          ].map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              className="flex items-center gap-2 px-1 py-3 text-[10px] font-mono font-bold uppercase tracking-widest border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground hover:text-foreground rounded-none shadow-none bg-transparent data-[state=active]:shadow-none"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="mt-6 focus-visible:outline-none">
          <GeneralSettings />
        </TabsContent>

        {/* Users & Roles Tab */}
        <TabsContent value="users" className="mt-6 focus-visible:outline-none">
          <UsersSettings />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 focus-visible:outline-none">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── General Settings ──
function GeneralSettings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <SettingsIcon className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground">Platform Settings</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Platform Name", value: "Ghosted Hub", placeholder: "Platform name" },
              { label: "Organization", value: "Tech4Good Community", placeholder: "Organization" },
              { label: "Default Timezone", value: "America/New_York", placeholder: "Timezone" },
              { label: "Support Email", value: "support@ghosted.org", placeholder: "Email" },
            ].map((field) => (
              <div key={field.label} className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">{field.label}</label>
                <Input
                  type="text"
                  defaultValue={field.value}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
          <div className="space-y-1.5 md:w-1/2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">Current Cohort</label>
            <select className="flex h-9 w-full border border-input bg-card px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option>Cohort 8 — Spring 2026</option>
              <option>Cohort 7 — Fall 2025</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end">
            <Button>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Settings */}
      <SmtpSettings />

      {/* Role Permissions Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground">Role Permissions Overview</h2>
          </div>
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground border-r border-border/50">Permission</th>
                  {["Admin", "Event Manager", "Student", "NPO"].map((r) => (
                    <th key={r} className="text-center px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground border-r border-border/50">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { perm: "Manage Projects", admin: true, em: true, student: false, npo: false },
                  { perm: "Submit Reviews", admin: true, em: true, student: true, npo: false },
                  { perm: "Approve Reviews", admin: true, em: true, student: false, npo: false },
                  { perm: "Upload Files", admin: true, em: true, student: true, npo: true },
                  { perm: "Manage Users", admin: true, em: false, student: false, npo: false },
                  { perm: "View Deployments", admin: true, em: false, student: false, npo: false },
                  { perm: "Platform Settings", admin: true, em: false, student: false, npo: false },
                ].map((row) => (
                  <tr key={row.perm} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground text-sm">{row.perm}</td>
                    {[row.admin, row.em, row.student, row.npo].map((v, i) => (
                      <td key={i} className="text-center px-4 py-3">
                        {v ? (
                          <span className="inline-flex items-center justify-center">
                            <Check className="w-4 h-4 text-status-on-track" />
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersSettings() {
  const [roleFilter, setRoleFilter] = useState("all");
  
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchApi<{ data: any[] }>("/users"),
  });
  
  const users = data?.data || [];
  const filtered = roleFilter === "all" ? users : users.filter((u: any) => u.roles?.[0]?.role === roleFilter || u.role === roleFilter);

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select 
            className="flex h-9 w-40 border border-input bg-card px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <InviteUserDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground w-1/3 border-r border-border/50">User</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground border-r border-border/50">Role</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground border-r border-border/50">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">Loading users...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">No users found.</td>
                  </tr>
                ) : (
                  filtered.map((user: any) => {
                    const role = user.roles?.[0]?.role || user.role || "student";
                    const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : "U";
                    const status = user.isActive ? "Active" : "Invited";
                    
                    return (
                      <tr key={user.id} className="hover:bg-muted/40 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-secondary-foreground">
                              {initials}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">{user.name || 'Unnamed User'}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${ROLE_COLORS[role] || ROLE_COLORS.student}`}>
                            {ROLE_LABELS[role] || role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${status === "Active" ? "bg-status-on-track" : "bg-status-attention"}`}></div>
                            <span className="text-xs text-muted-foreground">{status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ResetPasswordDialog user={user} />
                            <EditUserDialog user={user} />
                            <DeleteUserDialog user={user} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Notification Settings ──
function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    reviewAssigned: true, reviewCompleted: true, projectBlocked: true,
    weeklyDigest: false, mentionNotif: true, deadlineReminder: true,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <Card className="max-w-4xl">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border/60">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Notification Preferences</h2>
        </div>
        <div className="space-y-4">
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
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${prefs[item.key] ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs[item.key] ? "translate-x-4" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-border/60 flex justify-end">
          <Button>
            <Save className="w-4 h-4 mr-2" /> Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── SMTP Settings ──
function SmtpSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    SMTP_USER: "",
    SMTP_PASSWORD: "",
  });

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
      alert("SMTP settings saved successfully!");
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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border/60 mb-6">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Email Configuration (SMTP)</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Configure Google App Password to enable sending invitation emails to new users.
        </p>
        
        {isLoading ? (
          <div className="py-4 text-sm text-muted-foreground">Loading settings...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="SMTP_USER" className="text-sm font-medium text-foreground">Google Email</label>
                <Input
                  id="SMTP_USER"
                  type="email"
                  value={formData.SMTP_USER}
                  onChange={handleChange}
                  placeholder="admin@ghosted.org"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="SMTP_PASSWORD" className="text-sm font-medium text-foreground">App Password</label>
                <Input
                  id="SMTP_PASSWORD"
                  type="password"
                  value={formData.SMTP_PASSWORD}
                  onChange={handleChange}
                  placeholder="16-character App Password"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Do not use your personal password. Create an App Password in your Google Account settings.
                </p>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Configuration
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
