"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
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
    case "image": return { bg: "bg-pink-100", text: "text-pink-600", gradient: "from-pink-500/20 to-pink-500/5" };
    case "document": return { bg: "bg-blue-100", text: "text-blue-600", gradient: "from-blue-500/20 to-blue-500/5" };
    case "archive": return { bg: "bg-amber-100", text: "text-amber-600", gradient: "from-amber-500/20 to-amber-500/5" };
    case "code": return { bg: "bg-emerald-100", text: "text-emerald-600", gradient: "from-emerald-500/20 to-emerald-500/5" };
    case "video": return { bg: "bg-purple-100", text: "text-purple-600", gradient: "from-purple-500/20 to-purple-500/5" };
    default: return { bg: "bg-gray-100", text: "text-gray-600", gradient: "from-gray-500/20 to-gray-500/5" };
  }
}

// ── Page Component ─────────────────────────────────────────────────────────
export default function FilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || "student";
  const canUpload = userRole !== "admin" && userRole !== "SUPER_ADMIN";

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
    <div className="space-y-8 max-w-7xl mx-auto pb-12 relative z-10">
      {/* Decorative blobs */}
      <div className="absolute top-[-5%] left-[-8%] w-[25%] h-[25%] bg-secondary rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[50%] right-[-5%] w-[20%] h-[20%] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-end justify-between bg-card p-6 rounded-3xl shadow-sm border border-border/50">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1">Team Files</p>
          <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">Files</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage project assets, deliverables, and shared resources for your team.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl border-none bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-56 transition-shadow"
            />
          </div>
          {canUpload && (
            <button className="flex items-center space-x-2 bg-foreground hover:bg-foreground/90 text-background px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 transition-all hover:scale-[1.02]">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Total Files", value: isLoading ? "-" : files.length.toString(), icon: FolderOpen, color: "text-primary", bgColor: "bg-primary/5" },
          { label: "Storage Used", value: isLoading ? "-" : `${totalSizeMB} MB`, icon: HardDrive, color: "text-blue-600", bgColor: "bg-blue-50" },
          { label: "Recent Uploads", value: isLoading ? "-" : recentUploads.toString(), icon: Clock, color: "text-status-attention", bgColor: "bg-status-attention/5" },
          { label: "Shared Files", value: isLoading ? "-" : sharedFiles.toString(), icon: Share2, color: "text-status-on-track", bgColor: "bg-status-on-track/5" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-none shadow-sm rounded-3xl overflow-hidden relative group hover:shadow-md transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 p-1.5 bg-muted rounded-2xl">
          {FILE_TYPES.map((ft) => (
            <button
              key={ft.value}
              onClick={() => setTypeFilter(ft.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                typeFilter === ft.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {ft.label}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-1 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File Display */}
      {isLoading ? (
        <div className="bg-card rounded-3xl p-16 shadow-sm border border-border/50 text-center text-muted-foreground font-bold">
          Loading files...
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-card rounded-3xl p-16 shadow-sm border border-border/50 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-serif font-bold text-foreground mb-2">No files found</h3>
          <p className="text-muted-foreground font-medium">Try adjusting your search or filters. {canUpload ? "Upload a file to get started." : ""}</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredFiles.map((file: any) => {
            const fileCategory = file.category || "document";
            const FileIcon = getFileIcon(fileCategory);
            const fileColor = getFileColor(fileCategory);
            const sizeString = file.fileSize ? `${(file.fileSize / 1024).toFixed(0)} KB` : "0 KB";
            
            return (
              <div
                key={file.id}
                className="bg-card rounded-3xl shadow-sm border border-border/30 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group"
              >
                {/* Preview Area */}
                <div className={`h-36 bg-gradient-to-br ${fileColor.gradient} flex items-center justify-center relative overflow-hidden`}>
                  <FileIcon className={`w-12 h-12 ${fileColor.text} opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-300`} />
                  {/* Version chip */}
                  <span className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-lg text-foreground shadow-sm">
                    v{file.version || 1}
                  </span>
                  {file.shared && (
                    <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                      <Share2 className="w-3 h-3 text-primary" />
                    </span>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button className="p-2 bg-card rounded-xl shadow-md hover:scale-110 transition-transform">
                      <Eye className="w-4 h-4 text-foreground" />
                    </button>
                    <button className="p-2 bg-card rounded-xl shadow-md hover:scale-110 transition-transform">
                      <Download className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                </div>
                {/* File Info */}
                <div className="p-4">
                  <p className="text-sm font-bold text-foreground truncate mb-1 group-hover:text-primary transition-colors">{file.name || "Untitled File"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{sizeString}</span>
                    <span className="text-[10px] text-muted-foreground/60 font-medium">
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "Just now"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700`}>
                      {file.project?.name ? file.project.name.split(" ")[0] : "General"}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold text-foreground">
                      {file.uploadedBy?.name ? file.uploadedBy.name[0].toUpperCase() : "U"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-card rounded-3xl shadow-sm border border-border/30 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border/30">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">File</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-40">Project</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-20 text-right">Size</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-20 text-right">Version</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-24 text-right">Uploaded</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase w-20 text-right">Actions</span>
          </div>
          {filteredFiles.map((file: any, idx: number) => {
            const fileCategory = file.category || "document";
            const FileIcon = getFileIcon(fileCategory);
            const fileColor = getFileColor(fileCategory);
            const sizeString = file.fileSize ? `${(file.fileSize / 1024).toFixed(0)} KB` : "0 KB";
            
            return (
              <div
                key={file.id}
                className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors cursor-pointer group ${
                  idx < filteredFiles.length - 1 ? "border-b border-border/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${fileColor.bg} flex items-center justify-center flex-shrink-0`}>
                    <FileIcon className={`w-4 h-4 ${fileColor.text}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{file.name || "Untitled File"}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[7px] font-bold text-foreground">
                        {file.uploadedBy?.name ? file.uploadedBy.name[0].toUpperCase() : "U"}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{file.uploadedBy?.name || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-40 truncate bg-blue-100 text-blue-700`}>
                  {file.project?.name || "General"}
                </span>
                <span className="text-sm text-muted-foreground font-medium w-20 text-right">{sizeString}</span>
                <span className="text-sm font-bold text-foreground w-20 text-right bg-muted px-2 py-0.5 rounded-md text-center">v{file.version || 1}</span>
                <span className="text-xs text-muted-foreground font-medium w-24 text-right">
                  {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "Just now"}
                </span>
                <div className="flex items-center justify-end gap-1 w-20">
                  <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {canUpload && (
                    <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
