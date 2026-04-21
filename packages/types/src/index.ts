// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string; details?: any[] } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// ─── Auth Types ─────────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse extends TokenPair {
  user: User;
}

// ─── User ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  oauthProvider: string;
  plan: string;
  vanitySlug?: string | null;
  createdAt: string;
}

// ─── Profile ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  userId: string;
  summary?: string | null;
  headline?: string | null;
  location?: string | null;
  phone?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  publications: Publication[];
  volunteerWork: VolunteerWork[];
  completeness: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Profile Sections ───────────────────────────────────────────────────────

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  description?: string | null;
  bullets: string[];
  orderIndex: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string | null;
  startDate: string;
  endDate?: string | null;
  gpa?: string | null;
  honors?: string | null;
  description?: string | null;
  orderIndex: number;
}

export interface Skill {
  id: string;
  name: string;
  category?: string | null;
  proficiency?: string | null;
  orderIndex: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  url?: string | null;
  techStack: string[];
  bullets: string[];
  startDate?: string | null;
  endDate?: string | null;
  orderIndex: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string | null;
  expiryDate?: string | null;
  url?: string | null;
  orderIndex: number;
}

export interface Publication {
  id: string;
  title: string;
  venue?: string | null;
  date?: string | null;
  url?: string | null;
  orderIndex: number;
}

export interface VolunteerWork {
  id: string;
  role: string;
  organization: string;
  startDate?: string | null;
  endDate?: string | null;
  bullets: string[];
  orderIndex: number;
}
