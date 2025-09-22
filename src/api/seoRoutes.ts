// Générateur de sitemap pour build statique
import { config } from 'dotenv';
import { nodeSeoService } from '../services/seoService-node';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Charger les variables d'environnement
config();

/**
 * Génère le sitemap XML et l'écrit dans le dossier public
 * À utiliser pendant le build
 */
export async function generateSitemapFile() {
  try {
    const sitemap = await nodeSeoService.generateSitemap();
    const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
    
    writeFileSync(sitemapPath, sitemap, 'utf-8');
    console.log('✅ Sitemap généré avec succès:', sitemapPath);
    
    return sitemap;
  } catch (error) {
    console.error('❌ Erreur génération sitemap:', error);
    throw error;
  }
}

/**
 * Génère le sitemap pour Vercel Edge Functions
 */
export async function handleSitemapRequest() {
  try {
    const sitemap = await nodeSeoService.generateSitemap();
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    return new Response('Erreur serveur', { status: 500 });
  }
}