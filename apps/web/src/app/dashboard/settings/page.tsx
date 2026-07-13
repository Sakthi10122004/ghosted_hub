"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { InviteUserDialog } from "./_components/invite-user-dialog";
import {
  Settings as SettingsIcon, Users, Bell, Link2, Shield,
  Save, Check, Pencil, Trash2, Loader2, Mail,
} from "lucide-react";

// ── Constants ──

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-rose-100 text-rose-700",
  event_manager: "bg-purple-100 text-purple-700",
  student: "bg-blue-100 text-blue-700",
  npo: "bg-emerald-100 text-emerald-700",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  event_manager: "Event Manager",
  student: "Student",
  npo: "NPO Partner",
};

// ── Page ──
export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 relative z-10">
      <div className="absolute top-[-5%] right-[-8%] w-[25%] h-[25%] bg-secondary rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-end justify-between bg-card p-6 rounded-3xl shadow-sm border border-border/50">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1">Configuration</p>
          <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1 font-medium">Platform preferences, user management, and integrations.</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted rounded-2xl p-1.5 h-auto flex-wrap">
          {[
            { value: "general", label: "General", icon: SettingsIcon },
            { value: "users", label: "Users & Roles", icon: Users },
            { value: "notifications", label: "Notifications", icon: Bell },
            { value: "integrations", label: "Integrations", icon: Link2 },
          ].map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 data-[state=active]:bg-card rounded-xl px-5 py-2.5">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        {/* Users & Roles Tab */}
        <TabsContent value="users">
          <UsersSettings />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <IntegrationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── General Settings ──
function GeneralSettings() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-none shadow-sm rounded-3xl">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-xl font-serif font-bold text-foreground">Platform Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Platform Name", value: "Ghosted Hub", placeholder: "Platform name" },
              { label: "Organization", value: "Tech4Good Community", placeholder: "Organization" },
              { label: "Default Timezone", value: "America/New_York", placeholder: "Timezone" },
              { label: "Support Email", value: "support@ghosted.org", placeholder: "Email" },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-sm font-bold text-foreground mb-2 block">{field.label}</label>
                <input
                  type="text"
                  defaultValue={field.value}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">Current Cohort</label>
            <select className="w-full md:w-1/2 px-4 py-3 rounded-2xl bg-muted border-none text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer">
              <option>Cohort 8 — Spring 2026</option>
              <option>Cohort 7 — Fall 2025</option>
            </select>
          </div>
          <div className="pt-4 border-t border-border/30 flex justify-end">
            <button className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 hover:scale-[1.02] transition-all">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Settings */}
      <SmtpSettings />

      {/* Role Permissions Overview */}
      <Card className="bg-card border-none shadow-sm rounded-3xl">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif font-bold text-foreground">Role Permissions</h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left px-5 py-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Permission</th>
                  {["Admin", "Event Manager", "Student", "NPO"].map((r) => (
                    <th key={r} className="text-center px-4 py-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { perm: "Manage Projects", admin: true, em: true, student: false, npo: false },
                  { perm: "Submit Reviews", admin: true, em: true, student: true, npo: false },
                  { perm: "Approve Reviews", admin: true, em: true, student: false, npo: false },
                  { perm: "Upload Files", admin: true, em: true, student: true, npo: true },
                  { perm: "Manage Users", admin: true, em: false, student: false, npo: false },
                  { perm: "View Deployments", admin: true, em: false, student: false, npo: false },
                  { perm: "Platform Settings", admin: true, em: false, student: false, npo: false },
                ].map((row) => (
                  <tr key={row.perm} className="border-b border-border/10 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{row.perm}</td>
                    {[row.admin, row.em, row.student, row.npo].map((v, i) => (
                      <td key={i} className="text-center px-4 py-3">
                        {v ? (
                          <span className="inline-flex w-6 h-6 rounded-lg bg-status-on-track/10 items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-status-on-track" />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 p-1.5 bg-muted rounded-2xl">
          {[{ label: "All", value: "all" }, ...Object.entries(ROLE_LABELS).map(([v, l]) => ({ label: l, value: v }))].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                roleFilter === tab.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <InviteUserDialog />
      </div>

      <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border/30">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">User</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-32">Role</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-20 text-center">Status</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-44">Email</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-20 text-right">Actions</span>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No users found.</div>
          ) : (
            filtered.map((user: any, idx: number) => {
              const role = user.roles?.[0]?.role || user.role || "student";
              const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : "U";
              const status = user.isActive ? "Active" : "Invited";
              
              return (
                <div key={user.id} className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors ${idx < filtered.length - 1 ? "border-b border-border/10" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${ROLE_COLORS[role] || ROLE_COLORS.student}`}>
                      {initials}
                    </div>
                    <span className="text-sm font-bold text-foreground">{user.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest w-32 text-center ${ROLE_COLORS[role] || ROLE_COLORS.student}`}>
                    {ROLE_LABELS[role] || role}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-20 text-center ${status === "Active" ? "bg-status-on-track/10 text-status-on-track" : "bg-status-attention/10 text-status-attention"}`}>
                    {status}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium w-44 truncate">{user.email}</span>
                  <div className="flex items-center justify-end gap-1 w-20">
                    <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })
          )}
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
    <Card className="bg-card border-none shadow-sm rounded-3xl">
      <CardContent className="p-8 space-y-6">
        <h2 className="text-xl font-serif font-bold text-foreground">Notification Preferences</h2>
        <div className="space-y-4">
          {[
            { key: "reviewAssigned" as const, label: "Review Assigned", desc: "When a new review is assigned to you" },
            { key: "reviewCompleted" as const, label: "Review Completed", desc: "When a review you submitted is approved or needs changes" },
            { key: "projectBlocked" as const, label: "Project Blocked", desc: "When a project in your portfolio is marked as blocked" },
            { key: "deadlineReminder" as const, label: "Deadline Reminders", desc: "24h and 72h reminders before deliverable deadlines" },
            { key: "mentionNotif" as const, label: "Mentions", desc: "When someone mentions you in a comment or note" },
            { key: "weeklyDigest" as const, label: "Weekly Digest", desc: "Weekly summary email of program activity" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-5 rounded-2xl border border-border/30 hover:border-primary/10 transition-colors">
              <div>
                <p className="text-sm font-bold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${prefs[item.key] ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${prefs[item.key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-border/30 flex justify-end">
          <button className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 hover:scale-[1.02] transition-all">
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Integration Settings ──
function IntegrationSettings() {
  const integrations = [
    { name: "Ghost CMS", desc: "Content management and publishing", status: "Connected", icon: "👻", color: "bg-purple-100 text-purple-700" },
    { name: "GitHub", desc: "Theme repository and version control", status: "Connected", icon: "🐙", color: "bg-gray-100 text-gray-700" },
    { name: "Google Workspace", desc: "Docs, Sheets, and Drive integration", status: "Not Connected", icon: "📧", color: "bg-blue-100 text-blue-700" },
    { name: "Slack", desc: "Team notifications and alerts", status: "Not Connected", icon: "💬", color: "bg-amber-100 text-amber-700" },
    { name: "Cloudflare", desc: "DNS management and CDN", status: "Connected", icon: "☁️", color: "bg-orange-100 text-orange-700" },
  ];

  return (
    <div className="space-y-4">
      {integrations.map((int) => (
        <Card key={int.name} className="bg-card border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${int.color} flex items-center justify-center text-xl`}>
                {int.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{int.name}</h3>
                <p className="text-xs text-muted-foreground font-medium">{int.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                int.status === "Connected" ? "bg-status-on-track/10 text-status-on-track" : "bg-muted text-muted-foreground"
              }`}>
                {int.status}
              </span>
              <button className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                int.status === "Connected"
                  ? "bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}>
                {int.status === "Connected" ? "Disconnect" : "Connect"}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
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
    <Card className="bg-card border-none shadow-sm rounded-3xl mb-6">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-serif font-bold text-foreground">Email Configuration (SMTP)</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6 font-medium">
          Configure Google App Password to enable sending invitation emails to new users.
        </p>
        
        {isLoading ? (
          <div className="py-4 text-sm text-muted-foreground">Loading settings...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="SMTP_USER" className="text-sm font-bold text-foreground mb-2 block">Google Email</label>
                <input
                  id="SMTP_USER"
                  type="email"
                  value={formData.SMTP_USER}
                  onChange={handleChange}
                  placeholder="admin@ghosted.org"
                  className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
              </div>
              <div>
                <label htmlFor="SMTP_PASSWORD" className="text-sm font-bold text-foreground mb-2 block">App Password</label>
                <input
                  id="SMTP_PASSWORD"
                  type="password"
                  value={formData.SMTP_PASSWORD}
                  onChange={handleChange}
                  placeholder="16-character App Password"
                  className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                  Do not use your personal password. Create an App Password in your Google Account settings.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-border/30 flex justify-end">
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100"
              >
                {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Configuration
              </button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
