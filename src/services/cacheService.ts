@@ .. @@
   // Invalider le cache pour un type de données spécifique
   static invalidateByType(type: string): void {
     const keys = Object.keys(this.cache).filter(key => key.startsWith(type));
     keys.forEach(key => delete this.cache[key]);
+    
+    // Nettoyer aussi le localStorage si nécessaire
+    if (typeof window !== 'undefined') {
+      Object.keys(localStorage).forEach(key => {
+        if (key.startsWith(`cache_${type}`)) {
+          localStorage.removeItem(key);
+        }
+      });
+    }
   }