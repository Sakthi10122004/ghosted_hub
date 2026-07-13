"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  ChevronRight,
  MessageSquare,
  Eye,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────
const REVIEW_STAGES = ["Submitted", "In Review", "Needs Changes", "Resubmitted", "Approved"] as const;
type ReviewStage = typeof REVIEW_STAGES[number];
const FILTER_TABS = ["All", "Submitted", "In Review", "Needs Changes", "Resubmitted", "Approved"] as const;

// ── Helper functions ───────────────────────────────────────────────────────
function getStageColor(stage: string) {
  switch (stage) {
    case "Submitted": return { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" };
    case "In Review": return { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary", border: "border-primary/20" };
    case "Needs Changes": return { bg: "bg-status-attention/10", text: "text-status-attention", dot: "bg-status-attention", border: "border-status-attention/20" };
    case "Resubmitted": return { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", border: "border-purple-200" };
    case "Approved": return { bg: "bg-status-on-track/10", text: "text-status-on-track", dot: "bg-status-on-track", border: "border-status-on-track/20" };
    default: return { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500", border: "border-gray-200" };
  }
}

// ── Stage Rail Component ───────────────────────────────────────────────────
function ReviewStageRail({ currentStage, compact = false }: { currentStage: string; compact?: boolean }) {
  const currentIdx = REVIEW_STAGES.indexOf(currentStage as ReviewStage) !== -1 ? REVIEW_STAGES.indexOf(currentStage as ReviewStage) : 0;

  return (
    <div className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`}>
      {REVIEW_STAGES.map((stage, idx) => {
        const isPast = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={stage} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`${compact ? "w-2 h-2" : "w-3 h-3"} rounded-full transition-all duration-300 ${
                  isCurrent
                    ? `${getStageColor(currentStage).dot} ring-4 ring-offset-2 ring-offset-card ${getStageColor(currentStage).bg}`
                    : isPast
                    ? "bg-status-on-track"
                    : "bg-muted"
                }`}
              />
              {!compact && (
                <span className={`text-[9px] font-bold tracking-wider uppercase mt-1.5 whitespace-nowrap ${
                  isCurrent ? getStageColor(currentStage).text : isPast ? "text-status-on-track" : "text-muted-foreground/50"
                }`}>
                  {stage.length > 10 ? stage.substring(0, 8) + "…" : stage}
                </span>
              )}
            </div>
            {idx < REVIEW_STAGES.length - 1 && (
              <div className={`${compact ? "w-3" : "w-6"} h-0.5 mx-0.5 rounded-full ${
                idx < currentIdx ? "bg-status-on-track" : "bg-muted"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Page Component ─────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || "student";
  const canApprove = userRole === "admin" || userRole === "SUPER_ADMIN" || userRole === "event_manager" || userRole === "ORGANIZER";

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: () => fetchApi<{ data: any[] }>("/reviews"),
  });

  const reviews = reviewsData?.data || [];

  const filteredReviews = reviews.filter((r: any) => {
    const stage = r.status || "Submitted";
    const matchesFilter = activeFilter === "All" || stage === activeFilter;
    const matchesSearch = searchQuery === "" ||
      (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.project?.name && r.project.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const stageCounts = REVIEW_STAGES.reduce((acc, stage) => {
    acc[stage] = reviews.filter((r: any) => (r.status || "Submitted") === stage).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 relative z-10">
      {/* Decorative blobs */}
      <div className="absolute top-[-5%] right-[-8%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[40%] left-[-5%] w-[20%] h-[20%] bg-secondary rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-end justify-between bg-card p-6 rounded-3xl shadow-sm border border-border/50">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1">Code Quality & Design</p>
          <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">Theme Reviews</h1>
          <p className="text-muted-foreground mt-1 font-medium">Track, triage, and approve website code and theme deliverables.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search theme reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl border-none bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-56 transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Pending Reviews", value: (stageCounts["Submitted"] || 0) + (stageCounts["Resubmitted"] || 0), icon: Clock, color: "text-blue-600", bgColor: "bg-blue-50" },
          { label: "In Progress", value: stageCounts["In Review"] || 0, icon: Eye, color: "text-primary", bgColor: "bg-primary/5" },
          { label: "Needs Changes", value: stageCounts["Needs Changes"] || 0, icon: AlertTriangle, color: "text-status-attention", bgColor: "bg-status-attention/5" },
          { label: "Approved", value: stageCounts["Approved"] || 0, icon: CheckCircle2, color: "text-status-on-track", bgColor: "bg-status-on-track/5" },
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
              <p className="text-4xl font-serif font-bold text-foreground">{isLoading ? "-" : stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Rail - Signature Element */}
      <div className="bg-card rounded-3xl p-8 shadow-sm border border-border/50">
        <h2 className="text-sm font-bold tracking-wider text-foreground uppercase mb-6">Review Pipeline</h2>
        <div className="flex items-center justify-between">
          {REVIEW_STAGES.map((stage, idx) => {
            const colors = getStageColor(stage);
            const count = stageCounts[stage] || 0;
            return (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.border} border-2 flex items-center justify-center mb-2 transition-transform hover:scale-110`}>
                    <span className={`text-xl font-serif font-bold ${colors.text}`}>{isLoading ? "-" : count}</span>
                  </div>
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${colors.text}`}>{stage}</span>
                </div>
                {idx < REVIEW_STAGES.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 -mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 p-1.5 bg-muted rounded-2xl w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeFilter === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {tab !== "All" && (
              <span className={`ml-1.5 text-[10px] ${activeFilter === tab ? "text-primary" : "text-muted-foreground/60"}`}>
                {stageCounts[tab] || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-card rounded-3xl p-16 shadow-sm border border-border/50 text-center text-muted-foreground font-bold">
            Loading reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-card rounded-3xl p-16 shadow-sm border border-border/50 text-center">
            <div className="w-16 h-16 rounded-2xl bg-status-on-track/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-status-on-track" />
            </div>
            <h3 className="text-xl font-serif font-bold text-foreground mb-2">All caught up! 🎉</h3>
            <p className="text-muted-foreground font-medium">No reviews match your current filter. Try adjusting your search.</p>
          </div>
        ) : (
          filteredReviews.map((review: any) => {
            const stage = review.status || "Submitted";
            const stageColors = getStageColor(stage);
            return (
              <div
                key={review.id}
                className="bg-card rounded-3xl p-6 shadow-sm border border-border/30 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors" />
                
                <div className="flex items-start gap-6">
                  {/* Left: Project Info */}
                  <div className="w-64 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎭</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase ${stageColors.bg} ${stageColors.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${stageColors.dot}`} />
                        {stage}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                      {review.title || "Theme Review"}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1">{review.project?.name || "No Project"}</p>
                    <span className="text-xs text-muted-foreground/70 font-medium">{review.category || "Code"}</span>
                  </div>

                  {/* Center: Mini stage rail */}
                  <div className="flex-1 flex items-center justify-center pt-2">
                    <ReviewStageRail currentStage={stage} compact />
                  </div>

                  {/* Right: Meta & Actions */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {/* Time & Comments */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Today
                      </span>
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        0
                      </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1.5">
                      {stage !== "Approved" && canApprove && (
                        <>
                          <button className="p-2 rounded-xl hover:bg-status-on-track/10 text-muted-foreground hover:text-status-on-track transition-all" title="Approve">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-xl hover:bg-status-attention/10 text-muted-foreground hover:text-status-attention transition-all" title="Request Changes">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
