import { useState, useEffect, useCallback } from 'react';
import { StorageService, UploadResult, UploadProgress } from '../services/storageService';
import { supabase } from '../lib/supabase';

interface UseStorageOptimizedOptions {
  autoCleanup?: boolean;
  maxRetries?: number;
}

export const useStorageOptimized = (options: UseStorageOptimizedOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [storageStats, setStorageStats] = useState<{ totalSize: number; fileCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger les stats de stockage
  const loadStorageStats = useCallback(async () => {
    try {
      const stats = await StorageService.getStorageUsage();
      setStorageStats(stats);
    } catch (err: unknown) {
      console.error('Erreur chargement stats stockage:', err);
      const msg = err instanceof Error ? err.message : 'Erreur chargement stats stockage';
      setError(msg);
    }
  }, []);

  // Upload optimisé avec retry
  const uploadFile = useCallback(async (
    file: File, 
    type: 'video' | 'audio' | 'image' | 'document'
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

    const maxRetries = options.maxRetries || 3;
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await StorageService.uploadFile(file, type, (progress) => {
          setUploadProgress(progress);
        });

        if (result.success) {
          setIsUploading(false);
          
          // Auto-cleanup si activé
          if (options.autoCleanup) {
            setTimeout(() => {
              StorageService.cleanupOrphanedFiles().catch(console.error);
            }, 5000);
          }

          // Recharger les stats
          loadStorageStats();
          
          return result;
        } else {
          lastError = result.error;
          if (attempt < maxRetries) {
            // Attendre avant retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : 'Erreur inconnue';
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    setIsUploading(false);
    setError(lastError || 'Erreur upload après plusieurs tentatives');
    
    return { 
      success: false, 
      error: lastError || 'Erreur upload après plusieurs tentatives' 
    };
  }, [options.autoCleanup, options.maxRetries, loadStorageStats]);

  // Supprimer un fichier
  const deleteFile = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      const success = await StorageService.deleteFile(filePath);
      if (success) {
        loadStorageStats(); // Recharger les stats
      }
      return success;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur suppression fichier';
      setError(msg);
      return false;
    }
  }, [loadStorageStats]);

  // Nettoyer les fichiers orphelins
  const cleanupOrphaned = useCallback(async (): Promise<number> => {
    try {
      const deletedCount = await StorageService.cleanupOrphanedFiles();
      loadStorageStats(); // Recharger les stats
      return deletedCount;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur nettoyage fichiers orphelins';
      setError(msg);
      return 0;
    }
  }, [loadStorageStats]);

  // Charger les stats au montage
  useEffect(() => {
    loadStorageStats();
  }, [loadStorageStats]);

  return {
    // État
    isUploading,
    uploadProgress,
    storageStats,
    error,
    
    // Actions
    uploadFile,
    deleteFile,
    cleanupOrphaned,
    loadStorageStats,
    
    // Utilitaires
    clearError: () => setError(null)
  };
};

// Hook spécialisé pour les médias
export const useMediaUpload = () => {
  const storage = useStorageOptimized({ autoCleanup: true, maxRetries: 3 });

  const uploadMedia = useCallback(async (
    file: File,
    mediaData: {
      type: 'video' | 'audio' | 'image' | 'document';
      title: string;
      description: string;
      category: string;
      duration?: string;
      pages?: number;
    }
  ) => {
    try {
      // Upload du fichier
      const uploadResult = await storage.uploadFile(file, mediaData.type);
      
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error };
      }

      // Traitement du média via Edge Function
      try {
        const processingResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/media-processor`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'process',
            fileUrl: uploadResult.url,
            mediaType: mediaData.type,
            options: {
              quality: 80,
              maxWidth: 1920,
              maxHeight: 1080
            }
          })
        });

        const processingResult = await processingResponse.json();
        
        // Créer l'entrée en base de données
        const { data: newMedia, error: dbError } = await supabase
          .from('media_items')
          .insert({
            type: mediaData.type,
            title: mediaData.title,
            description: mediaData.description,
            category: mediaData.category,
            file_url: uploadResult.url,
            file_name: file.name,
            file_size: uploadResult.metadata?.size || file.size,
            duration: mediaData.duration || null,
            pages: mediaData.pages || null,
            thumbnail_url: processingResult.thumbnail?.thumbnailUrl || null,
            is_published: true,
            views_count: 0,
            downloads_count: 0,
            created_by: 'admin-user'
          })
          .select()
          .single();

        if (dbError) {
          // Si erreur DB, supprimer le fichier uploadé
          await storage.deleteFile(uploadResult.url!.split('/').pop()!);
          throw dbError;
        }

        return { 
          success: true, 
          media: newMedia,
          processing: processingResult 
        };

      } catch (processingError) {
        console.warn('Erreur traitement média, création sans traitement:', processingError);
        
        // Fallback: créer sans traitement
        const { data: newMedia, error: dbError } = await supabase
          .from('media_items')
          .insert({
            type: mediaData.type,
            title: mediaData.title,
            description: mediaData.description,
            category: mediaData.category,
            file_url: uploadResult.url,
            file_name: file.name,
            file_size: uploadResult.metadata?.size || file.size,
            duration: mediaData.duration || null,
            pages: mediaData.pages || null,
            is_published: true,
            views_count: 0,
            downloads_count: 0,
            created_by: 'admin-user'
          })
          .select()
          .single();

        if (dbError) {
          await storage.deleteFile(uploadResult.url!.split('/').pop()!);
          throw dbError;
        }

        return { success: true, media: newMedia };
      }

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur lors de la création du média';
      return { 
        success: false, 
        error: msg 
      };
    }
  }, [storage]);

  return {
    ...storage,
    uploadMedia
  };
};