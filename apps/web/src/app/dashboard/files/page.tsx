"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import {
  Search,
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
    case "image": return { bg: "bg-destructive/10", text: "text-destructive" }; // Clay tint
    case "document": return { bg: "bg-primary/10", text: "text-primary" }; // Teal tint
    case "archive": return { bg: "bg-status-attention/10", text: "text-status-attention" }; // Amber tint
    case "code": return { bg: "bg-status-on-track/10", text: "text-status-on-track" }; // Sage tint
    case "video": return { bg: "bg-secondary", text: "text-secondary-foreground" }; 
    default: return { bg: "bg-muted", text: "text-muted-foreground" }; // Muted paper
  }
}

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || "student";
  const canUpload = userRole !== "student";

  const { data: filesData, isLoading } = useQuery({
    queryKey: ["files"],
    queryFn: () => fetchApi<{ data: any[] }>("/files"),
  });

  const files = filesData?.data || [];

  const filteredFiles = files.filter((f: any) => {
    const matchesSearch = searchQuery === "" ||
      (f.name && f.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.project?.name && f.project.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
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
    <div className="max-w-[1320px] mx-auto pb-16">
      
      {/* Header Row */}
      <div className="flex justify-between items-end mb-[30px] relative">
        <div className="relative">
          <svg className="absolute left-[-6px] top-[-22px] opacity-50 z-0 animate-dash" style={{ strokeDasharray: 340, strokeDashoffset: 340, animationDelay: '500ms' }} width="70" height="34" viewBox="0 0 70 34" fill="none">
            <path d="M2 22C10 8 18 30 26 16S42 4 50 18s14-6 18 2" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase font-semibold mb-[6px] opacity-0 animate-fade-up">
            Global Repository
          </div>
          <h1 className="font-serif font-medium text-[36px] m-0 text-foreground relative z-10 opacity-0 animate-fade-up" style={{ animationDelay: '70ms' }}>
            Shared Assets
          </h1>
        </div>
        
        {canUpload && (
          <div className="opacity-0 animate-pop-in" style={{ animationDelay: '220ms' }}>
            <UploadFileDialog />
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] mb-[34px]">
        {[
          { label: "Total Files", value: files.length.toString(), icon: <FolderOpen className="w-4 h-4"/> },
          { label: "Storage Used", value: `${totalSizeMB} MB`, icon: <HardDrive className="w-4 h-4"/> },
          { label: "Recent Uploads", value: recentUploads.toString(), icon: <Clock className="w-4 h-4"/> },
          { label: "Shared Files", value: sharedFiles.toString(), icon: <Share2 className="w-4 h-4"/> },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-card border border-border rounded-[14px] p-[18px_20px] opacity-0 animate-fade-up hover:-translate-y-[3px] hover:shadow-[0_10px_22px_-16px_rgba(22,21,26,0.35)] transition-all group" style={{ animationDelay: `${i * 90 + 260}ms` }}>
            <div className="flex justify-between items-start mb-[14px]">
              <div className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground font-semibold">{stat.label}</div>
              <div className="w-[28px] h-[28px] rounded-[7px] bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 group-hover:animate-wiggle">
                {stat.icon}
              </div>
            </div>
            <div className="font-serif text-[30px] font-medium text-foreground leading-none animate-count-glow" style={{ animationDelay: '500ms' }}>
              {isLoading ? "-" : stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-between mb-[14px]">
        <div className="flex items-center gap-[6px] overflow-x-auto no-scrollbar pb-[4px]">
          {FILE_TYPES.map((ft) => (
            <button
              key={ft.value}
              onClick={() => setTypeFilter(ft.value)}
              className={`px-[12px] py-[6px] text-[11px] font-semibold uppercase tracking-widest rounded-[20px] transition-all whitespace-nowrap ${
                typeFilter === ft.value
                  ? "bg-foreground text-background"
                  : "bg-transparent text-muted-foreground hover:bg-muted"
              }`}
            >
              {ft.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-[12px] opacity-0 animate-fade-up">
          <div className="flex items-center gap-[8px] bg-card border border-border rounded-[9px] px-[12px] py-[7px] w-[220px] text-muted-foreground text-[12.5px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all hidden md:flex">
            <Search className="w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="border-none outline-none bg-transparent font-sans text-[13px] w-full text-foreground placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-[2px] bg-muted p-[3px] rounded-[9px] border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-[6px] rounded-[6px] transition-colors ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-black/5"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-[6px] rounded-[6px] transition-colors ${viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-black/5"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* File Display */}
      {isLoading ? (
        <div className="p-16 text-center text-muted-foreground text-sm flex flex-col items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin mb-3 opacity-50"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Loading files...
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-card border border-border rounded-[14px] p-16 text-center text-muted-foreground flex flex-col items-center opacity-0 animate-fade-up">
          <FolderOpen className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-[14px] font-medium text-foreground">No files found</p>
          <p className="text-[12px] text-muted-foreground mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[16px] opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
          {filteredFiles.map((file: any) => {
            const fileCategory = file.category || "document";
            const FileIcon = getFileIcon(fileCategory);
            const fileColor = getFileColor(fileCategory);
            const sizeString = file.fileSize ? `${(file.fileSize / 1024).toFixed(0)} KB` : "0 KB";
            
            return (
              <div key={file.id} className="bg-card border border-border rounded-[12px] group overflow-hidden hover:-translate-y-[2px] hover:shadow-[0_8px_20px_-12px_rgba(22,21,26,0.3)] transition-all flex flex-col cursor-pointer">
                {/* Preview Area */}
                <div className="h-[140px] bg-muted flex items-center justify-center relative border-b border-border transition-colors">
                  <div className={`w-[52px] h-[52px] rounded-[14px] ${fileColor.bg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                    <FileIcon className={`w-[26px] h-[26px] ${fileColor.text}`} />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center gap-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-[36px] h-[36px] rounded-full bg-card shadow-sm border border-border text-foreground hover:text-primary flex items-center justify-center transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="w-[36px] h-[36px] rounded-full bg-card shadow-sm border border-border text-foreground hover:text-primary flex items-center justify-center transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* File Info */}
                <div className="p-[14px] flex flex-col flex-1">
                  <p className="text-[13px] font-semibold text-foreground truncate mb-[4px] group-hover:text-primary transition-colors">{file.name || "Untitled File"}</p>
                  <p className="text-[11px] text-muted-foreground truncate mb-[8px]">{file.project?.name || "General"}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{sizeString}</span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Just now"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-card border border-border rounded-[14px] overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-[16px] px-[24px] py-[14px] items-center border-b border-border bg-muted/30">
            <span className="text-[10.5px] font-mono font-bold uppercase tracking-widest text-muted-foreground">File</span>
            <span className="text-[10.5px] font-mono font-bold uppercase tracking-widest text-muted-foreground w-[180px]">Project</span>
            <span className="text-[10.5px] font-mono font-bold uppercase tracking-widest text-muted-foreground w-[80px] text-right">Size</span>
            <span className="text-[10.5px] font-mono font-bold uppercase tracking-widest text-muted-foreground w-[100px] text-right">Uploaded</span>
            <span className="text-[10.5px] font-mono font-bold uppercase tracking-widest text-muted-foreground w-[80px] text-right">Actions</span>
          </div>
          <div className="divide-y divide-border/60">
            {filteredFiles.map((file: any) => {
              const fileCategory = file.category || "document";
              const FileIcon = getFileIcon(fileCategory);
              const fileColor = getFileColor(fileCategory);
              const sizeString = file.fileSize ? `${(file.fileSize / 1024).toFixed(0)} KB` : "0 KB";
              
              return (
                <div
                  key={file.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-[16px] px-[24px] py-[16px] items-center hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-[14px]">
                    <div className={`w-[36px] h-[36px] rounded-[9px] ${fileColor.bg} flex items-center justify-center shrink-0 shadow-sm`}>
                      <FileIcon className={`w-4 h-4 ${fileColor.text}`} />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">{file.name || "Untitled File"}</p>
                    </div>
                  </div>
                  <span className="text-[12.5px] text-muted-foreground w-[180px] truncate">
                    {file.project?.name || "General"}
                  </span>
                  <span className="text-[12.5px] text-muted-foreground font-medium w-[80px] text-right">{sizeString}</span>
                  <span className="text-[12px] text-muted-foreground w-[100px] text-right">
                    {file.createdAt ? new Date(file.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Just now"}
                  </span>
                  <div className="flex items-center justify-end gap-[4px] w-[80px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="h-[32px] w-[32px] rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    {canUpload && (
                      <button className="h-[32px] w-[32px] rounded-[8px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
