import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface MediaProcessingRequest {
  action: 'process' | 'thumbnail' | 'metadata' | 'optimize';
  fileUrl: string;
  mediaType: 'video' | 'audio' | 'image' | 'document';
  options?: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    format?: string;
  };
}

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

    const { action, fileUrl, mediaType, options }: MediaProcessingRequest = await req.json();

    switch (action) {
      case 'thumbnail':
        return await generateThumbnail(fileUrl, mediaType, options);
      
      case 'metadata':
        return await extractMetadata(fileUrl, mediaType);
      
      case 'optimize':
        return await optimizeMedia(fileUrl, mediaType, options);
      
      case 'process':
        return await processMedia(fileUrl, mediaType, options);
      
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
    console.error('Erreur dans media-processor:', error);
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

// Générer une miniature
async function generateThumbnail(
  fileUrl: string, 
  mediaType: string, 
  options?: { maxWidth?: number; maxHeight?: number }
): Promise<Response> {
  try {
    const maxWidth = options?.maxWidth || 400;
    const maxHeight = options?.maxHeight || 300;

    if (mediaType === 'video') {
      // Pour les vidéos, utiliser une capture d'écran
      const thumbnailData = {
        thumbnailUrl: `${fileUrl}?thumbnail=true&width=${maxWidth}&height=${maxHeight}`,
        width: maxWidth,
        height: maxHeight,
        generated: true
      };

      return new Response(
        JSON.stringify(thumbnailData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (mediaType === 'image') {
      // Pour les images, redimensionner
      const thumbnailData = {
        thumbnailUrl: `${fileUrl}?width=${maxWidth}&height=${maxHeight}&resize=cover`,
        width: maxWidth,
        height: maxHeight,
        generated: true
      };

      return new Response(
        JSON.stringify(thumbnailData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pour les autres types, utiliser des miniatures par défaut
    const defaultThumbnails = {
      audio: 'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=400',
      document: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=400'
    };

    const thumbnailData = {
      thumbnailUrl: defaultThumbnails[mediaType as keyof typeof defaultThumbnails] || defaultThumbnails.document,
      width: maxWidth,
      height: maxHeight,
      generated: false
    };

    return new Response(
      JSON.stringify(thumbnailData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur génération miniature:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur génération miniature' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Extraire les métadonnées
async function extractMetadata(fileUrl: string, mediaType: string): Promise<Response> {
  try {
    // Récupérer les informations de base du fichier
    const response = await fetch(fileUrl, { method: 'HEAD' });
    
    if (!response.ok) {
      throw new Error('Impossible d\'accéder au fichier');
    }

    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    const lastModified = response.headers.get('last-modified');

    const metadata = {
      size: contentLength ? parseInt(contentLength) : 0,
      type: contentType || 'unknown',
      lastModified: lastModified ? new Date(lastModified).toISOString() : null,
      mediaType,
      url: fileUrl
    };

    // Métadonnées spécifiques selon le type
    if (mediaType === 'video') {
      // Pour les vidéos, on pourrait utiliser ffprobe ou une API externe
      metadata.duration = 'À déterminer'; // Placeholder
      metadata.resolution = 'À déterminer';
    }

    if (mediaType === 'audio') {
      metadata.duration = 'À déterminer';
      metadata.bitrate = 'À déterminer';
    }

    if (mediaType === 'image') {
      // Pour les images, on pourrait analyser les dimensions
      metadata.dimensions = 'À déterminer';
    }

    return new Response(
      JSON.stringify(metadata),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur extraction métadonnées:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur extraction métadonnées' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Optimiser un média
async function optimizeMedia(
  fileUrl: string, 
  mediaType: string, 
  options?: { quality?: number; format?: string }
): Promise<Response> {
  try {
    // Pour l'instant, retourner l'URL originale
    // En production, on pourrait utiliser des services comme Cloudinary ou ImageKit
    const optimizedData = {
      originalUrl: fileUrl,
      optimizedUrl: fileUrl, // Même URL pour l'instant
      compressionRatio: 1,
      newSize: 0,
      format: options?.format || 'original'
    };

    return new Response(
      JSON.stringify(optimizedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur optimisation média:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur optimisation média' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Traitement général d'un média
async function processMedia(
  fileUrl: string, 
  mediaType: string, 
  options?: any
): Promise<Response> {
  try {
    // Traitement combiné : métadonnées + miniature + optimisation
    const [metadataResponse, thumbnailResponse] = await Promise.all([
      extractMetadata(fileUrl, mediaType),
      generateThumbnail(fileUrl, mediaType, options)
    ]);

    const metadata = await metadataResponse.json();
    const thumbnail = await thumbnailResponse.json();

    const processedData = {
      metadata,
      thumbnail,
      processed: true,
      processedAt: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur traitement média:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur traitement média' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}