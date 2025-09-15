import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface AnalyticsEvent {
  mediaId: string;
  eventType: 'view' | 'download' | 'share' | 'like';
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  referrer?: string;
  timestamp?: string;
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

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'track':
        return await trackEvent(req, supabaseClient);
      
      case 'stats':
        return await getMediaStats(req, supabaseClient);
      
      case 'popular':
        return await getPopularMedia(req, supabaseClient);
      
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
    console.error('Erreur dans media-analytics:', error);
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

// Tracker un événement
async function trackEvent(req: Request, supabase: any): Promise<Response> {
  try {
    const event: AnalyticsEvent = await req.json();
    
    // Validation des données
    if (!event.mediaId || !event.eventType) {
      return new Response(
        JSON.stringify({ error: 'mediaId et eventType sont requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Mettre à jour les compteurs dans media_items
    const updateField = event.eventType === 'view' ? 'views_count' : 
                       event.eventType === 'download' ? 'downloads_count' : null;

    if (updateField) {
      const { error: updateError } = await supabase.rpc('increment_media_counter', {
        media_id: event.mediaId,
        counter_type: updateField
      });

      if (updateError) {
        console.error('Erreur mise à jour compteur:', updateError);
      }
    }

    // Enregistrer l'événement pour analytics détaillées (optionnel)
    const analyticsData = {
      media_id: event.mediaId,
      event_type: event.eventType,
      user_id: event.userId,
      session_id: event.sessionId || crypto.randomUUID(),
      user_agent: event.userAgent || req.headers.get('user-agent'),
      referrer: event.referrer || req.headers.get('referer'),
      timestamp: event.timestamp || new Date().toISOString(),
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        tracked: event.eventType,
        timestamp: analyticsData.timestamp 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur tracking événement:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur tracking événement' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Obtenir les statistiques d'un média
async function getMediaStats(req: Request, supabase: any): Promise<Response> {
  try {
    const url = new URL(req.url);
    const mediaId = url.searchParams.get('mediaId');

    if (!mediaId) {
      return new Response(
        JSON.stringify({ error: 'mediaId requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Récupérer les stats du média
    const { data: media, error } = await supabase
      .from('media_items')
      .select('id, title, views_count, downloads_count, created_at, type, category')
      .eq('id', mediaId)
      .single();

    if (error) {
      throw error;
    }

    const stats = {
      mediaId: media.id,
      title: media.title,
      type: media.type,
      category: media.category,
      views: media.views_count,
      downloads: media.downloads_count,
      createdAt: media.created_at,
      engagement: {
        viewsPerDay: Math.round(media.views_count / Math.max(1, 
          (Date.now() - new Date(media.created_at).getTime()) / (1000 * 60 * 60 * 24)
        )),
        downloadRate: media.views_count > 0 ? 
          Math.round((media.downloads_count / media.views_count) * 100) : 0
      }
    };

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur récupération stats:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur récupération statistiques' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Obtenir les médias populaires
async function getPopularMedia(req: Request, supabase: any): Promise<Response> {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const period = url.searchParams.get('period') || '30'; // jours

    // Calculer la date de début selon la période
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Récupérer les médias les plus populaires
    const { data: popularMedia, error } = await supabase
      .from('media_items')
      .select('id, title, type, category, views_count, downloads_count, thumbnail_url')
      .eq('is_published', true)
      .gte('created_at', startDate.toISOString())
      .order('views_count', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    const enrichedData = popularMedia?.map(media => ({
      ...media,
      popularity_score: media.views_count + (media.downloads_count * 2), // Pondération downloads
      engagement_rate: media.views_count > 0 ? 
        Math.round((media.downloads_count / media.views_count) * 100) : 0
    })) || [];

    return new Response(
      JSON.stringify({
        period: `${period} derniers jours`,
        total: enrichedData.length,
        media: enrichedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur médias populaires:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur récupération médias populaires' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}