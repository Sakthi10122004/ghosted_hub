import { FolderKanban } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative bg-background border-r border-border">
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2">
          <div className="w-8 h-8 border border-border flex items-center justify-center">
            <FolderKanban className="w-4 h-4 text-primary" />
          </div>
          <span className="font-mono font-bold uppercase tracking-widest text-lg">Ghosted Hub</span>
        </div>
        
        <div className="max-w-sm w-full mx-auto">
          {children}
        </div>

        <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            &copy; {new Date().getFullYear()} TECH FOR GOOD CANADA
          </p>
        </div>
      </div>

      {/* Right Panel: Graphic/Branding */}
      <div className="hidden lg:flex w-1/2 bg-muted items-center justify-center p-12 relative overflow-hidden">
        {/* Strict grid pattern background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwem0xIDEwLjVoMjJ2MWgtMjJ6bTEwLjUtMTBoMXYyMmgtMXoiIGZpbGw9ImN1cnJlbnRDb2xvciIgZmlsbC1vcGFjaXR5PSIwLjA1IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] text-foreground pointer-events-none" />
        
        <div className="max-w-lg relative z-10 space-y-8 p-8 border border-border bg-background">
          <div className="space-y-4 border-b border-border pb-6">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-widest text-foreground">
              Project Index
            </h2>
            <p className="text-sm font-mono text-muted-foreground leading-relaxed">
              Architectural control for deployment operations. Align deliverables and coordinate across distributed teams with rigid precision.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-border p-4">
              <div className="w-8 h-8 border border-border flex items-center justify-center mb-3">
                <span className="text-primary font-mono font-bold text-xs">01</span>
              </div>
              <h3 className="font-mono font-bold uppercase tracking-widest text-xs text-foreground mb-1">Onboard</h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Integrate structure.</p>
            </div>
            <div className="border border-border p-4">
              <div className="w-8 h-8 border border-border flex items-center justify-center mb-3">
                <span className="text-primary font-mono font-bold text-xs">02</span>
              </div>
              <h3 className="font-mono font-bold uppercase tracking-widest text-xs text-foreground mb-1">Deliver</h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Execute deployments.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
