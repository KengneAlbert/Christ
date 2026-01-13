import { useState, useEffect, useCallback } from 'react';
import { CacheService } from '../services/cacheService';

export function useOptimizedData<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const cached = CacheService.get<{ value: T; ts: number }>(`cache_${cacheKey}`);
      const now = Date.now();
      if (cached && now - cached.ts < ttlMs) {
        setData(cached.value);
        setIsRefreshing(false);
        return;
      }
      const fresh = await fetchFunction();
      setData(fresh);
      CacheService.set(`cache_${cacheKey}`, { value: fresh, ts: now });
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(msg);
    } finally {
      setIsRefreshing(false);
    }
  }, [cacheKey, fetchFunction, ttlMs]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    CacheService.invalidate(`cache_${cacheKey}`);
    try {
      const fresh = await fetchFunction();
      setData(fresh);
      CacheService.set(`cache_${cacheKey}`, { value: fresh, ts: Date.now() });
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du rechargement';
      setError(msg);
    } finally {
      setIsRefreshing(false);
    }
  }, [cacheKey, fetchFunction]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, isRefreshing, refreshData };
}