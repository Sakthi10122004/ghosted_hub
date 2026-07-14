"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useUserRole } from "@/hooks/use-user-role";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  MessageSquare,
  Eye,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────
const REVIEW_STAGES = ["Submitted", "In Review", "Needs Changes", "Resubmitted", "Approved"] as const;
type ReviewStage = typeof REVIEW_STAGES[number];
const FILTER_TABS = ["All", "Submitted", "In Review", "Needs Changes", "Resubmitted", "Approved"] as const;

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
    <div className="max-w-[1320px] mx-auto pb-16">
      
      {/* Header Row */}
      <div className="flex justify-between items-end mb-[30px] relative">
        <div className="relative">
          <svg className="absolute left-[-6px] top-[-22px] opacity-50 z-0 animate-dash" style={{ strokeDasharray: 340, strokeDashoffset: 340, animationDelay: '500ms' }} width="70" height="34" viewBox="0 0 70 34" fill="none">
            <path d="M2 22C10 8 18 30 26 16S42 4 50 18s14-6 18 2" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase font-semibold mb-[6px] opacity-0 animate-fade-up">
            Design & Code
          </div>
          <h1 className="font-serif font-medium text-[36px] m-0 text-foreground relative z-10 opacity-0 animate-fade-up" style={{ animationDelay: '70ms' }}>
            Theme Reviews
          </h1>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] mb-[34px]">
        {[
          { label: "Pending", value: (stageCounts["Submitted"] || 0) + (stageCounts["Resubmitted"] || 0), icon: <Clock className="w-4 h-4"/> },
          { label: "In Progress", value: stageCounts["In Review"] || 0, icon: <Eye className="w-4 h-4"/> },
          { label: "Needs Changes", value: stageCounts["Needs Changes"] || 0, icon: <AlertTriangle className="w-4 h-4"/> },
          { label: "Approved", value: stageCounts["Approved"] || 0, icon: <CheckCircle2 className="w-4 h-4"/> },
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

      {/* Pipeline Rail - Signature Element */}
      <div className="mb-[36px] bg-[#16151A] rounded-[14px] p-[24px_32px] opacity-0 animate-fade-up">
        <div className="flex flex-col gap-[16px]">
          <div className="flex justify-between text-[11px] text-[#8B889A] font-mono tracking-[0.04em] uppercase mb-[4px]">
            {REVIEW_STAGES.map((stage) => (
              <span key={stage} className={(stageCounts[stage] || 0) > 0 ? 'text-[#EFEDE6] font-bold' : ''}>{stage}</span>
            ))}
          </div>
          
          <div className="flex gap-[6px] origin-left">
            {REVIEW_STAGES.map((stage, idx) => {
              const count = stageCounts[stage] || 0;
              const hasItems = count > 0;
              let segClass = "flex-1 h-[8px] rounded-[4px] bg-sidebar-border relative";
              if (hasItems) {
                segClass = "flex-1 h-[8px] rounded-[4px] bg-primary relative animate-grow-seg origin-left scale-x-0 after:content-[''] after:absolute after:-right-[3px] after:-top-[3px] after:w-[14px] after:h-[14px] after:rounded-full after:bg-primary after:border-[3px] after:border-sidebar";
              }
              return (
                <div key={idx} className={segClass} style={{ animationDelay: `${idx * 100}ms` }}></div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-[14px]">
        <div className="flex items-center gap-[6px] overflow-x-auto no-scrollbar pb-[4px]">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-[12px] py-[6px] text-[11px] font-semibold uppercase tracking-widest rounded-[20px] transition-all whitespace-nowrap ${
                activeFilter === tab
                  ? "bg-foreground text-background"
                  : "bg-transparent text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab}
              {tab !== "All" && (
                <span className="ml-[6px] opacity-60 font-mono">
                  {stageCounts[tab] || 0}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-[8px] bg-card border border-border rounded-[9px] px-[12px] py-[7px] w-[260px] text-muted-foreground text-[12.5px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all opacity-0 animate-fade-up hidden md:flex">
          <Search className="w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search reviews..." 
            className="border-none outline-none bg-transparent font-sans text-[13px] w-full text-foreground placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Review Cards (List View) */}
      <div className="bg-card border border-border rounded-[14px] overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="divide-y divide-border/60">
          {isLoading || isPending ? (
            <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin mb-3 opacity-50"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Loading reviews...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-20 mb-3"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/></svg>
              All caught up! No reviews match your filter.
            </div>
          ) : (
            filteredReviews.map((review: any) => {
              const stage = review.status || "Submitted";
              return (
                <div
                  key={review.id}
                  className="p-[18px_24px] hover:bg-muted/40 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-[24px] w-full">
                    {/* Left: Project Info */}
                    <div className="w-64 shrink-0">
                      <div className="flex items-center gap-2 mb-[4px]">
                        <span className={`inline-flex items-center px-[8px] py-[3px] rounded-[4px] text-[9.5px] font-bold uppercase tracking-wider ${
                          stage === "Approved" ? "bg-status-on-track/10 text-status-on-track" :
                          stage === "Needs Changes" ? "bg-destructive/10 text-destructive" :
                          stage === "In Review" ? "bg-status-attention/10 text-status-attention" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {stage}
                        </span>
                      </div>
                      <h3 className="font-serif font-semibold text-[16px] text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {review.title || "Theme Review"}
                      </h3>
                      <p className="text-[12px] text-muted-foreground mt-[2px] line-clamp-1">{review.project?.name || "No Project"}</p>
                    </div>

                    {/* Center: Mini stage rail */}
                    <div className="flex-1 flex justify-center hidden md:flex">
                       <div className="flex items-center gap-[4px]">
                          {REVIEW_STAGES.map((s, idx) => {
                            const isPast = REVIEW_STAGES.indexOf(stage as ReviewStage) >= idx;
                            return (
                              <div key={s} className="flex items-center gap-[4px]">
                                <div className={`w-[6px] h-[6px] rounded-full ${isPast ? 'bg-primary' : 'bg-border'}`}></div>
                                {idx < REVIEW_STAGES.length - 1 && <div className={`w-[12px] h-[2px] ${isPast ? 'bg-primary' : 'bg-border'}`}></div>}
                              </div>
                            );
                          })}
                       </div>
                    </div>

                    {/* Right: Meta & Actions */}
                    <div className="flex items-center gap-[16px] shrink-0 w-48 justify-end">
                      <div className="flex items-center gap-[12px]">
                        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-[4px]">
                          <Clock className="w-3.5 h-3.5" />
                          Today
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-[4px]">
                          <MessageSquare className="w-3.5 h-3.5" />
                          0
                        </span>
                      </div>
                      <div className="flex items-center gap-[4px] opacity-0 group-hover:opacity-100 transition-opacity">
                        {stage !== "Approved" && canApprove ? (
                          <>
                            <button className="h-[32px] w-[32px] rounded-[8px] text-muted-foreground hover:text-status-on-track hover:bg-status-on-track/10 flex items-center justify-center transition-colors" title="Approve">
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button className="h-[32px] w-[32px] rounded-[8px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors" title="Request Changes">
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button className="h-[32px] w-[32px] rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
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
    </div>
  );
}
