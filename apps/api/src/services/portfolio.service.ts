import prisma from '../lib/prisma';
import logger from '../lib/logger';
import bcrypt from 'bcryptjs';

/**
 * Get or create portfolio config for a user.
 */
export async function getPortfolioConfig(userId: string) {
  let portfolio = await prisma.portfolio.findUnique({ where: { userId } });
  if (!portfolio) {
    portfolio = await prisma.portfolio.create({
      data: { userId },
    });
    logger.info({ userId }, 'Portfolio config created');
  }
  // Never expose passwordHash
  const { passwordHash, ...safe } = portfolio;
  return { ...safe, hasPassword: !!passwordHash };
}

/**
 * Update portfolio config.
 */
export async function updatePortfolioConfig(userId: string, data: any) {
  // Ensure portfolio exists
  let portfolio = await prisma.portfolio.findUnique({ where: { userId } });
  if (!portfolio) {
    portfolio = await prisma.portfolio.create({ data: { userId } });
  }

  const updateData: any = {};

  if (data.templateId !== undefined) updateData.templateId = data.templateId;
  if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor;
  if (data.accentColor !== undefined) updateData.accentColor = data.accentColor;
  if (data.showExperience !== undefined) updateData.showExperience = data.showExperience;
  if (data.showProjects !== undefined) updateData.showProjects = data.showProjects;
  if (data.showEducation !== undefined) updateData.showEducation = data.showEducation;
  if (data.showSkills !== undefined) updateData.showSkills = data.showSkills;
  if (data.showPublications !== undefined) updateData.showPublications = data.showPublications;
  if (data.showVolunteer !== undefined) updateData.showVolunteer = data.showVolunteer;
  if (data.customHeadline !== undefined) updateData.customHeadline = data.customHeadline;
  if (data.customBio !== undefined) updateData.customBio = data.customBio;
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

  // Password handling
  if (data.password === '') {
    // Remove password
    updateData.passwordHash = null;
  } else if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  const updated = await prisma.portfolio.update({
    where: { userId },
    data: updateData,
  });

  const { passwordHash, ...safe } = updated;
  logger.info({ userId }, 'Portfolio config updated');
  return { ...safe, hasPassword: !!passwordHash };
}

/**
 * Update vanity slug for a user.
 */
export async function updateSlug(userId: string, slug: string) {
  // Validate slug format
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/.test(slug)) {
    throw new Error('Slug must be 3-40 characters, lowercase alphanumeric and hyphens only');
  }

  // Check uniqueness
  const existing = await prisma.user.findFirst({ where: { vanitySlug: slug, NOT: { id: userId } } });
  if (existing) throw new Error('This URL is already taken');

  await prisma.user.update({ where: { id: userId }, data: { vanitySlug: slug } });
  logger.info({ userId, slug }, 'Vanity slug updated');
  return slug;
}

/**
 * Get public portfolio data by slug.
 */
export async function getPublicPortfolio(slug: string) {
  const user = await prisma.user.findFirst({
    where: { vanitySlug: slug },
    include: {
      portfolio: true,
    },
  });

  if (!user) throw new Error('Portfolio not found');
  if (!user.portfolio) throw new Error('Portfolio not configured');
  if (!user.portfolio.isPublic) throw new Error('This portfolio is private');

  // Increment view count
  await prisma.portfolio.update({
    where: { userId: user.id },
    data: { totalViews: { increment: 1 }, lastViewedAt: new Date() },
  });

  const { passwordHash, ...safePortfolio } = user.portfolio;

  return {
    user: { 
      name: user.profile?.name || user.name, 
      avatarUrl: user.profile?.imageUrl || user.avatarUrl 
    },
    portfolio: { ...safePortfolio, hasPassword: !!passwordHash },
    profile: user.profile,
  };
}

/**
 * Verify portfolio password.
 */
export async function verifyPortfolioPassword(slug: string, password: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { vanitySlug: slug },
    include: { portfolio: true },
  });

  if (!user?.portfolio?.passwordHash) return true; // No password = always valid
  return bcrypt.compare(password, user.portfolio.passwordHash);
}
