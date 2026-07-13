import Link from "next/link"
import { Check } from "lucide-react"

export default async function ProjectWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id: projectId } = await params

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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Signature Element: Persistent Lifecycle Rail */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 w-full">
            {stages.map((stage, index) => (
              <div key={stage} className="flex items-center flex-1">
                <div className={`flex items-center space-x-2 ${index <= currentStage ? "text-foreground" : "text-muted-foreground"}`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold font-mono
                    ${index < currentStage ? "bg-status-on-track text-white" : 
                      index === currentStage ? "bg-primary text-primary-foreground ring-2 ring-primary/20" : 
                      "bg-muted text-muted-foreground"}`}
                  >
                    {index < currentStage ? <Check className="w-3 h-3" /> : index + 1}
                  </div>
                  <span className={`text-sm font-medium font-heading ${index === currentStage ? "text-primary" : ""}`}>
                    {stage}
                  </span>
                </div>
                {index < stages.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${index < currentStage ? "bg-status-on-track" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-heading font-semibold tracking-tight">Green Earth Initiative</h1>
        <p className="text-lg text-muted-foreground font-sans">
          Workspace for the Alpha Team and Green Earth Foundation.
        </p>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.name === "Overview"; // Simplified for layout demo, should match pathname
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive 
                    ? "border-primary text-primary" 
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
