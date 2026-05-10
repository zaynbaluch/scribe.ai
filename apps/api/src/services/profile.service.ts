import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { UpdateProfileInput } from '../schemas/profile.schema';

function safeDate(dateStr: any): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get the full profile for a user, including all nested sections.
 * Profile is now an embedded document inside User — no joins needed.
 */
export async function getFullProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.profile) {
    return null;
  }

  const profile = user.profile;
  const completeness = calculateCompleteness(profile);

  return { ...profile, completeness };
}

/**
 * Update a user's profile. Since profile is embedded in User,
 * this is a single atomic update — no transaction needed.
 */
export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser || !existingUser.profile) {
    throw new Error('Profile not found');
  }

  // Prevent emails from leaking into phone field
  if (data.phone && data.phone.includes('@')) {
    if (!data.email) data.email = data.phone;
    data.phone = undefined;
  }

  // Build the updated profile object by merging existing with new data
  const existingProfile = existingUser.profile;

  const updatedProfile: any = {
    ...existingProfile,
    // Update scalar fields if provided
    ...(data.name !== undefined && { name: data.name }),
    ...(data.email !== undefined && { email: data.email }),
    ...(data.summary !== undefined && { summary: data.summary }),
    ...(data.headline !== undefined && { headline: data.headline }),
    ...(data.location !== undefined && { location: data.location }),
    ...(data.phone !== undefined && { phone: data.phone }),
    ...(data.website !== undefined && { website: data.website }),
    ...(data.linkedin !== undefined && { linkedin: data.linkedin }),
    ...(data.github !== undefined && { github: data.github }),
    ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    ...(data.showQrCode !== undefined && { showQrCode: data.showQrCode }),
    updatedAt: new Date(),
  };

  // Replace array sections if provided (same semantics as before — full replace)
  if (data.experiences !== undefined) {
    const valid = data.experiences.filter(exp => exp.title || exp.company || exp.description);
    updatedProfile.experiences = valid.map((exp, i) => ({
      title: exp.title || null,
      company: exp.company || null,
      location: exp.location || null,
      startDate: safeDate(exp.startDate),
      endDate: safeDate(exp.endDate),
      current: exp.current || false,
      description: exp.description || null,
      bullets: exp.bullets || [],
      orderIndex: exp.orderIndex ?? i,
    }));
  }

  if (data.education !== undefined) {
    const valid = data.education.filter(edu => edu.institution || edu.degree || edu.description);
    updatedProfile.education = valid.map((edu, i) => ({
      institution: edu.institution || null,
      degree: edu.degree || null,
      field: edu.field || null,
      startDate: safeDate(edu.startDate),
      endDate: safeDate(edu.endDate),
      gpa: edu.gpa || null,
      honors: edu.honors || null,
      description: edu.description || null,
      orderIndex: edu.orderIndex ?? i,
    }));
  }

  if (data.skills !== undefined) {
    updatedProfile.skills = data.skills.map((skill, i) => ({
      name: skill.name,
      category: skill.category || null,
      proficiency: skill.proficiency || null,
      orderIndex: skill.orderIndex ?? i,
    }));
  }

  if (data.projects !== undefined) {
    const valid = data.projects.filter(proj => proj.name || proj.description);
    updatedProfile.projects = valid.map((proj, i) => ({
      name: proj.name || null,
      description: proj.description || null,
      url: proj.url || null,
      techStack: proj.techStack || [],
      bullets: proj.bullets || [],
      startDate: safeDate(proj.startDate),
      endDate: safeDate(proj.endDate),
      orderIndex: proj.orderIndex ?? i,
    }));
  }

  if (data.certifications !== undefined) {
    const valid = data.certifications.filter(cert => cert.name || cert.issuer);
    updatedProfile.certifications = valid.map((cert, i) => ({
      name: cert.name || null,
      issuer: cert.issuer || null,
      date: safeDate(cert.date),
      expiryDate: safeDate(cert.expiryDate),
      url: cert.url || null,
      orderIndex: cert.orderIndex ?? i,
    }));
  }

  if (data.publications !== undefined) {
    const valid = data.publications.filter(pub => pub.title);
    updatedProfile.publications = valid.map((pub, i) => ({
      title: pub.title || null,
      venue: pub.venue || null,
      date: safeDate(pub.date),
      url: pub.url || null,
      orderIndex: pub.orderIndex ?? i,
    }));
  }

  if (data.volunteerWork !== undefined) {
    const valid = data.volunteerWork.filter(vol => vol.role || vol.organization);
    updatedProfile.volunteerWork = valid.map((vol, i) => ({
      role: vol.role || null,
      organization: vol.organization || null,
      startDate: safeDate(vol.startDate),
      endDate: safeDate(vol.endDate),
      bullets: vol.bullets || [],
      orderIndex: vol.orderIndex ?? i,
    }));
  }

  // Single atomic update — replaces the entire embedded profile
  const updateData: any = { profile: updatedProfile };

  // Sync name/avatarUrl with User model if changed
  if (data.name !== undefined) updateData.name = data.name;
  if (data.imageUrl !== undefined) updateData.avatarUrl = data.imageUrl;

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  logger.info({ userId }, 'Profile updated');

  // Return the updated profile
  return getFullProfile(userId);
}

/**
 * Calculate profile completeness percentage.
 */
function calculateCompleteness(profile: any): number {
  let score = 0;
  const maxScore = 100;

  // Personal info (30 points)
  if (profile.summary) score += 10;
  if (profile.headline) score += 5;
  if (profile.location) score += 3;
  if (profile.phone) score += 3;
  if (profile.website || profile.linkedin || profile.github) score += 4;
  if (profile.linkedin) score += 3;
  if (profile.github) score += 2;

  // Experiences (25 points)
  if (profile.experiences?.length > 0) score += 15;
  if (profile.experiences?.length > 1) score += 10;

  // Education (15 points)
  if (profile.education?.length > 0) score += 15;

  // Skills (15 points)
  if (profile.skills?.length > 0) score += 5;
  if (profile.skills?.length >= 5) score += 5;
  if (profile.skills?.length >= 10) score += 5;

  // Projects (10 points)
  if (profile.projects?.length > 0) score += 10;

  // Extras (5 points)
  if (profile.certifications?.length > 0) score += 2;
  if (profile.publications?.length > 0) score += 2;
  if (profile.volunteerWork?.length > 0) score += 1;

  return Math.min(score, maxScore);
}
