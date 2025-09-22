// Version Node.js du service SEO pour les scripts de build
import { config } from 'dotenv';
import { supabase } from '../lib/supabase-node';

// Charger les variables d'environnement
config();

class NodeSeoService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.VITE_SITE_URL || 'https://christlebonberger.com';
  }

  /**
   * Génère le sitemap XML complet
   */
  async generateSitemap(): Promise<string> {
    try {
      const basePages = [
        { url: '/', priority: '1.0', changefreq: 'monthly' },
        { url: '/about', priority: '0.8', changefreq: 'monthly' },
        { url: '/team', priority: '0.8', changefreq: 'monthly' },
        { url: '/actions', priority: '0.9', changefreq: 'weekly' },
        { url: '/mediateque', priority: '0.9', changefreq: 'weekly' },
        { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      ];

      // Récupérer les médias depuis Supabase
      const { data: mediaItems } = await supabase
        .from('media_items')
        .select('id, title, type, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      // Pages statiques
      basePages.forEach(page => {
        sitemap += `
  <url>
    <loc>${this.baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
  </url>`;
      });

      // Pages de médias dynamiques
      if (mediaItems) {
        mediaItems.forEach(media => {
          const slug = this.generateSlug(media.title);
          const typePrefix = this.getTypePrefix(media.type);
          sitemap += `
  <url>
    <loc>${this.baseUrl}/media/${typePrefix}-${slug}-${media.id}</loc>
    <lastmod>${new Date(media.created_at).toISOString().split('T')[0]}</lastmod>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>`;
        });
      }

      sitemap += `
</urlset>`;

      return sitemap;
    } catch (error) {
      console.error('Erreur génération sitemap:', error);
      throw error;
    }
  }

  /**
   * Génère un slug à partir du titre
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces et tirets
      .trim()
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/-+/g, '-') // Évite les tirets multiples
      .slice(0, 60); // Limite la longueur
  }

  /**
   * Retourne le préfixe selon le type de média
   */
  private getTypePrefix(type: string): string {
    const prefixes = {
      video: 'video',
      audio: 'audio',
      document: 'document',
      image: 'image'
    };
    return prefixes[type as keyof typeof prefixes] || 'media';
  }
}

export const nodeSeoService = new NodeSeoService();