"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useUserRole } from "@/hooks/use-user-role";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    default: return { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground", border: "border-border" };
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
                className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} rounded-full transition-all duration-300 ${
                  isCurrent
                    ? `${getStageColor(currentStage).dot} ring-2 ring-offset-1 ring-offset-card`
                    : isPast
                    ? "bg-status-on-track"
                    : "bg-muted"
                }`}
              />
              {!compact && (
                <span className={`text-[10px] font-medium mt-1.5 whitespace-nowrap ${
                  isCurrent ? getStageColor(currentStage).text : isPast ? "text-status-on-track" : "text-muted-foreground"
                }`}>
                  {stage}
                </span>
              )}
            </div>
            {idx < REVIEW_STAGES.length - 1 && (
              <div className={`${compact ? "w-2" : "w-4"} h-0.5 mx-0.5 rounded-full ${
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
  
  const { isAdmin: canApprove, isPending } = useUserRole();

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold uppercase tracking-widest text-foreground">Theme Reviews</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Index // Deliverables</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: (stageCounts["Submitted"] || 0) + (stageCounts["Resubmitted"] || 0), icon: Clock, color: "text-blue-600", bgColor: "bg-blue-100" },
          { label: "In Progress", value: stageCounts["In Review"] || 0, icon: Eye, color: "text-primary", bgColor: "bg-primary/10" },
          { label: "Needs Changes", value: stageCounts["Needs Changes"] || 0, icon: AlertTriangle, color: "text-status-attention", bgColor: "bg-status-attention/10" },
          { label: "Approved", value: stageCounts["Approved"] || 0, icon: CheckCircle2, color: "text-status-on-track", bgColor: "bg-status-on-track/10" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground uppercase">{stat.label}</p>
                <p className="text-2xl font-mono font-bold text-foreground mt-1">{isLoading ? "-" : stat.value}</p>
              </div>
              <div className={`w-10 h-10 border border-border flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Rail - Signature Element */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {REVIEW_STAGES.map((stage, idx) => {
              const colors = getStageColor(stage);
              const count = stageCounts[stage] || 0;
              return (
                <div key={stage} className="flex items-center flex-1">
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      <span className={`text-xs font-medium text-muted-foreground uppercase tracking-wider`}>{stage}</span>
                    </div>
                    <span className="text-2xl font-semibold text-foreground ml-4">{isLoading || isPending ? "-" : count}</span>
                  </div>
                  {idx < REVIEW_STAGES.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border border-transparent transition-colors ${
                activeFilter === tab
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {tab}
              {tab !== "All" && (
                <span className="ml-1.5 opacity-60">
                  ({stageCounts[tab] || 0})
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64 h-9"
          />
        </div>
      </div>

      {/* Review Cards (List View) */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {isLoading || isPending ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Loading reviews...
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No reviews match your current filter.</p>
              </div>
            ) : (
              filteredReviews.map((review: any) => {
                const stage = review.status || "Submitted";
                const stageColors = getStageColor(stage);
                return (
                  <div
                    key={review.id}
                    className="p-4 hover:bg-muted/40 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-6 w-full">
                      {/* Left: Project Info */}
                      <div className="w-64 shrink-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${stageColors.bg} ${stageColors.text}`}>
                            {stage}
                          </span>
                        </div>
                        <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                          {review.title || "Theme Review"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{review.project?.name || "No Project"}</p>
                      </div>

                      {/* Center: Mini stage rail */}
                      <div className="flex-1 flex justify-center">
                        <ReviewStageRail currentStage={stage} compact />
                      </div>

                      {/* Right: Meta & Actions */}
                      <div className="flex items-center gap-4 shrink-0 w-48 justify-end">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Today
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            0
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {stage !== "Approved" && canApprove ? (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-status-on-track hover:bg-status-on-track/10" title="Approve">
                                <ThumbsUp className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-status-attention hover:bg-status-attention/10" title="Request Changes">
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="View">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
