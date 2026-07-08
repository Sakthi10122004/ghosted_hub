export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Ghosted Hub
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The operating system for the Ghosted program.
        </p>
        <div className="mt-8">
          <a
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
