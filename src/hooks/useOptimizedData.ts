@@ .. @@
   const refreshData = useCallback(async () => {
     setIsRefreshing(true);
     CacheService.invalidate(cacheKey);
+    
+    // Forcer le rechargement des données
     try {
       const freshData = await fetchFunction();
       setData(freshData);
       setError(null);
     } catch (err: any) {
       setError(err.message || 'Erreur lors du rechargement');
     } finally {
       setIsRefreshing(false);
     }
   }, [cacheKey, fetchFunction]);