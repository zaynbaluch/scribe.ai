import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://scribe.ai';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/p/*'],
      disallow: ['/dashboard', '/settings', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
