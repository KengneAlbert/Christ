export class CacheService {
   private static cache: Record<string, unknown> = {};

   static get<T>(key: string): T | null {
      const value = this.cache[key];
      return (value as T) ?? null;
   }

   static set<T>(key: string, value: T): void {
      this.cache[key] = value as unknown;
   }

   static invalidate(key: string): void {
      delete this.cache[key];
   }

   // Invalider le cache pour un type de données spécifique
   static invalidateByType(type: string): void {
      const keys = Object.keys(this.cache).filter((key) => key.startsWith(type));
      keys.forEach((key) => delete this.cache[key]);
   }

   static clear(): void {
      this.cache = {};
   }
}