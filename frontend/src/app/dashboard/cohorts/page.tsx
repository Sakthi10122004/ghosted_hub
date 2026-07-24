"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import Link from "next/link";
import { CreateCohortDialog } from "./_components/create-cohort-dialog";
import { useUserRole } from "@/hooks/use-user-role";
import { Layers } from "lucide-react";

export default function CohortsPage() {
  const { isAdmin } = useUserRole();
  const { data, isLoading } = useQuery({
    queryKey: ["cohorts"],
    queryFn: () => fetchApi<{ data: any[] }>("/cohorts"),
  });

  const cohorts = data?.data || [];

  return (
    <div className="max-w-[1320px] mx-auto pb-16">
      {/* Header Row */}
      <div className="flex justify-between items-end mb-[30px] relative">
        <div className="relative">
          <svg className="absolute left-[-6px] top-[-22px] opacity-50 z-0 animate-dash" style={{ strokeDasharray: 340, strokeDashoffset: 340, animationDelay: '500ms' }} width="70" height="34" viewBox="0 0 70 34" fill="none">
            <path d="M2 22C10 8 18 30 26 16S42 4 50 18s14-6 18 2" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase font-semibold mb-[6px] opacity-0 animate-fade-up">
            Program Management
          </div>
          <h1 className="font-serif font-medium text-[36px] m-0 text-foreground relative z-10 opacity-0 animate-fade-up" style={{ animationDelay: '70ms' }}>
            Cohorts
          </h1>
        </div>
        
        {isAdmin && (
          <div className="opacity-0 animate-pop-in" style={{ animationDelay: '220ms' }}>
            <CreateCohortDialog />
          </div>
        )}
      </div>

      <div className="flex justify-between items-end mb-[14px]">
        <div className="font-serif text-[19px] font-semibold flex items-center gap-[10px]">
          All Program Cycles
          <span className="text-[11px] font-mono bg-muted text-muted-foreground px-[6px] py-[2px] rounded-[4px] border border-border tracking-widest">{cohorts.length}</span>
        </div>
      </div>

      {/* Cohorts Table equivalent */}
      <div className="bg-card border border-border rounded-[14px] overflow-hidden mb-[36px] opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] p-[12px_24px] text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground font-semibold border-b border-border bg-muted/30">
          <div>Name</div>
          <div>Status</div>
          <div>Dates</div>
          <div className="text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin mb-3 opacity-50"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Loading cohorts...
          </div>
        ) : cohorts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-20 mb-3"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            No cohorts found.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {cohorts.map((cohort: any) => (
              <div key={cohort.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] p-[18px_24px] items-center hover:bg-muted/40 transition-colors group relative">
                <Link href={`/dashboard/cohorts/${cohort.id}`} className="absolute inset-0 z-10" />
                
                <div className="flex items-center gap-[14px]">
                  <div className="w-[36px] h-[36px] rounded-[9px] bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 shadow-sm">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-serif text-[16px] font-semibold text-foreground group-hover:text-primary transition-colors">{cohort.name}</p>
                  </div>
                </div>

                <div>
                  <span className={`inline-flex items-center px-[8px] py-[3px] rounded-[4px] text-[9.5px] font-bold uppercase tracking-wider ${
                    cohort.status === "ACTIVE" ? "bg-[#DEEAE7] text-[#0A4F44]" : "bg-[#E4E1D8] text-[#6F6D63]"
                  }`}>
                    {cohort.status === "ACTIVE" ? "Active" : cohort.status}
                  </span>
                </div>

                <div className="text-[12.5px] text-muted-foreground font-medium">
                  {new Date(cohort.sprintStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  <span className="mx-2 opacity-50">-</span>
                  {new Date(cohort.sprintEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                <div className="text-right relative z-20">
                  <button className="text-[12px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
