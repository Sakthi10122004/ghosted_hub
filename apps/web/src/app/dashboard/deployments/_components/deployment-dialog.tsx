"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export function DeploymentDialog({ deployment, trigger }: { deployment?: any, trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEditing = !!deployment;

  const [formData, setFormData] = useState({
    serialNumber: "",
    orgName: "",
    portNumber: "",
    cname: "",
    stagingUrl: "",
    dns: "",
    mappedStatus: "Pending",
    note: "",
    email: "",
    appPassword: "",
    siteAdminPassword: "",
    projectId: "",
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchApi<{ data: any[] }>("/projects"),
    enabled: open,
  });

  useEffect(() => {
    if (deployment && open) {
      setFormData({
        serialNumber: deployment.serialNumber || "",
        orgName: deployment.orgName || "",
        portNumber: deployment.portNumber || "",
        cname: deployment.cname || "",
        stagingUrl: deployment.stagingUrl || "",
        dns: deployment.dns || "",
        mappedStatus: deployment.mappedStatus || "Pending",
        note: deployment.note || "",
        email: deployment.email || "",
        appPassword: deployment.appPassword || "",
        siteAdminPassword: deployment.siteAdminPassword || "",
        projectId: deployment.projectId || "",
      });
    } else if (!deployment && open) {
      setFormData({
        serialNumber: "", orgName: "", portNumber: "", cname: "",
        stagingUrl: "", dns: "", mappedStatus: "Pending", note: "",
        email: "", appPassword: "", siteAdminPassword: "", projectId: ""
      });
    }
  }, [deployment, open]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEditing) {
        return fetchApi(`/deployments/${deployment.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      }
      return fetchApi("/deployments", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-fill orgName if project selected and orgName is empty
    let submitData = { ...formData };
    if (submitData.projectId && !submitData.orgName) {
      const proj = projectsData?.data?.find(p => p.id === submitData.projectId);
      if (proj && proj.nonprofit) submitData.orgName = proj.nonprofit.name;
    }
    
    mutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" /> New Deployment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl font-mono uppercase tracking-widest rounded-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-[0.2em]">{isEditing ? "Edit Deployment" : "New Deployment"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px]">Project</Label>
              <Select value={formData.projectId} onValueChange={(val) => setFormData({ ...formData, projectId: val })}>
                <SelectTrigger className="h-9 text-xs rounded-none border-border">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent className="rounded-none font-mono uppercase">
                  {projectsData?.data?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px]">Organisation Name</Label>
              <Input
                className="h-9 text-xs rounded-none border-border"
                value={formData.orgName}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                placeholder="Auto-filled if empty"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px]">Serial Number</Label>
              <Input
                required
                className="h-9 text-xs rounded-none border-border"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="e.g. GH-001"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px]">Port Number</Label>
              <Input
                required
                className="h-9 text-xs rounded-none border-border"
                value={formData.portNumber}
                onChange={(e) => setFormData({ ...formData, portNumber: e.target.value })}
                placeholder="e.g. 2368"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px]">CNAME</Label>
              <Input
                required
                className="h-9 text-xs rounded-none border-border"
                value={formData.cname}
                onChange={(e) => setFormData({ ...formData, cname: e.target.value })}
                placeholder="e.g. client.ghosted.org"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px]">Staging URL</Label>
              <Input
                className="h-9 text-xs rounded-none border-border"
                value={formData.stagingUrl}
                onChange={(e) => setFormData({ ...formData, stagingUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px]">DNS Status</Label>
              <Input
                className="h-9 text-xs rounded-none border-border"
                value={formData.dns}
                onChange={(e) => setFormData({ ...formData, dns: e.target.value })}
                placeholder="e.g. CNAME pending"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px]">Mapping Status</Label>
              <Select value={formData.mappedStatus} onValueChange={(val) => setFormData({ ...formData, mappedStatus: val })}>
                <SelectTrigger className="h-9 text-xs rounded-none border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-none font-mono uppercase tracking-widest">
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Mapped">Mapped</SelectItem>
                  <SelectItem value="Failed">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px]">Ghost Email</Label>
              <Input
                required
                type="email"
                className="h-9 text-xs rounded-none border-border"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px]">App Password</Label>
              <Input
                required
                className="h-9 text-xs rounded-none border-border"
                value={formData.appPassword}
                onChange={(e) => setFormData({ ...formData, appPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px]">Site Admin Password</Label>
              <Input
                required
                className="h-9 text-xs rounded-none border-border"
                value={formData.siteAdminPassword}
                onChange={(e) => setFormData({ ...formData, siteAdminPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px]">Notes</Label>
              <Textarea
                className="text-xs rounded-none border-border"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={mutation.isPending} className="rounded-none">
              {mutation.isPending ? "Saving..." : "Save Deployment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
