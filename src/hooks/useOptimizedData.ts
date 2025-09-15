import { useState, useEffect, useCallback } from 'react';
import { SupabaseOptimizedService } from '../services/supabaseOptimized';
import { CacheService } from '../services/cacheService';

interface UseOptimizedDataOptions {
  cacheKey: string;
  fetcher: () => Promise<any>;
  dependencies?: any[];
  ttl?: number;
  enablePolling?: boolean;
  pollingInterval?: number;
}

export const useOptimizedData = <T>({
  cacheKey,
  fetcher,
  dependencies = [],
  ttl,
  enablePolling = false,
  pollingInterval = 30000 // 30 secondes
}: UseOptimizedDataOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      
      // Vérifier le cache d'abord si pas de refresh forcé
      if (!forceRefresh) {
        const cached = CacheService.get<T>(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          setLastUpdated(new Date());
          return cached;
        }
      }

      setLoading(true);
      
      // Charger les données fraîches
      const freshData = await fetcher();
      
      // Sauvegarder en cache
      CacheService.set(cacheKey, freshData, ttl);
      
      setData(freshData);
      setLastUpdated(new Date());
      
      return freshData;
    } catch (err: any) {
      console.error(`Erreur chargement ${cacheKey}:`, err);
      setError(err.message);
      
      // En cas d'erreur, essayer de récupérer du cache même expiré
      const cached = CacheService.get<T>(cacheKey);
      if (cached) {
        setData(cached);
        setError('Données du cache (connexion limitée)');
      }
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetcher, ttl]);

  const refresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  // Chargement initial
  useEffect(() => {
    loadData();
  }, [loadData, ...dependencies]);

  // Polling optionnel
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      // Rafraîchir seulement si la page est visible
      if (!document.hidden) {
        loadData(true);
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval, loadData]);

  // Rafraîchir quand la page redevient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && data) {
        // Vérifier si les données sont anciennes
        const cached = CacheService.get<T>(cacheKey);
        if (!cached) {
          loadData(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [cacheKey, data, loadData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdated,
    isFromCache: !!CacheService.get<T>(cacheKey)
  };
};

// Hook spécialisé pour les médias
export const useMediaItems = (adminMode = false) => {
  return useOptimizedData({
    cacheKey: adminMode ? 'admin_media_items' : 'media_items',
    fetcher: () => adminMode 
      ? SupabaseOptimizedService.getAllMediaItems(true)
      : SupabaseOptimizedService.getMediaItems(true),
    ttl: SupabaseOptimizedService['CACHE_TTL'].MEDIA_ITEMS
  });
};

// Hook spécialisé pour les abonnés newsletter
export const useNewsletterSubscribers = () => {
  return useOptimizedData({
    cacheKey: 'newsletter_subscribers',
    fetcher: () => SupabaseOptimizedService.getNewsletterSubscribers(true),
    ttl: SupabaseOptimizedService['CACHE_TTL'].NEWSLETTER_SUBSCRIBERS
  });
};

// Hook spécialisé pour les newsletters
export const useNewsletters = () => {
  return useOptimizedData({
    cacheKey: 'newsletters',
    fetcher: () => SupabaseOptimizedService.getNewsletters(true),
    ttl: SupabaseOptimizedService['CACHE_TTL'].NEWSLETTERS
  });
};

// Hook spécialisé pour les statistiques
export const useStats = () => {
  return useOptimizedData({
    cacheKey: 'dashboard_stats',
    fetcher: () => SupabaseOptimizedService.getStats(true),
    ttl: SupabaseOptimizedService['CACHE_TTL'].STATS,
    enablePolling: true,
    pollingInterval: 60000 // 1 minute
  });
};