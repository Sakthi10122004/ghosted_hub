"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useUserRole } from "@/hooks/use-user-role";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search, ShieldAlert, Activity, User, Monitor,
  Clock, ServerCrash, KeyRound
} from "lucide-react";

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { isPending, isSuperAdmin } = useUserRole();

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs"],
    queryFn: () => fetchApi<{ data: any[] }>("/audit"),
    enabled: isSuperAdmin,
  });

  if (isPending) return null;

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <ShieldAlert className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-lg font-semibold text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground mt-1">You do not have permission to view system logs.</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold uppercase tracking-widest text-foreground">System Logs</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Audit trail of platform activity, authentication, and system events.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {[
            { label: "All Logs", value: "all" },
            { label: "User Activity", value: "user" },
            { label: "System Events", value: "system" }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border border-transparent transition-colors ${
                filterType === f.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="SEARCH LOGS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 w-64 font-mono text-[11px] uppercase tracking-widest"
          />
        </div>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-center px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground w-12 border-r border-border/50">Type</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground border-r border-border/50">Action</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground w-48 border-r border-border/50">User</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground w-32 border-r border-border/50">IP Address</th>
                  <th className="text-right px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground w-40">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm font-medium text-foreground">No logs found</p>
                      <p className="text-xs text-muted-foreground mt-1">No logs match your current filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log: any) => {
                    const Icon = getActionIcon(log.action);
                    const colorClass = getActionColor(log.action);
                    
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center mx-auto ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-border/50">
                          <p className="text-xs font-mono font-bold uppercase tracking-widest text-foreground">{log.action || "Unknown Action"}</p>
                          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                            {log.entityType ? `${log.entityType} • ` : ""}
                            {log.entityId || "System"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {log.user ? (
                              <>
                                <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground">
                                  {log.user.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground truncate">{log.user.name}</span>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">System</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-muted-foreground">{log.ipAddress || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
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
