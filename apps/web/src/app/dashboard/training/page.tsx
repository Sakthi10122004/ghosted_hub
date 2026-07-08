export default function TrainingPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 relative z-10">
      <div className="flex items-end justify-between bg-card p-6 rounded-3xl shadow-sm border border-border/50">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">Training</h1>
          <p className="text-muted-foreground mt-2 font-medium">Workshops, onboarding materials, and resources.</p>
        </div>
      </div>
      <div className="bg-card rounded-3xl p-12 shadow-sm border border-border/50 text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Coming Soon</h2>
        <p className="text-muted-foreground font-medium">The training hub is currently under construction.</p>
      </div>
    </div>
  );
}
