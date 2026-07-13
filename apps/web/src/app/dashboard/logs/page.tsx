"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, ShieldAlert, Activity, User, Monitor,
  Clock, ServerCrash, KeyRound
} from "lucide-react";

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || "student";
  const isAdmin = userRole === "admin" || userRole === "SUPER_ADMIN";

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs"],
    queryFn: () => fetchApi<{ data: any[] }>("/audit"),
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4 opacity-50" />
        <h1 className="text-2xl font-serif font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view system logs.</p>
      </div>
    );
  }

  const logs = logsData?.data || [];

  const filteredLogs = logs.filter((log: any) => {
    const actionStr = (log.action || "").toLowerCase();
    const entityStr = (log.entityType || "").toLowerCase();
    const userStr = (log.user?.name || "").toLowerCase();
    
    const matchesSearch = searchQuery === "" || 
      actionStr.includes(searchQuery.toLowerCase()) || 
      entityStr.includes(searchQuery.toLowerCase()) ||
      userStr.includes(searchQuery.toLowerCase());
      
    const isSystemLog = !log.userId || actionStr.startsWith("system.");
    
    const matchesFilter = filterType === "all" || 
      (filterType === "system" && isSystemLog) ||
      (filterType === "user" && !isSystemLog);
      
    return matchesSearch && matchesFilter;
  });

  const getActionIcon = (action: string) => {
    if (!action) return Activity;
    if (action.includes("login") || action.includes("auth")) return KeyRound;
    if (action.includes("error") || action.includes("fail")) return ServerCrash;
    if (action.startsWith("system.")) return Monitor;
    return User;
  };

  const getActionColor = (action: string) => {
    if (!action) return "text-primary bg-primary/10";
    if (action.includes("error") || action.includes("fail") || action.includes("delete")) return "text-destructive bg-destructive/10";
    if (action.includes("create") || action.includes("success")) return "text-status-on-track bg-status-on-track/10";
    if (action.includes("login") || action.includes("auth")) return "text-purple-600 bg-purple-100";
    return "text-blue-600 bg-blue-100";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 relative z-10">
      <div className="absolute top-[-5%] left-[-8%] w-[25%] h-[25%] bg-destructive/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-end justify-between bg-card p-6 rounded-3xl shadow-sm border border-border/50">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1">Administration</p>
          <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">System Logs</h1>
          <p className="text-muted-foreground mt-1 font-medium">Audit trail of platform activity, authentication, and system events.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl border-none bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-1.5 p-1.5 bg-muted rounded-2xl w-fit">
        {[
          { label: "All Logs", value: "all" },
          { label: "User Activity", value: "user" },
          { label: "System Events", value: "system" }
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filterType === f.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border/30">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-10 text-center">Type</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Action</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-40">User</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-32">IP Address</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-32 text-right">Timestamp</span>
          </div>
          
          {isLoading ? (
            <div className="p-16 text-center text-muted-foreground font-bold">
              Loading logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-16 text-center">
              <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-bold">No logs match your current filter.</p>
            </div>
          ) : (
            filteredLogs.map((log: any, idx: number) => {
              const Icon = getActionIcon(log.action);
              const colorClass = getActionColor(log.action);
              
              return (
                <div
                  key={log.id}
                  className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors ${
                    idx < filteredLogs.length - 1 ? "border-b border-border/10" : ""
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{log.action || "Unknown Action"}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {log.entityType ? `${log.entityType} • ` : ""}
                      {log.entityId || "System"}
                    </p>
                  </div>
                  <div className="w-40 flex items-center gap-2">
                    {log.user ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground">
                          {log.user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium truncate">{log.user.name}</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic font-medium">System</span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-32">{log.ipAddress || "—"}</span>
                  <div className="w-32 text-right flex items-center justify-end gap-1.5 text-xs text-muted-foreground font-medium">
                    <Clock className="w-3 h-3" />
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
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
