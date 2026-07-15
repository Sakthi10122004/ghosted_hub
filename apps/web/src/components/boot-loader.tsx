"use client";

import { useEffect, useState } from "react";

export function BootLoader() {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Show loading screen for 1.8 seconds, then fade out
    const timer = setTimeout(() => setLoading(false), 1800);
    const removeTimer = setTimeout(() => setVisible(false), 2400); // Wait for fade out transition
    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-all duration-700 ease-out pointer-events-none ${loading ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-sm'}`}
    >
      <div className="relative flex flex-col items-center">
        {/* Pulsing rings for 'amazing animation' */}
        <div className="absolute -inset-12 rounded-full border border-primary/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="absolute -inset-6 rounded-full border-2 border-primary/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
        
        {/* The App Logo */}
        <div className="relative z-10 w-[120px] h-[120px] rounded-[32px] overflow-hidden shadow-2xl border border-white/5 animate-pulse bg-white">
          <img src="/logo.jpg" alt="Ghosted" className="w-full h-full object-contain" />
        </div>
        
        <h1 className="mt-12 font-serif text-[34px] font-semibold text-foreground tracking-wide">
          Ghosted
        </h1>
        
        <div className="mt-4 flex gap-1.5 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
