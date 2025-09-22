import { config } from 'dotenv';

// Charger les variables d'environnement avant d'importer les autres modules
config();

import { generateSitemapFile } from '../src/api/seoRoutes';

async function buildSitemap() {
  try {
    console.log('🚀 Génération du sitemap...');
    console.log('Environment variables loaded:');
    console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅' : '❌');
    console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌');
    
    await generateSitemapFile();
    console.log('✅ Sitemap généré avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la génération du sitemap:', error);
    process.exit(1);
  }
}

buildSitemap();