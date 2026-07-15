export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative bg-background border-r border-border">
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] overflow-hidden flex items-center justify-center border border-border shadow-sm group">
            <img src="/logo.jpg" alt="Ghosted Logo" className="w-[120%] h-[120%] object-cover object-center group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="font-serif font-bold text-2xl tracking-wide text-foreground">Ghosted</span>
        </div>
        
        <div className="max-w-sm w-full mx-auto">
          {children}
        </div>

        <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            &copy; {new Date().getFullYear()} TECH4GOOD COMMUNITY
          </p>
        </div>
      </div>

      {/* Right Panel: Graphic/Branding */}
      <div className="hidden lg:flex w-1/2 bg-muted items-center justify-center p-12 relative overflow-hidden">
        {/* Strict grid pattern background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwem0xIDEwLjVoMjJ2MWgtMjJ6bTEwLjUtMTBoMXYyMmgtMXoiIGZpbGw9ImN1cnJlbnRDb2xvciIgZmlsbC1vcGFjaXR5PSIwLjA1IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] text-foreground pointer-events-none" />
        
        <div className="max-w-lg relative z-10 flex flex-col items-center text-center animate-fade-up">
          <div className="relative mb-10 mt-[-40px]">
            {/* Animated rings behind logo */}
            <div className="absolute -inset-10 rounded-full border border-primary/20 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <div className="absolute -inset-4 rounded-full border border-primary/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
            
            {/* Main Logo Container */}
            <div className="w-48 h-48 rounded-[40px] overflow-hidden shadow-2xl border border-white/10 relative z-10 bg-white animate-[pulse_3s_ease-in-out_infinite]">
              <img src="/logo.jpg" alt="Ghosted Platform" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <h2 className="text-3xl font-serif font-semibold text-foreground mb-4 tracking-wide">
            Welcome to Ghosted
          </h2>
          <p className="text-muted-foreground max-w-[360px] leading-relaxed">
            The intelligent operating system for Tech4Good Community. Streamline your project lifecycle, coordinate teams, and track deliverables.
          </p>
        </div>
      </div>
    </div>
  );
}
