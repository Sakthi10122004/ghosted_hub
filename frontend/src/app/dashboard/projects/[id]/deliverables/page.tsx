"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, UploadCloud, Loader2, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function ProjectDeliverablesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  
  const [name, setName] = useState("");
  const [type, setType] = useState("THEME_ZIP");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["deliverables", projectId],
    queryFn: () => fetchApi<{ data: any[] }>(`/projects/${projectId}/deliverables`),
  });

  const deliverables = Array.isArray(data?.data) ? data.data : [];

  const createDeliverable = useMutation({
    mutationFn: (deliverableData: any) =>
      fetchApi<{ data: { id: string } }>(`/projects/${projectId}/deliverables`, {
        method: "POST",
        body: JSON.stringify(deliverableData),
      }),
  });

  const addVersion = useMutation({
    mutationFn: ({ id, fileData }: { id: string, fileData: any }) =>
      fetchApi(`/deliverables/${id}/versions`, {
        method: "POST",
        body: JSON.stringify(fileData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliverables", projectId] });
      setIsSubmitOpen(false);
      setName("");
      setDescription("");
      setFileUrl("");
      setType("THEME_ZIP");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fileUrl.trim()) return;
    
    try {
      const delivRes = await createDeliverable.mutateAsync({ name, description, type });
      if (delivRes?.data?.id) {
        await addVersion.mutateAsync({ id: delivRes.data.id, fileData: { fileUrl } });
      }
    } catch (err) {
      console.error("Failed to submit deliverable", err);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Final Deliverables</h2>
        <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
          <DialogTrigger asChild>
            <Button><UploadCloud className="mr-2 h-4 w-4" /> Submit Deliverable</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Final Deliverable</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="type">Deliverable Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THEME_ZIP">Ghost Theme (ZIP)</SelectItem>
                    <SelectItem value="CONTENT_EXPORT">Content Export (JSON)</SelectItem>
                    <SelectItem value="ROUTES_YAML">Routes (YAML)</SelectItem>
                    <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Final Production Theme"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileUrl">File URL / Download Link</Label>
                <Input
                  id="fileUrl"
                  placeholder="https://example.com/theme.zip"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Notes (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Any installation instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={!name.trim() || !fileUrl.trim() || createDeliverable.isPending || addVersion.isPending}>
                  {(createDeliverable.isPending || addVersion.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Deliverable
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {deliverables.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48 border-dashed border-2 m-6 rounded-lg text-muted-foreground bg-muted/20">
              <Package className="h-10 w-10 mb-4 opacity-50" />
              <p>No deliverables have been submitted yet.</p>
            </CardContent>
          </Card>
        ) : (
          deliverables.map((deliverable) => (
            <Card key={deliverable.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {deliverable.status === "APPROVED" ? (
                        <CheckCircle2 className="h-6 w-6 text-status-on-track" />
                      ) : (
                        <Package className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-3">
                        {deliverable.name}
                        <Badge variant="outline" className="uppercase text-[10px] bg-muted/50">{deliverable.type.replace('_', ' ')}</Badge>
                      </h3>
                      {deliverable.description && (
                        <p className="text-sm text-muted-foreground mt-1">{deliverable.description}</p>
                      )}
                      
                      <div className="mt-4 space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Versions</h4>
                        {deliverable.versions?.map((v: any) => (
                          <div key={v.id} className="flex justify-between items-center bg-muted/30 p-2 rounded-md text-sm border border-border/50">
                            <span className="font-mono">v{v.version}</span>
                            <span className="text-xs text-muted-foreground">{new Date(v.uploadedAt).toLocaleString()}</span>
                            <div className="flex items-center gap-2">
                              <Badge className={v.status === 'APPROVED' ? 'bg-status-on-track text-white' : 'bg-secondary text-secondary-foreground'}>
                                {v.status}
                              </Badge>
                              <Button variant="ghost" size="sm" onClick={() => window.open(v.fileUrl, '_blank')}>
                                View File
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
