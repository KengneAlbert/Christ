import { supabase } from '../lib/supabase';
import { CacheService } from './cacheService';

// Service optimisé pour les requêtes Supabase
export class SupabaseOptimizedService {
  private static readonly CACHE_TTL = {
    MEDIA_ITEMS: 10 * 60 * 1000, // 10 minutes
    NEWSLETTER_SUBSCRIBERS: 5 * 60 * 1000, // 5 minutes
    NEWSLETTERS: 15 * 60 * 1000, // 15 minutes
    STATS: 2 * 60 * 1000 // 2 minutes
  };

  // Charger les médias avec cache et optimisations
  static async getMediaItems(forceRefresh = false): Promise<any[]> {
    const cacheKey = 'media_items';
    
    if (!forceRefresh) {
      const cached = CacheService.get<any[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const { data, error } = await supabase
        .from('media_items')
        .select(`
          id,
          type,
          title,
          description,
          category,
          thumbnail_url,
          file_url,
          youtube_id,
          file_name,
          file_size,
          duration,
          pages,
          created_at,
          updated_at,
          is_published,
          views_count,
          downloads_count
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50); // Limiter pour optimiser

      if (error) throw error;

      const result = data || [];
      CacheService.set(cacheKey, result, this.CACHE_TTL.MEDIA_ITEMS);
      return result;
    } catch (error) {
      console.error('Erreur chargement médias:', error);
      throw error;
    }
  }

  // Charger tous les médias pour l'admin avec cache
  static async getAllMediaItems(forceRefresh = false): Promise<any[]> {
    const cacheKey = 'admin_media_items';
    
    if (!forceRefresh) {
      const cached = CacheService.get<any[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const result = data || [];
      CacheService.set(cacheKey, result, this.CACHE_TTL.MEDIA_ITEMS);
      return result;
    } catch (error) {
      console.error('Erreur chargement médias admin:', error);
      throw error;
    }
  }

  // Charger les abonnés newsletter avec cache
  static async getNewsletterSubscribers(forceRefresh = false): Promise<any[]> {
    const cacheKey = 'newsletter_subscribers';
    
    if (!forceRefresh) {
      const cached = CacheService.get<any[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscription_date', { ascending: false });

      if (error) throw error;

      const result = data || [];
      CacheService.set(cacheKey, result, this.CACHE_TTL.NEWSLETTER_SUBSCRIBERS);
      return result;
    } catch (error) {
      console.error('Erreur chargement abonnés:', error);
      throw error;
    }
  }

  // Charger les newsletters avec cache
  static async getNewsletters(forceRefresh = false): Promise<any[]> {
    const cacheKey = 'newsletters';
    
    if (!forceRefresh) {
      const cached = CacheService.get<any[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const result = data || [];
      CacheService.set(cacheKey, result, this.CACHE_TTL.NEWSLETTERS);
      return result;
    } catch (error) {
      console.error('Erreur chargement newsletters:', error);
      throw error;
    }
  }

  // Ajouter un abonné newsletter avec invalidation cache
  static async addNewsletterSubscriber(subscriberData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert(subscriberData)
        .select()
        .single();

      if (error) throw error;

      // Invalider le cache
      CacheService.invalidate('newsletter_subscribers');
      
      return data;
    } catch (error) {
      console.error('Erreur ajout abonné:', error);
      throw error;
    }
  }

  // Ajouter un média avec invalidation cache
  static async addMediaItem(mediaData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .insert(mediaData)
        .select()
        .single();

      if (error) throw error;

      // Invalider le cache
      CacheService.invalidate('media_items');
      
      return data;
    } catch (error) {
      console.error('Erreur ajout média:', error);
      throw error;
    }
  }

  // Mettre à jour un média avec invalidation cache
  static async updateMediaItem(id: string, updates: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Invalider le cache
      CacheService.invalidate('media_items');
      
      return data;
    } catch (error) {
      console.error('Erreur mise à jour média:', error);
      throw error;
    }
  }

  // Supprimer un média avec invalidation cache
  static async deleteMediaItem(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalider le cache
      CacheService.invalidate('media_items');
    } catch (error) {
      console.error('Erreur suppression média:', error);
      throw error;
    }
  }

  // Incrémenter les vues avec optimisation
  static async incrementViews(id: string): Promise<void> {
    try {
      // Utiliser RPC pour une opération atomique optimisée
      const { error } = await supabase.rpc('increment_views', { media_id: id });
      
      if (error) {
        // Fallback si RPC n'existe pas
        const { error: updateError } = await supabase
          .from('media_items')
          .update({ 
            views_count: supabase.sql`views_count + 1`,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        
        if (updateError) throw updateError;
      }

      // Invalider le cache pour forcer le rechargement
      CacheService.invalidate('media_items');
    } catch (error) {
      console.error('Erreur incrémentation vues:', error);
      // Ne pas bloquer l'utilisateur pour cette erreur
    }
  }

  // Incrémenter les téléchargements avec optimisation
  static async incrementDownloads(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_downloads', { media_id: id });
      
      if (error) {
        // Fallback si RPC n'existe pas
        const { error: updateError } = await supabase
          .from('media_items')
          .update({ 
            downloads_count: supabase.sql`downloads_count + 1`,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        
        if (updateError) throw updateError;
      }

      CacheService.invalidate('media_items');
    } catch (error) {
      console.error('Erreur incrémentation téléchargements:', error);
    }
  }

  // Obtenir les statistiques avec cache
  static async getStats(forceRefresh = false): Promise<any> {
    const cacheKey = 'dashboard_stats';
    
    if (!forceRefresh) {
      const cached = CacheService.get<any>(cacheKey);
      if (cached) return cached;
    }

    try {
      // Requêtes parallèles pour optimiser
      const [mediaStats, subscriberStats, newsletterStats] = await Promise.all([
        supabase
          .from('media_items')
          .select('type, is_published, views_count, downloads_count'),
        supabase
          .from('newsletter_subscribers')
          .select('is_active, subscription_date'),
        supabase
          .from('newsletters')
          .select('status, sent_date, recipients_count')
      ]);

      const stats = {
        media: {
          total: mediaStats.data?.length || 0,
          published: mediaStats.data?.filter(m => m.is_published).length || 0,
          totalViews: mediaStats.data?.reduce((sum, m) => sum + (m.views_count || 0), 0) || 0,
          totalDownloads: mediaStats.data?.reduce((sum, m) => sum + (m.downloads_count || 0), 0) || 0,
          byType: {
            video: mediaStats.data?.filter(m => m.type === 'video').length || 0,
            document: mediaStats.data?.filter(m => m.type === 'document').length || 0,
            audio: mediaStats.data?.filter(m => m.type === 'audio').length || 0,
            image: mediaStats.data?.filter(m => m.type === 'image').length || 0
          }
        },
        newsletter: {
          totalSubscribers: subscriberStats.data?.length || 0,
          activeSubscribers: subscriberStats.data?.filter(s => s.is_active).length || 0,
          totalNewsletters: newsletterStats.data?.filter(n => n.status === 'sent').length || 0,
          totalRecipients: newsletterStats.data?.reduce((sum, n) => sum + (n.recipients_count || 0), 0) || 0
        }
      };

      CacheService.set(cacheKey, stats, this.CACHE_TTL.STATS);
      return stats;
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      throw error;
    }
  }

  // Précharger les données importantes
  static async preloadData(): Promise<void> {
    try {
      // Précharger en parallèle les données les plus utilisées
      await Promise.allSettled([
        this.getMediaItems(),
        this.getStats()
      ]);
    } catch (error) {
      console.warn('Erreur préchargement:', error);
    }
  }
}

export { SupabaseOptimizedService }