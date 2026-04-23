'use client';

import { useEffect, useState, use } from 'react';
import { Lock, Code2, Globe, Mail, MapPin, Phone, ExternalLink, Calendar, Link2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PortfolioData {
  user: { name: string; avatarUrl: string | null };
  portfolio: {
    templateId: string; primaryColor: string; accentColor: string;
    showExperience: boolean; showProjects: boolean; showEducation: boolean;
    showSkills: boolean; showPublications: boolean; showVolunteer: boolean;
    customHeadline: string | null; customBio: string | null;
    hasPassword: boolean;
  };
  profile: {
    imageUrl: string | null;
    summary: string | null; headline: string | null; location: string | null;
    phone: string | null; website: string | null; linkedin: string | null; github: string | null;
    experiences: any[]; education: any[]; skills: any[];
    projects: any[]; certifications: any[]; publications: any[]; volunteerWork: any[];
  };
}

export default function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPortfolio = async (pw?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (pw) headers['x-portfolio-password'] = pw;
      const res = await fetch(`${API_URL}/p/${slug}`, { headers });
      const json = await res.json();

      if (res.status === 401 && json.data?.requiresPassword) {
        setRequiresPassword(true);
        setIsLoading(false);
        return;
      }
      if (!res.ok) throw new Error(json.error?.message || 'Portfolio not found');
      setData(json.data);
      setRequiresPassword(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPortfolio(); }, [slug]);

  // Password gate
  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-[#27272a] bg-[#18181b] p-8 text-center">
          <Lock size={32} className="text-[#818cf8] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-1">Protected Portfolio</h2>
          <p className="text-sm text-[#a1a1aa] mb-5">Enter the password to view this portfolio.</p>
          <form onSubmit={(e) => { e.preventDefault(); fetchPortfolio(password); }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" autoFocus
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0f] border border-[#27272a] text-white text-sm mb-3 focus:outline-none focus:border-[#818cf8]" />
            <button type="submit"
              className="w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white hover:opacity-90 transition-opacity">
              View Portfolio
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#818cf8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Portfolio Not Found</h2>
          <p className="text-sm text-[#a1a1aa]">{error || 'This portfolio doesn\'t exist or is private.'}</p>
        </div>
      </div>
    );
  }

  const { user, portfolio, profile } = data;
  const primary = portfolio.primaryColor;
  const accent = portfolio.accentColor;

  const profileImage = profile.imageUrl || user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=6366f1,818cf8,4f46e5`;

  const props = { user, portfolio, profile, primary, accent, profileImage };

  if (portfolio.templateId === 'classic') return <ClassicTemplate {...props} />;
  if (portfolio.templateId === 'minimal') return <MinimalTemplate {...props} />;
  return <ModernTemplate {...props} />;
}

// ─── Modern Template ────────────────────────────────────────────────────────

function ModernTemplate({ user, portfolio, profile, primary, accent, profileImage }: any) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e4e4e7]" style={{ '--p': primary, '--a': accent } as any}>
      <header className="border-b border-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] to-transparent opacity-30" />
        <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
            <img src={profileImage} alt={user.name}
              className="w-24 h-24 rounded-3xl object-cover border-4 bg-[#18181b] shadow-2xl transition-transform hover:scale-105" 
              style={{ borderColor: `${primary}40` }} />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white tracking-tight">{user.name}</h1>
              <p className="text-xl mt-2 font-medium" style={{ color: primary }}>
                {portfolio.customHeadline || profile.headline || 'Professional Portfolio'}
              </p>
              {(portfolio.customBio || profile.summary) && (
                <p className="text-sm text-[#a1a1aa] mt-4 max-w-2xl leading-relaxed mx-auto md:mx-0">
                  {portfolio.customBio || profile.summary}
                </p>
              )}
              <div className="flex items-center justify-center md:justify-start gap-4 mt-6 flex-wrap">
                {profile.location && <span className="flex items-center gap-1.5 text-xs text-[#71717a]"><MapPin size={14} /> {profile.location}</span>}
                {profile.website && <a href={profile.website} target="_blank" className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity" style={{ color: primary }}><Globe size={14} /> Website</a>}
                {profile.linkedin && <a href={profile.linkedin} target="_blank" className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-white transition-colors"><Link2 size={14} /> LinkedIn</a>}
                {profile.github && <a href={profile.github} target="_blank" className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-white transition-colors"><Code2 size={14} /> GitHub</a>}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-20">
        {portfolio.showExperience && profile.experiences?.length > 0 && (
          <section>
            <SectionHeading color={primary}>Experience</SectionHeading>
            <div className="space-y-8">
              {profile.experiences.map((exp: any, i: number) => (
                <div key={i} className="group relative pl-6 border-l-2" style={{ borderColor: `${primary}20` }}>
                  <div className="absolute left-0 top-1 w-3 h-3 rounded-full -translate-x-[7.5px] border-2 border-[#0a0a0f] transition-colors group-hover:scale-125" style={{ backgroundColor: primary }} />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-[var(--p)] transition-colors">{exp.title}</h4>
                      <p className="text-sm font-medium" style={{ color: primary }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                    </div>
                    <span className="text-xs text-[#52525b] font-mono bg-[#18181b] px-2 py-1 rounded border border-[#27272a]">
                      {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="space-y-2">
                      {exp.bullets.map((b: string, j: number) => (
                        <li key={j} className="text-sm text-[#a1a1aa] leading-relaxed flex gap-3">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: `${primary}40` }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {portfolio.showProjects && profile.projects?.length > 0 && (
          <section>
            <SectionHeading color={primary}>Featured Projects</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.projects.map((proj: any, i: number) => (
                <div key={i} className="group rounded-2xl border border-[#27272a] bg-[#111116] p-6 hover:border-[#3f3f46] hover:bg-[#18181b] transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-bold text-lg text-white group-hover:text-[var(--p)] transition-colors">{proj.name}</h4>
                    {proj.url && <a href={proj.url} target="_blank" className="text-[#52525b] hover:text-white transition-colors"><ExternalLink size={18} /></a>}
                  </div>
                  {proj.description && <p className="text-sm text-[#a1a1aa] mt-3 leading-relaxed">{proj.description}</p>}
                  {proj.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">
                      {proj.techStack.map((t: string, j: number) => (
                        <span key={j} className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-[#18181b] border border-[#27272a]" style={{ color: primary }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Other sections similarly styled... */}
        <PortfolioSections portfolio={portfolio} profile={profile} primary={primary} />
      </main>

      <footer className="border-t border-[#1a1a2e] py-12 text-center mt-20">
        <p className="text-[10px] text-[#52525b] uppercase tracking-widest">
          Crafted with <a href="/" className="hover:text-white transition-colors">Scribe.ai</a>
        </p>
      </footer>
    </div>
  );
}

// ─── Classic Template ───────────────────────────────────────────────────────

function ClassicTemplate({ user, portfolio, profile, primary, accent, profileImage }: any) {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#18181b] font-serif" style={{ '--p': primary, '--a': accent } as any}>
      <header className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center border-b border-[#e4e4e7]">
        <img src={profileImage} alt={user.name}
          className="w-24 h-24 rounded-full mx-auto mb-6 object-cover grayscale hover:grayscale-0 transition-all border-2 border-[#e4e4e7] p-1" />
        <h1 className="text-4xl font-medium tracking-tight mb-2 italic">{user.name}</h1>
        <p className="text-lg text-[#71717a] font-sans uppercase tracking-[0.2em] text-xs">
          {portfolio.customHeadline || profile.headline}
        </p>
        <div className="flex justify-center gap-6 mt-8 font-sans text-xs text-[#71717a] uppercase tracking-widest">
          {profile.website && <a href={profile.website} target="_blank" className="hover:text-black">Portfolio</a>}
          {profile.linkedin && <a href={profile.linkedin} target="_blank" className="hover:text-black">LinkedIn</a>}
          {profile.github && <a href={profile.github} target="_blank" className="hover:text-black">GitHub</a>}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-16">
        {portfolio.showExperience && profile.experiences?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#a1a1aa] mb-10 text-center">Experience</h2>
            <div className="space-y-12">
              {profile.experiences.map((exp: any, i: number) => (
                <div key={i} className="text-center">
                  <div className="flex flex-col items-center gap-1 mb-4">
                    <h4 className="text-xl font-medium">{exp.title}</h4>
                    <p className="text-[#71717a] font-sans text-sm">{exp.company} · {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</p>
                  </div>
                  {exp.bullets?.length > 0 && (
                    <div className="max-w-xl mx-auto text-sm text-[#52525b] leading-loose font-sans">
                      {exp.bullets.map((b: string, j: number) => <p key={j} className="mb-2">“{b}”</p>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {portfolio.showProjects && profile.projects?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#a1a1aa] mb-10 text-center">Projects</h2>
            <div className="grid grid-cols-1 gap-12">
              {profile.projects.map((proj: any, i: number) => (
                <div key={i} className="text-center group">
                  <h4 className="text-2xl font-medium mb-3 italic group-hover:text-[var(--p)] transition-colors">{proj.name}</h4>
                  <p className="text-[#52525b] font-sans text-sm max-w-lg mx-auto mb-4">{proj.description}</p>
                  {proj.techStack?.length > 0 && (
                    <p className="text-[10px] font-sans uppercase tracking-widest text-[#a1a1aa]">
                      Built with {proj.techStack.join(' · ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        
        <PortfolioSections portfolio={portfolio} profile={profile} primary={primary} isClassic />
      </main>

      <footer className="py-16 text-center border-t border-[#e4e4e7] font-sans opacity-40">
        <p className="text-[10px] uppercase tracking-[0.2em]">© {new Date().getFullYear()} · Scribe.ai</p>
      </footer>
    </div>
  );
}

// ─── Minimal Template ───────────────────────────────────────────────────────

function MinimalTemplate({ user, portfolio, profile, primary, accent, profileImage }: any) {
  return (
    <div className="min-h-screen bg-white text-[#111] font-sans antialiased" style={{ '--p': primary } as any}>
      <main className="max-w-2xl mx-auto px-8 py-24 space-y-24">
        <header>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{user.name}</h1>
          <p className="text-lg text-[#666] leading-relaxed max-w-lg">
            {portfolio.customHeadline || profile.headline}. {portfolio.customBio || profile.summary}
          </p>
          <div className="flex gap-4 mt-8">
            <a href={`mailto:${user.email}`} className="text-sm font-medium hover:underline">Email</a>
            {profile.linkedin && <a href={profile.linkedin} target="_blank" className="text-sm font-medium hover:underline">LinkedIn</a>}
            {profile.github && <a href={profile.github} target="_blank" className="text-sm font-medium hover:underline">GitHub</a>}
          </div>
        </header>

        {portfolio.showExperience && profile.experiences?.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-xs font-bold uppercase tracking-tighter text-[#999]">Work</h2>
            <div className="space-y-12">
              {profile.experiences.map((exp: any, i: number) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-baseline">
                  <div>
                    <h4 className="font-semibold text-lg">{exp.title}</h4>
                    <p className="text-[#666]">{exp.company}</p>
                    {exp.bullets?.length > 0 && (
                      <p className="text-sm text-[#888] mt-2 leading-relaxed">{exp.bullets[0]}</p>
                    )}
                  </div>
                  <span className="text-xs text-[#999] tabular-nums">
                    {new Date(exp.startDate).getFullYear()}—{exp.current ? 'Now' : new Date(exp.endDate).getFullYear()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {portfolio.showProjects && profile.projects?.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-xs font-bold uppercase tracking-tighter text-[#999]">Projects</h2>
            <div className="space-y-8">
              {profile.projects.map((proj: any, i: number) => (
                <div key={i} className="group">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg group-hover:underline">{proj.name}</h4>
                    <div className="h-px flex-1 bg-[#eee] group-hover:bg-[var(--p)] group-hover:opacity-20 transition-all" />
                  </div>
                  <p className="text-[#888] mt-2 text-sm max-w-lg leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-12 border-t border-[#eee] text-[10px] text-[#aaa] flex justify-between uppercase font-bold tracking-widest">
          <span>{user.name}</span>
          <a href="/" className="hover:text-[#111]">Scribe.ai</a>
        </footer>
      </main>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function PortfolioSections({ portfolio, profile, primary, isClassic }: any) {
  return (
    <>
      {portfolio.showSkills && profile.skills?.length > 0 && (
        <section className={isClassic ? "text-center" : ""}>
          <SectionHeading color={primary} isClassic={isClassic}>Skills</SectionHeading>
          <div className={`flex flex-wrap gap-2 ${isClassic ? "justify-center" : ""}`}>
            {profile.skills.map((skill: any, i: number) => (
              <span key={i} className={`text-xs px-3 py-1.5 rounded-lg border border-[#27272a] ${isClassic ? "bg-white border-[#e4e4e7]" : "bg-[#18181b] border-[#27272a] text-[#d4d4d8]"}`}>
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {portfolio.showEducation && profile.education?.length > 0 && (
        <section className={isClassic ? "text-center" : ""}>
          <SectionHeading color={primary} isClassic={isClassic}>Education</SectionHeading>
          <div className="space-y-6">
            {profile.education.map((edu: any, i: number) => (
              <div key={i} className={`flex flex-col ${isClassic ? "items-center" : "sm:flex-row sm:items-center justify-between"} gap-2`}>
                <div>
                  <h4 className="font-bold text-lg">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h4>
                  <p className="text-sm opacity-60">{edu.institution}</p>
                </div>
                <span className="text-[10px] opacity-40 font-mono">
                  {formatDate(edu.startDate)} — {formatDate(edu.endDate) || 'Present'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SectionHeading({ children, color, isClassic }: { children: React.ReactNode; color: string; isClassic?: boolean }) {
  if (isClassic) return <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#a1a1aa] mb-10">{children}</h3>;
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider mb-8 flex items-center gap-4" style={{ color }}>
      <span className="shrink-0">{children}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-current to-transparent opacity-20" />
    </h3>
  );
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return ''; }
}

