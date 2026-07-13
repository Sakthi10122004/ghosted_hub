"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function UploadFileDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [category, setCategory] = useState("DOCUMENT");
  
  const queryClient = useQueryClient();

  // Assuming you are uploading for the user's primary project for now
  // A robust implementation would allow project selection.
  const [projectId, setProjectId] = useState("clxr60w7z000008jt42pab8p4"); // Dummy default

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return fetchApi(`/files`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setOpen(false);
      setName("");
      setFileUrl("");
      setCategory("DOCUMENT");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fileUrl) return;
    mutation.mutate({ name, fileUrl, category, projectId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-none font-mono uppercase tracking-widest text-[10px]">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-none border-border">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-widest text-lg">Upload Asset</DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest">
            Add a file link to the project repository.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-mono font-bold uppercase tracking-widest">File Name</Label>
            <Input
              id="name"
              placeholder="e.g. branding-assets.zip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono text-sm rounded-none border-border"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url" className="text-[10px] font-mono font-bold uppercase tracking-widest">External URL / Drive Link</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://google.com/drive/..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="font-mono text-sm rounded-none border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-[10px] font-mono font-bold uppercase tracking-widest">File Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="font-mono text-xs rounded-none border-border">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-none font-mono text-xs">
                <SelectItem value="DOCUMENT">Document</SelectItem>
                <SelectItem value="IMAGE">Image</SelectItem>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="BRANDING">Branding</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Note: A real implementation would fetch active projects and allow dropdown selection */}
          <div className="space-y-2">
            <Label htmlFor="project" className="text-[10px] font-mono font-bold uppercase tracking-widest">Project ID</Label>
            <Input
              id="project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="font-mono text-sm rounded-none border-border text-muted-foreground"
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending} className="rounded-none font-mono uppercase tracking-widest text-[10px]">
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Save Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
