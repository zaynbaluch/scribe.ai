import Link from 'next/link';
import { ArrowRight, FileText, LayoutDashboard, Target, Briefcase, Zap, Globe, Terminal } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-[#e4e4e7] overflow-x-hidden selection:bg-[var(--gradient-2)] selection:text-white">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 flex items-center justify-center -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--gradient-2)] rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--gradient-1)] rounded-full blur-[120px] opacity-20" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 h-16 flex items-center justify-between px-6 md:px-12 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[var(--gradient-1)] to-[var(--gradient-2)] flex items-center justify-center text-white font-display font-bold text-sm">
            S
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Scribe.ai</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-[#a1a1aa] font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/login" className="hidden md:inline-flex px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-mono text-[var(--gradient-2)] mb-8">
            <SparklesIcon size={14} /> Introducing the Phase 8 Release
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[1.05] font-bold mb-6 max-w-4xl">
            Your career story,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-1)] via-[var(--gradient-2)] to-[var(--gradient-3)]">
              intelligently told.
            </span>
          </h1>
          
          <p className="text-[#a1a1aa] text-lg md:text-xl max-w-2xl font-body mb-10 leading-relaxed">
            Stop guessing what the ATS wants. Scribe is an advanced agentic platform that tailors your resume, tracks your applications, and hosts your portfolio—all in one elegant interface.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/login" className="px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:scale-105 transition-transform flex items-center gap-2">
              Start Building for Free <ArrowRight size={18} />
            </Link>
            <a href="https://github.com/zaynbaluch/scribe.ai" target="_blank" rel="noreferrer" className="px-8 py-4 rounded-xl text-base font-semibold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> View Source
            </a>
          </div>

          {/* Hero Image Mockup */}
          <div className="mt-24 w-full relative rounded-2xl border border-white/10 bg-[#18181b] shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0f] opacity-50 z-10" />
            <div className="h-12 border-b border-white/10 bg-[#0a0a0f]/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <div className="w-3 h-3 rounded-full bg-[#10b981]" />
            </div>
            <div className="p-8 grid grid-cols-3 gap-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
              <div className="col-span-1 space-y-4">
                <div className="h-8 w-1/2 bg-white/10 rounded-md" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/5 rounded" />
                  <div className="h-4 w-5/6 bg-white/5 rounded" />
                  <div className="h-4 w-4/6 bg-white/5 rounded" />
                </div>
              </div>
              <div className="col-span-2 rounded-xl bg-[#0a0a0f]/50 border border-white/10 p-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)]" />
                  <div>
                    <div className="h-6 w-48 bg-white/10 rounded mb-2" />
                    <div className="h-4 w-32 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-24 w-full bg-white/5 rounded-lg" />
                  <div className="h-24 w-full bg-white/5 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">An unfair advantage.</h2>
            <p className="text-[#a1a1aa] text-lg">Powerful tools designed to land you the interview.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="md:col-span-2 col-span-1 rounded-3xl bg-[#18181b]/50 border border-white/10 p-8 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 rounded-xl bg-[var(--gradient-2)]/20 flex items-center justify-center mb-6">
                  <Wand2Icon className="text-[var(--gradient-2)]" size={24} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">AI Tailoring Engine</h3>
                <p className="text-[#a1a1aa]">Paste a Job Description. Our agentic LLM pipeline instantly maps your experiences, re-writes bullet points to match the JD, and generates a tailored resume.</p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 group-hover:opacity-40 transition-opacity">
                <Terminal size={200} className="translate-x-1/4 translate-y-1/4" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-span-1 rounded-3xl bg-[#18181b]/50 border border-white/10 p-8 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-6">
                <Target className="text-orange-500" size={24} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">ATS Simulator</h3>
              <p className="text-[#a1a1aa]">Deterministic rule-based scoring guarantees your resume passes the bot filters before it reaches a human.</p>
            </div>

            {/* Feature 3 */}
            <div className="col-span-1 rounded-3xl bg-[#18181b]/50 border border-white/10 p-8 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
                <Briefcase className="text-emerald-500" size={24} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Kanban Pipeline</h3>
              <p className="text-[#a1a1aa]">Drag-and-drop your applications. Track interviews, salaries, and deadlines all in one place.</p>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-2 col-span-1 rounded-3xl bg-[#18181b]/50 border border-white/10 p-8 overflow-hidden relative group">
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 rounded-xl bg-[var(--gradient-1)]/20 flex items-center justify-center mb-6">
                  <Globe className="text-[var(--gradient-1)]" size={24} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">Instant Shareable Portfolio</h3>
                <p className="text-[#a1a1aa]">Claim your vanity URL and instantly deploy a fast, password-protected portfolio page that stays synchronized with your master profile data.</p>
              </div>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-xl bg-[#0a0a0f] p-4 hidden md:block rotate-12 group-hover:rotate-6 transition-transform">
                <div className="w-10 h-10 rounded-full bg-white/10 mb-4" />
                <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 relative border-t border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--gradient-1)]/10 to-transparent pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to upgrade your job hunt?</h2>
            <p className="text-[#a1a1aa] text-xl mb-10">Join professionals using Scribe to land their dream roles.</p>
            <Link href="/login" className="inline-flex px-8 py-4 rounded-xl text-lg font-semibold bg-white text-black hover:bg-white/90 transition-colors">
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[var(--gradient-1)] to-[var(--gradient-2)] flex items-center justify-center text-white font-display font-bold text-[10px]">
              S
            </div>
            <span className="font-display font-bold tracking-tight">Scribe.ai</span>
          </div>
          <div className="text-sm text-[#71717a]">
            &copy; {new Date().getFullYear()} Scribe.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon({ size }: { size: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}

function Wand2Icon({ size, className }: { size: number, className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
}
