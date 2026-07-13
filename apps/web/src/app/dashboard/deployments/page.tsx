"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, Plus, Eye, EyeOff, Copy, Check, Pencil,
  ExternalLink, Globe, Server, CheckCircle2, Clock,
  AlertCircle, XCircle,
} from "lucide-react";

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
    Failed: { bg: "bg-status-blocked/10", text: "text-status-blocked", dot: "bg-status-blocked", icon: XCircle },
  }[normStatus] || { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted", icon: Clock };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${config.bg} ${config.text}`}>
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
    <div className="flex items-center gap-1">
      <span className="text-xs font-mono text-foreground min-w-[80px]">
        {visible ? (value || "—") : "••••••••"}
      </span>
      {value && (
        <>
          <button onClick={() => setVisible(!visible)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
            {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <button onClick={handleCopy} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
            {copied ? <Check className="w-3 h-3 text-status-on-track" /> : <Copy className="w-3 h-3" />}
          </button>
        </>
      )}
    </div>
  );
}

export default function DeploymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: deploymentsData, isLoading } = useQuery({
    queryKey: ["deployments"],
    queryFn: () => fetchApi<{ data: Deployment[] }>("/deployments"),
  });

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
    <div className="space-y-8 max-w-full mx-auto pb-12 relative z-10">
      <div className="absolute top-[-5%] left-[-8%] w-[25%] h-[25%] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-end justify-between bg-card p-6 rounded-3xl shadow-sm border border-border/50">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1">Infrastructure</p>
          <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">Deployments</h1>
          <p className="text-muted-foreground mt-1 font-medium">Ghost instance deployment details, DNS mapping, and credentials.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search deployments..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10 pr-4 py-2.5 rounded-2xl border-none bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-56 transition-shadow" 
            />
          </div>
          <button className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 hover:scale-[1.02] transition-all">
            <Plus className="w-4 h-4" /> New Deployment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Total Deployments", value: isLoading ? "-" : deployments.length, icon: Server, color: "text-primary", bgColor: "bg-primary/5" },
          { label: "Mapped", value: isLoading ? "-" : mapped, icon: CheckCircle2, color: "text-status-on-track", bgColor: "bg-status-on-track/5" },
          { label: "Pending", value: isLoading ? "-" : pending, icon: Clock, color: "text-status-attention", bgColor: "bg-status-attention/5" },
          { label: "Failed", value: isLoading ? "-" : failed, icon: AlertCircle, color: "text-status-blocked", bgColor: "bg-status-blocked/5" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-none shadow-sm rounded-3xl overflow-hidden relative group hover:shadow-md transition-all">
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
                <div className={`w-9 h-9 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-4xl font-serif font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-1.5 p-1.5 bg-muted rounded-2xl w-fit">
        {[{ label: "All", value: "all" }, { label: "Mapped", value: "mapped" }, { label: "Pending", value: "pending" }, { label: "Failed", value: "failed" }].map((f) => (
          <button 
            key={f.value} 
            onClick={() => setStatusFilter(f.value)} 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === f.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Deployment Table */}
      <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  {["S/N", "Organisation", "Port", "CNAME", "Staging URL", "DNS", "Status", "Note", "Email", "App Password", "Admin Password"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                  ))}
                  <th className="text-right px-4 py-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground font-bold">
                      Loading deployments...
                    </td>
                  </tr>
                ) : filtered.map((d: any, idx: number) => (
                  <tr key={d.id} className={`hover:bg-muted/30 transition-colors ${idx < filtered.length - 1 ? "border-b border-border/10" : ""}`}>
                    <td className="px-4 py-4 font-mono text-xs font-bold text-primary">{d.serialNumber || "—"}</td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-foreground whitespace-nowrap">{d.orgName || "—"}</span>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">{d.portNumber || "—"}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground font-medium whitespace-nowrap">{d.cname || "—"}</td>
                    <td className="px-4 py-4">
                      {d.stagingUrl ? (
                        <a href={d.stagingUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium whitespace-nowrap">
                          <Globe className="w-3 h-3" /> Staging
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground font-medium whitespace-nowrap">{d.dns || "—"}</td>
                    <td className="px-4 py-4"><StatusBadge status={d.mappedStatus} /></td>
                    <td className="px-4 py-4 text-xs text-muted-foreground font-medium max-w-[150px] truncate">{d.note || "—"}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground font-medium whitespace-nowrap">{d.email || "—"}</td>
                    <td className="px-4 py-4"><MaskedField value={d.appPassword} /></td>
                    <td className="px-4 py-4"><MaskedField value={d.siteAdminPassword} /></td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && filtered.length === 0 && (
            <div className="p-16 text-center">
              <Server className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-bold">No deployments match your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
