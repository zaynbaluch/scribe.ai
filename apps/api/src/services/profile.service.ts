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
 */
export async function getFullProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          experiences: { orderBy: { orderIndex: 'asc' } },
          education: { orderBy: { orderIndex: 'asc' } },
          skills: { orderBy: { orderIndex: 'asc' } },
          projects: { orderBy: { orderIndex: 'asc' } },
          certifications: { orderBy: { orderIndex: 'asc' } },
          publications: { orderBy: { orderIndex: 'asc' } },
          volunteerWork: { orderBy: { orderIndex: 'asc' } },
        },
      },
    },
  });

  if (!user || !user.profile) {
    return null;
  }

  const profile = user.profile;
  const completeness = calculateCompleteness(profile);

  return { ...profile, completeness };
}

/**
 * Update a user's profile. Uses a transaction to replace array-type sections.
 * Each section (experiences, education, etc.) is fully replaced on update.
 */
export async function updateProfile(userId: string, data: UpdateProfileInput) {
  // Find existing profile
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!existingProfile) {
    throw new Error('Profile not found');
  }

  const profileId = existingProfile.id;

  // Prevent emails from leaking into phone field
  if (data.phone && data.phone.includes('@')) {
    if (!data.email) data.email = data.phone;
    data.phone = undefined;
  }

  return prisma.$transaction(async (tx: any) => {
    // Update scalar fields
    await tx.profile.update({
      where: { id: profileId },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        email: data.email !== undefined ? data.email : undefined,
        summary: data.summary !== undefined ? data.summary : undefined,
        headline: data.headline !== undefined ? data.headline : undefined,
        location: data.location !== undefined ? data.location : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        website: data.website !== undefined ? data.website : undefined,
        linkedin: data.linkedin !== undefined ? data.linkedin : undefined,
        github: data.github !== undefined ? data.github : undefined,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
        showQrCode: data.showQrCode !== undefined ? data.showQrCode : undefined,
      },
    });

    // Sync with User model if name or imageUrl changed
    if (data.name !== undefined || data.imageUrl !== undefined) {
      await tx.user.update({
        where: { id: userId },
        data: {
          name: data.name !== undefined ? data.name : undefined,
          avatarUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
        }
      });
    }

    // Replace experiences
    if (data.experiences !== undefined) {
      await tx.experience.deleteMany({ where: { profileId } });
      if (data.experiences.length > 0) {
        await tx.experience.createMany({
          data: data.experiences.map((exp, i) => ({
            profileId,
            title: exp.title,
            company: exp.company,
            location: exp.location || null,
            startDate: safeDate(exp.startDate),
            endDate: safeDate(exp.endDate),
            current: exp.current || false,
            description: exp.description || null,
            bullets: exp.bullets || [],
            orderIndex: exp.orderIndex ?? i,
          })),
        });
      }
    }

    // Replace education
    if (data.education !== undefined) {
      await tx.education.deleteMany({ where: { profileId } });
      if (data.education.length > 0) {
        await tx.education.createMany({
          data: data.education.map((edu, i) => ({
            profileId,
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field || null,
            startDate: safeDate(edu.startDate),
            endDate: safeDate(edu.endDate),
            gpa: edu.gpa || null,
            honors: edu.honors || null,
            description: edu.description || null,
            orderIndex: edu.orderIndex ?? i,
          })),
        });
      }
    }

    // Replace skills
    if (data.skills !== undefined) {
      await tx.skill.deleteMany({ where: { profileId } });
      if (data.skills.length > 0) {
        await tx.skill.createMany({
          data: data.skills.map((skill, i) => ({
            profileId,
            name: skill.name,
            category: skill.category || null,
            proficiency: skill.proficiency || null,
            orderIndex: skill.orderIndex ?? i,
          })),
        });
      }
    }

    // Replace projects
    if (data.projects !== undefined) {
      await tx.project.deleteMany({ where: { profileId } });
      if (data.projects.length > 0) {
        await tx.project.createMany({
          data: data.projects.map((proj, i) => ({
            profileId,
            name: proj.name,
            description: proj.description || null,
            url: proj.url || null,
            techStack: proj.techStack || [],
            bullets: proj.bullets || [],
            startDate: safeDate(proj.startDate),
            endDate: safeDate(proj.endDate),
            orderIndex: proj.orderIndex ?? i,
          })),
        });
      }
    }

    // Replace certifications
    if (data.certifications !== undefined) {
      await tx.certification.deleteMany({ where: { profileId } });
      if (data.certifications.length > 0) {
        await tx.certification.createMany({
          data: data.certifications.map((cert, i) => ({
            profileId,
            name: cert.name,
            issuer: cert.issuer,
            date: safeDate(cert.date),
            expiryDate: safeDate(cert.expiryDate),
            url: cert.url || null,
            orderIndex: cert.orderIndex ?? i,
          })),
        });
      }
    }

    // Replace publications
    if (data.publications !== undefined) {
      await tx.publication.deleteMany({ where: { profileId } });
      if (data.publications.length > 0) {
        await tx.publication.createMany({
          data: data.publications.map((pub, i) => ({
            profileId,
            title: pub.title,
            venue: pub.venue || null,
            date: pub.date ? new Date(pub.date) : null,
            url: pub.url || null,
            orderIndex: pub.orderIndex ?? i,
          })),
        });
      }
    }

    // Replace volunteer work
    if (data.volunteerWork !== undefined) {
      await tx.volunteerWork.deleteMany({ where: { profileId } });
      if (data.volunteerWork.length > 0) {
        await tx.volunteerWork.createMany({
          data: data.volunteerWork.map((vol, i) => ({
            profileId,
            role: vol.role,
            organization: vol.organization,
            startDate: vol.startDate ? new Date(vol.startDate) : null,
            endDate: vol.endDate ? new Date(vol.endDate) : null,
            bullets: vol.bullets || [],
            orderIndex: vol.orderIndex ?? i,
          })),
        });
      }
    }

    logger.info({ userId, profileId }, 'Profile updated');

    // Return the updated profile
    return getFullProfile(userId);
  });
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
