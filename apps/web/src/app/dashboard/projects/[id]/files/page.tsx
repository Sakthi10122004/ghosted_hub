"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileIcon, Loader2, Download, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useConfirm } from "@/hooks/use-confirm";
import { Badge } from "@/components/ui/badge";

function handleFileDownload(url: string, filename: string) {
  if (url.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    window.open(url, '_blank');
  }
}

export default function ProjectFilesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "link">("file");

  const { data, isLoading } = useQuery({
    queryKey: ["files", projectId],
    queryFn: () => fetchApi<{ data: any[] }>(`/projects/${projectId}/files`),
  });

  const files = Array.isArray(data?.data) ? data.data : [];
  const [ConfirmDialog, confirm] = useConfirm();

  const uploadMutation = useMutation({
    mutationFn: (fileData: { name: string; fileUrl: string; category: string; fileSize?: number }) =>
      fetchApi(`/projects/${projectId}/files`, {
        method: "POST",
        body: JSON.stringify(fileData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", projectId] });
      setIsUploadOpen(false);
      setFileName("");
      setFileUrl("");
      setSelectedFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/files/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", projectId] });
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === "file" && !selectedFile) return;
    if (uploadMode === "link" && (!fileName.trim() || !fileUrl.trim())) return;
    
    const finalName = uploadMode === "file" && selectedFile ? (fileName.trim() || selectedFile.name) : fileName.trim();
    
    if (uploadMode === "link") {
      let url = fileUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      uploadMutation.mutate({ name: finalName, fileUrl: url, category: "RESOURCE" });
      return;
    }

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        let category = "DOCUMENT";
        if (selectedFile.type.startsWith("image/")) category = "IMAGE";
        
        uploadMutation.mutate({ 
          name: finalName, 
          fileUrl: base64Url, 
          category,
          // optionally add size:
          fileSize: selectedFile.size
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <ConfirmDialog />
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
              <div className="flex gap-2 p-1 bg-muted rounded-md w-full">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`flex-1 text-xs py-1.5 rounded-sm transition-colors ${uploadMode === "file" ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("link")}
                  className={`flex-1 text-xs py-1.5 rounded-sm transition-colors ${uploadMode === "link" ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  External Link
                </button>
              </div>

              {uploadMode === "file" ? (
                <div key="file-upload" className="space-y-2">
                  <Label htmlFor="fileUpload">Select File</Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    accept=".zip,.doc,.docx,.pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        if (!fileName) setFileName(file.name);
                      } else {
                        setSelectedFile(null);
                      }
                    }}
                    className="cursor-pointer file:text-primary file:font-semibold file:border-0 file:bg-primary/10 hover:file:bg-primary/20 file:mr-4 file:px-4 file:py-1 file:rounded-md"
                  />
                  <p className="text-[11px] text-muted-foreground">Supported: Images, PDF, Word, ZIP</p>
                </div>
              ) : (
                <div key="link-upload" className="space-y-2">
                  <Label htmlFor="fileUrl">External URL / GitHub Link</Label>
                  <Input
                    id="fileUrl"
                    type="url"
                    placeholder="https://github.com/..."
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fileName">Display Name</Label>
                <Input
                  id="fileName"
                  placeholder="e.g. Design Mockups v1"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={(uploadMode === "file" && !selectedFile) || (uploadMode === "link" && (!fileName.trim() || !fileUrl.trim())) || uploadMutation.isPending}>
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
                    <Button size="icon" variant="secondary" onClick={() => window.open(file.fileUrl, '_blank')} title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" onClick={() => handleFileDownload(file.fileUrl, file.name)} title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        const ok = await confirm("Delete File", "Are you sure you want to delete this file? This action cannot be undone.");
                        if (ok) deleteMutation.mutate(file.id); 
                      }}
                      title="Delete File"
                    >
                      <Trash2 className="h-4 w-4" />
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
