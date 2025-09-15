import { supabase } from '../lib/supabase';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    size: number;
    type: string;
    name: string;
  };
}

export class StorageService {
  private static readonly BUCKET_NAME = 'media-files';
  private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private static readonly ALLOWED_TYPES = {
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  };

  // Vérifier si le bucket existe et le créer si nécessaire
  static async initializeBucket(): Promise<boolean> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Erreur listage buckets:', error);
        return false;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: Object.values(this.ALLOWED_TYPES).flat(),
          fileSizeLimit: this.MAX_FILE_SIZE
        });

        if (createError) {
          console.error('Erreur création bucket:', createError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erreur initialisation bucket:', error);
      return false;
    }
  }

  // Valider un fichier avant upload
  static validateFile(file: File, type: keyof typeof StorageService.ALLOWED_TYPES): { isValid: boolean; error?: string } {
    // Vérifier la taille
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Le fichier est trop volumineux. Taille maximum: ${Math.round(this.MAX_FILE_SIZE / 1024 / 1024)}MB`
      };
    }

    // Vérifier le type MIME
    const allowedTypes = this.ALLOWED_TYPES[type];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`
      };
    }

    // Vérifier l'extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = {
      video: ['mp4', 'avi', 'mov', 'wmv', 'webm'],
      audio: ['mp3', 'wav', 'ogg', 'm4a', 'aac'],
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      document: ['pdf', 'doc', 'docx', 'txt']
    };

    if (!extension || !validExtensions[type].includes(extension)) {
      return {
        isValid: false,
        error: `Extension de fichier non autorisée pour le type ${type}`
      };
    }

    return { isValid: true };
  }

  // Upload d'un fichier avec progress
  static async uploadFile(
    file: File, 
    type: keyof typeof StorageService.ALLOWED_TYPES,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Initialiser le bucket si nécessaire
      const bucketReady = await this.initializeBucket();
      if (!bucketReady) {
        return { success: false, error: 'Impossible d\'initialiser le stockage' };
      }

      // Valider le fichier
      const validation = this.validateFile(file, type);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop();
      const fileName = `${type}/${timestamp}_${randomId}.${extension}`;

      // Simuler le progress (Supabase ne fournit pas de progress natif)
      if (onProgress) {
        const progressInterval = setInterval(() => {
          const fakeProgress = Math.min(90, Math.random() * 80 + 10);
          onProgress({
            loaded: (fakeProgress / 100) * file.size,
            total: file.size,
            percentage: fakeProgress
          });
        }, 200);

        setTimeout(() => clearInterval(progressInterval), 2000);
      }

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erreur upload Supabase:', error);
        return { 
          success: false, 
          error: `Erreur d'upload: ${error.message}` 
        };
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      // Progress final
      if (onProgress) {
        onProgress({
          loaded: file.size,
          total: file.size,
          percentage: 100
        });
      }

      return {
        success: true,
        url: urlData.publicUrl,
        metadata: {
          size: file.size,
          type: file.type,
          name: file.name
        }
      };

    } catch (error: any) {
      console.error('Erreur upload:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de l\'upload' 
      };
    }
  }

  // Supprimer un fichier
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Erreur suppression fichier:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur deleteFile:', error);
      return false;
    }
  }

  // Obtenir les métadonnées d'un fichier
  static async getFileMetadata(filePath: string) {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(filePath.split('/').slice(0, -1).join('/'), {
          search: filePath.split('/').pop()
        });

      if (error || !data || data.length === 0) {
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('Erreur métadonnées fichier:', error);
      return null;
    }
  }

  // Générer une URL signée pour l'accès privé
  static async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Erreur URL signée:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Erreur getSignedUrl:', error);
      return null;
    }
  }

  // Lister les fichiers d'un dossier
  static async listFiles(folder: string = '') {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(folder, {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('Erreur listage fichiers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur listFiles:', error);
      return [];
    }
  }

  // Obtenir la taille totale utilisée
  static async getStorageUsage(): Promise<{ totalSize: number; fileCount: number }> {
    try {
      const files = await this.listFiles();
      const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
      
      return {
        totalSize,
        fileCount: files.length
      };
    } catch (error) {
      console.error('Erreur calcul usage:', error);
      return { totalSize: 0, fileCount: 0 };
    }
  }

  // Nettoyer les fichiers orphelins
  static async cleanupOrphanedFiles(): Promise<number> {
    try {
      // Obtenir tous les fichiers du storage
      const files = await this.listFiles();
      
      // Obtenir tous les file_url de la base de données
      const { data: mediaItems, error } = await supabase
        .from('media_items')
        .select('file_url');

      if (error) {
        console.error('Erreur récupération media_items:', error);
        return 0;
      }

      const usedUrls = new Set(
        mediaItems
          ?.map(item => item.file_url)
          .filter(Boolean)
          .map(url => url.split('/').pop()) // Extraire le nom de fichier
      );

      // Identifier les fichiers orphelins
      const orphanedFiles = files.filter(file => 
        file.name && !usedUrls.has(file.name)
      );

      // Supprimer les fichiers orphelins
      if (orphanedFiles.length > 0) {
        const filePaths = orphanedFiles.map(file => file.name).filter(Boolean);
        const { error: deleteError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove(filePaths);

        if (deleteError) {
          console.error('Erreur suppression fichiers orphelins:', deleteError);
          return 0;
        }
      }

      return orphanedFiles.length;
    } catch (error) {
      console.error('Erreur nettoyage fichiers orphelins:', error);
      return 0;
    }
  }
}