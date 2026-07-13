"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileIcon, Loader2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function ProjectFilesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["files", projectId],
    queryFn: () => fetchApi<{ data: any[] }>(`/projects/${projectId}/files`),
  });

  const files = Array.isArray(data?.data) ? data.data : [];

  const uploadMutation = useMutation({
    mutationFn: (fileData: { name: string; fileUrl: string; category: string }) =>
      fetchApi(`/projects/${projectId}/files`, {
        method: "POST",
        body: JSON.stringify(fileData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", projectId] });
      setIsUploadOpen(false);
      setFileName("");
      setFileUrl("");
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !fileUrl.trim()) return;
    uploadMutation.mutate({ name: fileName, fileUrl, category: "DOCUMENT" });
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Files</h2>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button><UploadCloud className="mr-2 h-4 w-4" /> Upload File</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  placeholder="e.g. Design Mockups v1"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileUrl">File URL (Mock Upload)</Label>
                <Input
                  id="fileUrl"
                  placeholder="https://example.com/mockup.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Until S3 is configured, please provide a direct URL to the file.</p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!fileName.trim() || !fileUrl.trim() || uploadMutation.isPending}>
                  {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 border-dashed border-2 m-6 rounded-lg text-muted-foreground bg-muted/20">
            <UploadCloud className="h-10 w-10 mb-4 opacity-50" />
            <p>No files have been uploaded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardContent className="p-0">
                <div className="h-32 bg-muted flex items-center justify-center relative group">
                  <FileIcon className="h-12 w-12 text-muted-foreground/50" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" onClick={() => window.open(file.fileUrl, '_blank')}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm line-clamp-1" title={file.name}>{file.name}</h3>
                    <Badge variant="outline" className="text-[10px] uppercase ml-2 flex-shrink-0">{file.category}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                    <span>{file.uploadedBy?.name || 'Unknown'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
