"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useUserRole } from "@/hooks/use-user-role";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Eye, EyeOff, Copy, Check, Pencil,
  ExternalLink, Globe, Server, CheckCircle2, Clock,
  AlertCircle, XCircle, ShieldAlert
} from "lucide-react";
import { DeploymentDialog } from "./_components/deployment-dialog";

// ── Types ──
interface Deployment {
  id: string;
  serialNumber: string;
  orgName: string;
  portNumber: string;
  cname: string;
  stagingUrl: string;
  dns: string;
  mappedStatus: "Mapped" | "Pending" | "Failed";
  note: string;
  email: string;
  appPassword: string;
  siteAdminPassword: string;
}

function StatusBadge({ status }: { status: string }) {
  const normStatus = (status || "Pending") as "Mapped" | "Pending" | "Failed";
  const config = {
    Mapped: { bg: "bg-status-on-track/10", text: "text-status-on-track", dot: "bg-status-on-track", icon: CheckCircle2 },
    Pending: { bg: "bg-status-attention/10", text: "text-status-attention", dot: "bg-status-attention", icon: Clock },
    Failed: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", icon: XCircle },
  }[normStatus] || { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted", icon: Clock };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${config.bg} ${config.text}`}>
      <config.icon className="w-3 h-3" /> {normStatus}
    </span>
  );
}

function MaskedField({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-1 group">
      <span className="text-xs font-mono text-muted-foreground min-w-[80px]">
        {visible ? (value || "—") : "••••••••"}
      </span>
      {value && (
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setVisible(!visible)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
            {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <button onClick={handleCopy} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
            {copied ? <Check className="w-3 h-3 text-status-on-track" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  );
}

export default function DeploymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { isPending, isSuperAdmin } = useUserRole();

  const { data: deploymentsData, isLoading: depsLoading } = useQuery({
    queryKey: ["deployments"],
    queryFn: () => fetchApi<{ data: Deployment[] }>("/deployments"),
    enabled: isSuperAdmin,
  });

  const isLoading = isPending || depsLoading;

  if (isPending) return null;

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <ShieldAlert className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-lg font-semibold text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground mt-1">You do not have permission to view deployments.</p>
      </div>
    );
  }

  const deployments = deploymentsData?.data || [];

  const filtered = deployments.filter((d: any) => {
    const matchesSearch = searchQuery === "" ||
      (d.orgName && d.orgName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.serialNumber && d.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const mappedStatus = d.mappedStatus || "Pending";
    const matchesStatus = statusFilter === "all" || mappedStatus.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const mapped = deployments.filter((d: any) => d.mappedStatus === "Mapped").length;
  const pending = deployments.filter((d: any) => !d.mappedStatus || d.mappedStatus === "Pending").length;
  const failed = deployments.filter((d: any) => d.mappedStatus === "Failed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold uppercase tracking-widest text-foreground">Deployments</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Ghost instance deployment details, DNS mapping, and credentials.</p>
        </div>
        <DeploymentDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Deployments", value: isLoading ? "-" : deployments.length, icon: Server, color: "text-primary", bgColor: "bg-primary/10" },
          { label: "Mapped", value: isLoading ? "-" : mapped, icon: CheckCircle2, color: "text-status-on-track", bgColor: "bg-status-on-track/10" },
          { label: "Pending", value: isLoading ? "-" : pending, icon: Clock, color: "text-status-attention", bgColor: "bg-status-attention/10" },
          { label: "Failed", value: isLoading ? "-" : failed, icon: AlertCircle, color: "text-destructive", bgColor: "bg-destructive/10" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground uppercase">{stat.label}</p>
                <p className="text-2xl font-mono font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 border border-border flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {[{ label: "All", value: "all" }, { label: "Mapped", value: "mapped" }, { label: "Pending", value: "pending" }, { label: "Failed", value: "failed" }].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border border-transparent transition-colors ${statusFilter === f.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:border-border"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="SEARCH DEPLOYMENTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 w-64 font-mono text-[11px] uppercase tracking-widest"
          />
        </div>
      </div>

      {/* Deployment Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  {["S/N", "Organisation", "Port", "CNAME", "URL", "DNS", "Status", "Note", "Email", "App Pwd", "Admin Pwd"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap border-r border-border/50">{h}</th>
                  ))}
                  <th className="text-right px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading deployments...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No deployments match your search.
                    </td>
                  </tr>
                ) : filtered.map((d: any) => (
                  <tr key={d.id} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{d.serialNumber || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-foreground whitespace-nowrap group-hover:text-primary transition-colors">{d.orgName || "—"}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{d.portNumber || "—"}</td>
                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{d.cname || "—"}</td>
                    <td className="px-4 py-2.5">
                      {d.stagingUrl ? (
                        <a href={d.stagingUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline whitespace-nowrap">
                          <Globe className="w-3 h-3" /> Redirect
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{d.dns || "—"}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={d.mappedStatus} /></td>
                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground max-w-[150px] truncate" title={d.note}>{d.note || "—"}</td>
                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{d.email || "—"}</td>
                    <td className="px-4 py-2.5"><MaskedField value={d.appPassword} /></td>
                    <td className="px-4 py-2.5"><MaskedField value={d.siteAdminPassword} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <DeploymentDialog 
                        deployment={d} 
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        } 
                      />
                    </td>
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
