import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'cleanup-orphaned':
        return await cleanupOrphanedFiles(supabaseClient);
      
      case 'optimize-storage':
        return await optimizeStorage(supabaseClient);
      
      case 'storage-stats':
        return await getStorageStats(supabaseClient);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Action non supportée' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Erreur dans storage-cleanup:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Nettoyer les fichiers orphelins
async function cleanupOrphanedFiles(supabase: any): Promise<Response> {
  try {
    // Lister tous les fichiers dans le bucket
    const { data: files, error: listError } = await supabase.storage
      .from('media-files')
      .list('', { limit: 1000 });

    if (listError) {
      throw listError;
    }

    // Récupérer tous les file_url de la base de données
    const { data: mediaItems, error: dbError } = await supabase
      .from('media_items')
      .select('file_url');

    if (dbError) {
      throw dbError;
    }

    // Extraire les noms de fichiers utilisés
    const usedFiles = new Set(
      mediaItems
        ?.map((item: any) => item.file_url)
        .filter(Boolean)
        .map((url: string) => {
          const parts = url.split('/');
          return parts[parts.length - 1]; // Nom du fichier
        })
    );

    // Identifier les fichiers orphelins
    const orphanedFiles = files?.filter(file => 
      file.name && !usedFiles.has(file.name)
    ) || [];

    let deletedCount = 0;
    const errors: string[] = [];

    // Supprimer les fichiers orphelins par batch
    if (orphanedFiles.length > 0) {
      const batchSize = 10;
      for (let i = 0; i < orphanedFiles.length; i += batchSize) {
        const batch = orphanedFiles.slice(i, i + batchSize);
        const filePaths = batch.map(file => file.name).filter(Boolean);

        const { error: deleteError } = await supabase.storage
          .from('media-files')
          .remove(filePaths);

        if (deleteError) {
          errors.push(`Erreur suppression batch ${i}: ${deleteError.message}`);
        } else {
          deletedCount += filePaths.length;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        orphanedFound: orphanedFiles.length,
        deletedCount,
        errors: errors.length > 0 ? errors : undefined,
        cleanupDate: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur nettoyage fichiers orphelins:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur nettoyage fichiers orphelins' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Optimiser le stockage
async function optimizeStorage(supabase: any): Promise<Response> {
  try {
    // 1. Nettoyer les fichiers orphelins
    const cleanupResponse = await cleanupOrphanedFiles(supabase);
    const cleanupResult = await cleanupResponse.json();

    // 2. Analyser l'utilisation du stockage
    const { data: storageUsage, error: usageError } = await supabase.storage
      .from('media-files')
      .list('', { limit: 1000 });

    if (usageError) {
      throw usageError;
    }

    const totalSize = storageUsage?.reduce((sum: number, file: any) => 
      sum + (file.metadata?.size || 0), 0
    ) || 0;

    // 3. Identifier les gros fichiers
    const largeFiles = storageUsage?.filter((file: any) => 
      (file.metadata?.size || 0) > 50 * 1024 * 1024 // > 50MB
    ) || [];

    const optimizationResult = {
      cleanup: cleanupResult,
      storage: {
        totalFiles: storageUsage?.length || 0,
        totalSize,
        totalSizeMB: Math.round(totalSize / 1024 / 1024),
        largeFiles: largeFiles.length,
        largeFilesDetails: largeFiles.map((file: any) => ({
          name: file.name,
          sizeMB: Math.round((file.metadata?.size || 0) / 1024 / 1024)
        }))
      },
      recommendations: [
        totalSize > 500 * 1024 * 1024 ? 'Considérer la compression des médias' : null,
        largeFiles.length > 5 ? 'Optimiser les fichiers volumineux' : null,
        cleanupResult.orphanedFound > 0 ? 'Nettoyage des fichiers orphelins effectué' : null
      ].filter(Boolean),
      optimizedAt: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(optimizationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur optimisation stockage:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur optimisation stockage' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Obtenir les statistiques de stockage
async function getStorageStats(supabase: any): Promise<Response> {
  try {
    // Stats des médias par type
    const { data: mediaStats, error: statsError } = await supabase
      .from('media_items')
      .select('type, file_size, views_count, downloads_count')
      .eq('is_published', true);

    if (statsError) {
      throw statsError;
    }

    // Calculer les statistiques
    const statsByType = mediaStats?.reduce((acc: any, item: any) => {
      const type = item.type;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          totalSize: 0,
          totalViews: 0,
          totalDownloads: 0
        };
      }
      
      acc[type].count++;
      acc[type].totalSize += item.file_size || 0;
      acc[type].totalViews += item.views_count || 0;
      acc[type].totalDownloads += item.downloads_count || 0;
      
      return acc;
    }, {}) || {};

    // Stats globales
    const totalStats = {
      totalMedias: mediaStats?.length || 0,
      totalSize: Object.values(statsByType).reduce((sum: number, type: any) => sum + type.totalSize, 0),
      totalViews: Object.values(statsByType).reduce((sum: number, type: any) => sum + type.totalViews, 0),
      totalDownloads: Object.values(statsByType).reduce((sum: number, type: any) => sum + type.totalDownloads, 0)
    };

    return new Response(
      JSON.stringify({
        global: {
          ...totalStats,
          totalSizeMB: Math.round(totalStats.totalSize / 1024 / 1024),
          averageViews: Math.round(totalStats.totalViews / Math.max(1, totalStats.totalMedias)),
          downloadRate: totalStats.totalViews > 0 ? 
            Math.round((totalStats.totalDownloads / totalStats.totalViews) * 100) : 0
        },
        byType: Object.entries(statsByType).map(([type, stats]: [string, any]) => ({
          type,
          count: stats.count,
          totalSizeMB: Math.round(stats.totalSize / 1024 / 1024),
          totalViews: stats.totalViews,
          totalDownloads: stats.totalDownloads,
          averageViews: Math.round(stats.totalViews / Math.max(1, stats.count)),
          downloadRate: stats.totalViews > 0 ? 
            Math.round((stats.totalDownloads / stats.totalViews) * 100) : 0
        })),
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur stats stockage:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur récupération statistiques stockage' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}