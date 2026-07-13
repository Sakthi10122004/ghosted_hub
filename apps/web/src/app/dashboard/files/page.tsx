"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Upload,
  Grid3X3,
  List,
  FileImage,
  FileText,
  FileArchive,
  FileCode,
  Film,
  Download,
  Eye,
  Trash2,
  HardDrive,
  Clock,
  Share2,
  FolderOpen,
} from "lucide-react";
import { UploadFileDialog } from "./_components/upload-file-dialog";

// ── Types & Constants ────────────────────────────────────────────────────────

const FILE_TYPES: { label: string; value: string }[] = [
  { label: "All Types", value: "all" },
  { label: "Images", value: "image" },
  { label: "Documents", value: "document" },
  { label: "Archives", value: "archive" },
  { label: "Code", value: "code" },
  { label: "Video", value: "video" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function getFileIcon(type: string) {
  switch (type) {
    case "image": return FileImage;
    case "document": return FileText;
    case "archive": return FileArchive;
    case "code": return FileCode;
    case "video": return Film;
    default: return FileText;
  }
}

function getFileColor(type: string) {
  switch (type) {
    case "image": return { bg: "bg-pink-100", text: "text-pink-600" };
    case "document": return { bg: "bg-blue-100", text: "text-blue-600" };
    case "archive": return { bg: "bg-amber-100", text: "text-amber-600" };
    case "code": return { bg: "bg-emerald-100", text: "text-emerald-600" };
    case "video": return { bg: "bg-purple-100", text: "text-purple-600" };
    default: return { bg: "bg-muted", text: "text-muted-foreground" };
  }
}

// ── Page Component ─────────────────────────────────────────────────────────
export default function FilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || "student";

  const { data: filesData, isLoading } = useQuery({
    queryKey: ["files"],
    queryFn: () => fetchApi<{ data: any[] }>("/files"),
  });

  const files = filesData?.data || [];

  const filteredFiles = files.filter((f: any) => {
    const matchesSearch = searchQuery === "" ||
      (f.name && f.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.project?.name && f.project.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Simple category matching based on mimeType or file extension if available
    const fileCategory = f.category || "document"; 
    const matchesType = typeFilter === "all" || fileCategory === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const totalSize = files.reduce((acc: number, f: any) => acc + (f.fileSize || 0), 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(1);
  const recentUploads = files.filter((f: any) => {
    if (!f.createdAt) return false;
    const date = new Date(f.createdAt);
    const now = new Date();
    return (now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000;
  }).length;
  const sharedFiles = files.filter((f: any) => f.shared).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold uppercase tracking-widest text-foreground">Files</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Index // Shared Assets</p>
        </div>
        <UploadFileDialog />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Files", value: isLoading ? "-" : files.length.toString(), icon: FolderOpen, color: "text-primary", bgColor: "bg-primary/10" },
          { label: "Storage Used", value: isLoading ? "-" : `${totalSizeMB} MB`, icon: HardDrive, color: "text-blue-600", bgColor: "bg-blue-100" },
          { label: "Recent Uploads", value: isLoading ? "-" : recentUploads.toString(), icon: Clock, color: "text-status-attention", bgColor: "bg-status-attention/10" },
          { label: "Shared Files", value: isLoading ? "-" : sharedFiles.toString(), icon: Share2, color: "text-status-on-track", bgColor: "bg-status-on-track/10" },
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

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {FILE_TYPES.map((ft) => (
            <button
              key={ft.value}
              onClick={() => setTypeFilter(ft.value)}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border border-transparent transition-colors ${
                typeFilter === ft.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {ft.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="SEARCH FILES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-64 font-mono text-[11px] uppercase tracking-widest"
            />
          </div>
          <div className="flex items-center space-x-1 bg-muted p-1 rounded-md">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* File Display */}
      {isLoading ? (
        <div className="p-16 text-center text-muted-foreground text-sm">
          Loading files...
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <FolderOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No files found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file: any) => {
            const fileCategory = file.category || "document";
            const FileIcon = getFileIcon(fileCategory);
            const fileColor = getFileColor(fileCategory);
            const sizeString = file.fileSize ? `${(file.fileSize / 1024).toFixed(0)} KB` : "0 KB";
            
            return (
              <Card key={file.id} className="group overflow-hidden">
                {/* Preview Area */}
                <div className="h-32 bg-muted/30 flex items-center justify-center relative border-b border-border/60 group-hover:bg-muted/50 transition-colors">
                  <div className={`w-12 h-12 rounded-lg ${fileColor.bg} flex items-center justify-center`}>
                    <FileIcon className={`w-6 h-6 ${fileColor.text}`} />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {/* File Info */}
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-foreground truncate mb-1 group-hover:text-primary transition-colors">{file.name || "Untitled File"}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{sizeString}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "Just now"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 border-b border-border bg-muted">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">File</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground w-40">Project</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground w-20 text-right">Size</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground w-24 text-right">Uploaded</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground w-24 text-right">Actions</span>
            </div>
            <div className="divide-y divide-border">
              {filteredFiles.map((file: any) => {
                const fileCategory = file.category || "document";
                const FileIcon = getFileIcon(fileCategory);
                const fileColor = getFileColor(fileCategory);
                const sizeString = file.fileSize ? `${(file.fileSize / 1024).toFixed(0)} KB` : "0 KB";
                
                return (
                  <div
                    key={file.id}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-md ${fileColor.bg} flex items-center justify-center shrink-0`}>
                        <FileIcon className={`w-4 h-4 ${fileColor.text}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{file.name || "Untitled File"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-40 truncate">
                      {file.project?.name || "General"}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium w-20 text-right">{sizeString}</span>
                    <span className="text-xs text-muted-foreground w-24 text-right">
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "Just now"}
                    </span>
                    <div className="flex items-center justify-end gap-1 w-24 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Download className="w-4 h-4" />
                      </Button>
                      {canUpload && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
