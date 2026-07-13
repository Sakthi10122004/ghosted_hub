"use client";

import { use } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check } from "lucide-react"

export default function ProjectWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id: projectId } = use(params)
  const pathname = usePathname()

  const tabs = [
    { name: "Overview", href: `/dashboard/projects/${projectId}` },
    { name: "Discovery", href: `/dashboard/projects/${projectId}/discovery` },
    { name: "Tasks", href: `/dashboard/projects/${projectId}/tasks` },
    { name: "Files", href: `/dashboard/projects/${projectId}/files` },
    { name: "Reviews", href: `/dashboard/projects/${projectId}/reviews` },
    { name: "Deliverables", href: `/dashboard/projects/${projectId}/deliverables` },
  ]
  
  // Hardcoded for UI demonstration; in real implementation, derive from project status
  const currentStage = 2; // 0-indexed: 0=Discovery, 1=Build, 2=Review, 3=Launch, 4=Closed
  const stages = ["Discovery", "Build", "Review", "Launch", "Closed"];

  return (
    <div className="space-y-6">
      {/* Signature Element: Persistent Lifecycle Rail */}
      <div className="bg-card border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 w-full">
            {stages.map((stage, index) => {
              const isPast = index < currentStage;
              const isCurrent = index === currentStage;
              
              return (
                <div key={stage} className="flex items-center flex-1">
                  <div className={`flex items-center space-x-2 ${isPast || isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border border-border
                      ${isPast ? "bg-foreground text-background" : 
                        isCurrent ? "bg-primary text-primary-foreground border-primary" : 
                        "bg-transparent text-muted-foreground"}`}
                    >
                      {isPast ? <Check className="w-3 h-3" /> : index + 1}
                    </div>
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${isCurrent ? "text-primary font-bold" : ""}`}>
                      {stage}
                    </span>
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 rounded-full ${isPast ? "bg-status-on-track" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <h1 className="text-xl font-mono font-bold uppercase tracking-widest text-foreground">Green Earth Initiative</h1>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Workspace for the Alpha Team and Green Earth Foundation.
        </p>
      </div>

      <div className="border-b border-border/60">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`whitespace-nowrap py-3 px-1 border-b-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors
                  ${isActive 
                    ? "border-foreground text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-2">
        {children}
      </div>
    </div>
  )
}
