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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e4e4e7]" style={{ '--p': primary, '--a': accent } as any}>
      {/* Hero */}
      <header className="border-b border-[#1a1a2e]">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-start gap-6">
            <img 
              src={profile.imageUrl || user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name} 
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 bg-[#18181b]" 
              style={{ borderColor: primary }} 
            />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
              <p className="text-lg mt-1" style={{ color: primary }}>
                {portfolio.customHeadline || profile.headline || 'Professional Portfolio'}
              </p>
              {(portfolio.customBio || profile.summary) && (
                <p className="text-sm text-[#a1a1aa] mt-3 max-w-xl leading-relaxed">
                  {portfolio.customBio || profile.summary}
                </p>
              )}
              {/* Contact links */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {profile.location && (
                  <span className="flex items-center gap-1 text-xs text-[#71717a]">
                    <MapPin size={12} /> {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs hover:underline" style={{ color: primary }}>
                    <Globe size={12} /> Website
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#71717a] hover:text-white transition-colors">
                    <Link2 size={12} /> LinkedIn
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#71717a] hover:text-white transition-colors">
                    <Code2 size={12} /> GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-14">
        {/* Experience */}
        {portfolio.showExperience && profile.experiences?.length > 0 && (
          <section>
            <SectionHeading color={primary}>Experience</SectionHeading>
            <div className="space-y-6">
              {profile.experiences.map((exp: any, i: number) => (
                <div key={i} className="relative pl-5 border-l-2" style={{ borderColor: `${primary}30` }}>
                  <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full -translate-x-[7px]" style={{ backgroundColor: primary }} />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-white">{exp.title}</h4>
                      <p className="text-sm" style={{ color: primary }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                    </div>
                    <span className="text-[10px] text-[#71717a] whitespace-nowrap font-mono">
                      {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {exp.bullets.map((b: string, j: number) => (
                        <li key={j} className="text-sm text-[#a1a1aa] pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-[#52525b]">{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {portfolio.showProjects && profile.projects?.length > 0 && (
          <section>
            <SectionHeading color={primary}>Projects</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.projects.map((proj: any, i: number) => (
                <div key={i} className="rounded-xl border border-[#27272a] bg-[#18181b] p-5 hover:border-[#3f3f46] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-white">{proj.name}</h4>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-[#71717a] hover:text-white">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  {proj.description && <p className="text-xs text-[#a1a1aa] mt-2 line-clamp-3">{proj.description}</p>}
                  {proj.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.techStack.map((t: string, j: number) => (
                        <span key={j} className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${primary}15`, color: primary }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {portfolio.showSkills && profile.skills?.length > 0 && (
          <section>
            <SectionHeading color={primary}>Skills</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: any, i: number) => (
                <span key={i} className="text-xs font-mono px-3 py-1.5 rounded-lg border border-[#27272a] bg-[#18181b] text-[#d4d4d8]">
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {portfolio.showEducation && profile.education?.length > 0 && (
          <section>
            <SectionHeading color={primary}>Education</SectionHeading>
            <div className="space-y-4">
              {profile.education.map((edu: any, i: number) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h4>
                    <p className="text-sm text-[#a1a1aa]">{edu.institution}</p>
                  </div>
                  <span className="text-[10px] text-[#71717a] whitespace-nowrap font-mono flex items-center gap-1">
                    <Calendar size={10} /> {formatDate(edu.startDate)} — {formatDate(edu.endDate) || 'Present'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Publications */}
        {portfolio.showPublications && profile.publications?.length > 0 && (
          <section>
            <SectionHeading color={primary}>Publications</SectionHeading>
            <div className="space-y-3">
              {profile.publications.map((pub: any, i: number) => (
                <div key={i}>
                  <h4 className="text-sm font-medium text-white">{pub.title}</h4>
                  {pub.venue && <p className="text-xs text-[#71717a]">{pub.venue}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Volunteer */}
        {portfolio.showVolunteer && profile.volunteerWork?.length > 0 && (
          <section>
            <SectionHeading color={primary}>Volunteer Work</SectionHeading>
            <div className="space-y-4">
              {profile.volunteerWork.map((vol: any, i: number) => (
                <div key={i}>
                  <h4 className="font-semibold text-white">{vol.role}</h4>
                  <p className="text-sm" style={{ color: primary }}>{vol.organization}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a2e] py-8 text-center">
        <p className="text-[10px] text-[#52525b]">
          Built with <a href="/" className="hover:text-[#818cf8]">Scribe.ai</a>
        </p>
      </footer>
    </div>
  );
}

function SectionHeading({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider mb-5 flex items-center gap-3" style={{ color }}>
      {children}
      <div className="flex-1 h-px" style={{ backgroundColor: `${color}20` }} />
    </h3>
  );
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return ''; }
}
