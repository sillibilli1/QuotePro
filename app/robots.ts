import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/api/', '/hq-admin/', '/app/', '/auth/'],
            },
        ],
        sitemap: 'https://www.quoteproapp.com/sitemap.xml',
    };
}
