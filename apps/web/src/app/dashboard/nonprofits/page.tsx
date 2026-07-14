"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { Building2 } from "lucide-react"
import { CreateNonprofitDialog } from "./_components/create-nonprofit-dialog"
import { EditNonprofitDialog } from "./_components/edit-nonprofit-dialog"
import { useUserRole } from "@/hooks/use-user-role"

export default function NonprofitsPage() {
  const { isAdmin } = useUserRole()
  const { data, isLoading } = useQuery({
    queryKey: ["nonprofits"],
    queryFn: () => fetchApi<{ data: any[] }>("/nonprofits"),
  })
  
  const nonprofits = data?.data || []

  return (
    <div className="max-w-[1320px] mx-auto pb-16">
      {/* Header Row */}
      <div className="flex justify-between items-end mb-[30px] relative">
        <div className="relative">
          <svg className="absolute left-[-6px] top-[-22px] opacity-50 z-0 animate-dash" style={{ strokeDasharray: 340, strokeDashoffset: 340, animationDelay: '500ms' }} width="70" height="34" viewBox="0 0 70 34" fill="none">
            <path d="M2 22C10 8 18 30 26 16S42 4 50 18s14-6 18 2" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase font-semibold mb-[6px] opacity-0 animate-fade-up">
            Organization Profiles
          </div>
          <h1 className="font-serif font-medium text-[36px] m-0 text-foreground relative z-10 opacity-0 animate-fade-up" style={{ animationDelay: '70ms' }}>
            Nonprofits
          </h1>
        </div>
        
        {isAdmin && (
          <div className="opacity-0 animate-pop-in" style={{ animationDelay: '220ms' }}>
            <CreateNonprofitDialog />
          </div>
        )}
      </div>

      <div className="flex justify-between items-end mb-[14px]">
        <div className="font-serif text-[19px] font-semibold flex items-center gap-[10px]">
          All Partner Organizations
          <span className="text-[11px] font-mono bg-muted text-muted-foreground px-[6px] py-[2px] rounded-[4px] border border-border tracking-widest">{nonprofits.length}</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[14px] overflow-hidden mb-[36px] opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] p-[12px_24px] text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground font-semibold border-b border-border bg-muted/30">
          <div>Organization Name</div>
          <div>Location</div>
          <div>Website</div>
          <div className="text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin mb-3 opacity-50"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Loading nonprofits...
          </div>
        ) : nonprofits.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
             <Building2 className="w-8 h-8 opacity-20 mb-3 text-foreground" />
            No nonprofits found.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {nonprofits.map((np: any) => (
              <div key={np.id} className="grid grid-cols-[1.5fr_1fr_1fr_auto] p-[18px_24px] items-center hover:bg-muted/40 transition-colors group">
                <div className="flex items-center gap-[14px]">
                  <div className="w-[36px] h-[36px] rounded-[9px] border border-border bg-card flex items-center justify-center shrink-0 shadow-sm group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                    <Building2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-serif text-[16px] font-semibold text-foreground group-hover:text-primary transition-colors">{np.name}</span>
                </div>
                
                <div className="text-[12.5px] text-muted-foreground font-medium">
                  {np.city}, {np.state}
                </div>
                
                <div>
                  {np.websiteUrl ? (
                    <a href={np.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex text-[12.5px] font-medium text-primary hover:bg-primary/10 transition-colors px-[6px] py-[2px] rounded-[4px] -ml-[6px]">
                      {np.websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span className="text-[12.5px] text-muted-foreground/50 italic">Not provided</span>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAdmin && <EditNonprofitDialog nonprofit={np} />}
                    <button className="text-[12px] font-semibold text-primary hover:underline">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
