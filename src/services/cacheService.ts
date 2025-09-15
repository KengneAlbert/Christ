// Service de mise en cache pour optimiser les performances
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export class CacheService {
  private static readonly CACHE_PREFIX = 'clbb_cache_';
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  // Obtenir une entrée du cache
  static get<T>(key: string): T | null {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Vérifier l'expiration
      if (Date.now() > entry.expiry) {
        this.delete(key);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.warn('Erreur lecture cache:', error);
      return null;
    }
  }

  // Sauvegarder dans le cache
  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttl
      };
      
      sessionStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('Erreur sauvegarde cache:', error);
    }
  }

  // Supprimer une entrée du cache
  static delete(key: string): void {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      sessionStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Erreur suppression cache:', error);
    }
  }

  // Vider tout le cache
  static clear(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erreur vidage cache:', error);
    }
  }

  // Invalider le cache pour une clé spécifique
  static invalidate(pattern: string): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX) && key.includes(pattern)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erreur invalidation cache:', error);
    }
  }

  // Obtenir les statistiques du cache
  static getStats(): { entries: number; size: number } {
    try {
      const keys = Object.keys(sessionStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let totalSize = 0;
      cacheKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      });
      
      return {
        entries: cacheKeys.length,
        size: totalSize
      };
    } catch (error) {
      return { entries: 0, size: 0 };
    }
  }
}

// Hook React pour utiliser le cache
export const useCache = <T>(key: string, fetcher: () => Promise<T>, ttl?: number) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Vérifier le cache d'abord
        const cached = CacheService.get<T>(key);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Charger les données fraîches
        const freshData = await fetcher();
        CacheService.set(key, freshData, ttl);
        setData(freshData);
      } catch (err: any) {
        setError(err.message);
        console.error('Erreur chargement données:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key]);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      CacheService.delete(key);
      
      const freshData = await fetcher();
      CacheService.set(key, freshData, ttl);
      setData(freshData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  return { data, loading, error, refresh };
};