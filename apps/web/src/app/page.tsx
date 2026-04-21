export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative z-0">
      {/* Background Watermark */}
      <div className="fixed inset-0 flex items-center justify-center -z-10 overflow-hidden pointer-events-none">
        <h1 className="text-[20vw] leading-none font-display font-medium text-[var(--text-watermark)] select-none">
          SCRIBE
        </h1>
      </div>

      <header className="nav-blur sticky top-0 h-14 flex items-center justify-between px-8 z-50">
        <div className="font-display font-bold text-xl tracking-tight">Scribe.ai</div>
        <nav className="hidden md:flex gap-6 text-sm text-[var(--text-secondary)]">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">How it Works</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <button className="btn-primary">Get Started</button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center border-b border-[var(--grid-line-strong)] py-32 px-4 relative">
        <div className="text-center max-w-3xl flex flex-col items-center gap-6 relative z-10">
          <h1 className="font-display text-5xl md:text-7xl tracking-tighter leading-[1.1]">
            Your career story,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-1)] via-[var(--gradient-2)] to-[var(--gradient-3)]">
              intelligently told.
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg md:text-xl max-w-xl font-body">
            Build, tailor, and manage your job applications with the precision of a technical tool and the elegance of premium design.
          </p>
          <div className="flex gap-4 mt-4">
            <button className="btn-primary px-8">Get Started — Free</button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: 'var(--glow-ambient)' }}
        />
      </main>

      <section className="py-24 px-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1280px] mx-auto min-h-[400px]">
        {/* Placeholder Bento Cards to test the glassmorphism + border */}
        <div className="md:col-span-2 col-span-1 rounded-xl bg-[var(--bg-surface-transparent)] backdrop-blur-md border border-[var(--border-subtle)] p-8">
          <div className="font-mono text-xs mb-4 text-[var(--text-secondary)]">
            <span className="text-[var(--success)]">►</span> system load: OK
          </div>
          <h3 className="font-display text-2xl mb-2">AI Tailoring Engine</h3>
          <p className="text-[var(--text-secondary)]">Targeted resumes for every application at lightning speed.</p>
        </div>
        
        <div className="col-span-1 rounded-xl bg-[var(--bg-surface-transparent)] backdrop-blur-md border border-[var(--border-subtle)] p-8">
          <div className="font-mono text-xs mb-4 text-[var(--text-secondary)]">
            <span className="text-[var(--info)]">⚡</span> ats_score: 94
          </div>
          <h3 className="font-display text-2xl mb-2">ATS Simulator</h3>
          <p className="text-[var(--text-secondary)]">Know you'll pass before you apply.</p>
        </div>
      </section>
    </div>
  );
}
