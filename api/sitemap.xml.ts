import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const baseUrl = process.env.VITE_SITE_URL || 'https://christ-le-bon-berger.com';
    
    // Pages statiques
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'weekly' },
      { url: 'about', priority: '0.8', changefreq: 'monthly' },
      { url: 'actions', priority: '0.8', changefreq: 'monthly' },
      { url: 'team', priority: '0.7', changefreq: 'monthly' },
      { url: 'contact', priority: '0.9', changefreq: 'monthly' },
      { url: 'mediatheque', priority: '0.9', changefreq: 'weekly' },
      { url: 'mentions-legales', priority: '0.3', changefreq: 'yearly' },
      { url: 'confidentialite', priority: '0.3', changefreq: 'yearly' },
      { url: 'cookies', priority: '0.3', changefreq: 'yearly' }
    ];

    // Récupérer les médias publiés
    const { data: mediaItems } = await supabase
      .from('media_items')
      .select('id, updated_at, type')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(1000);

    const currentDate = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Pages statiques
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Pages des médias
    mediaItems?.forEach(media => {
      const lastmod = new Date(media.updated_at).toISOString().split('T')[0];
      const priority = media.type === 'video' ? '0.8' : '0.7';
      
      sitemap += `
  <url>
    <loc>${baseUrl}/mediatheque/${media.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    return new Response('Erreur serveur lors de la génération du sitemap', { 
      status: 500 
    });
  }
}