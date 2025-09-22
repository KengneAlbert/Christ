/**
 * Générateur d'URLs SEO-friendly pour l'application
 */

class UrlGenerator {
  private baseUrl = import.meta.env.VITE_SITE_URL || 'https://christ-le-bon-berger.com';

  /**
   * Génère un slug SEO-friendly à partir d'un titre
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces et tirets
      .trim()
      .replace(/\s+/g, '-') // Remplace espaces par tirets
      .replace(/-+/g, '-') // Supprime tirets multiples
      .slice(0, 60); // Limite à 60 caractères
  }

  /**
   * Génère une URL SEO-friendly pour un média
   */
  generateMediaUrl(media: {
    id: string;
    title: string;
    type: string;
    category: string;
  }): string {
    const slug = this.generateSlug(media.title);
    const typePrefix = this.getTypePrefix(media.type);
    
    // Format: /media/video-titre-du-media-id-123
    return `/media/${typePrefix}-${slug}-${media.id}`;
  }

  /**
   * Génère une URL canonique complète pour un média
   */
  generateCanonicalMediaUrl(media: {
    id: string;
    title: string;
    type: string;
    category: string;
  }): string {
    const relativePath = this.generateMediaUrl(media);
    return `${this.baseUrl}${relativePath}`;
  }

  /**
   * Extrait l'ID d'un slug de média
   */
  extractIdFromSlug(slug: string): string | null {
    const match = slug.match(/-([a-f0-9-]{36})$/);
    return match ? match[1] : null;
  }

  /**
   * Vérifie si un slug correspond à un média donné
   */
  validateMediaSlug(slug: string, media: {
    id: string;
    title: string;
    type: string;
    category: string;
  }): boolean {
    const expectedSlug = this.generateMediaUrl(media).replace('/media/', '');
    return slug === expectedSlug;
  }

  /**
   * Génère le préfixe de type pour les URLs
   */
  private getTypePrefix(type: string): string {
    const prefixes = {
      video: 'video',
      audio: 'audio', 
      document: 'document',
      image: 'image'
    };
    return prefixes[type as keyof typeof prefixes] || 'media';
  }

  /**
   * Génère une URL de partage social optimisée
   */
  generateShareUrl(media: {
    id: string;
    title: string;
    type: string;
    description: string;
    category?: string;
  }, platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp'): string {
    const mediaUrl = this.generateCanonicalMediaUrl({
      id: media.id,
      title: media.title,
      type: media.type,
      category: media.category || 'general'
    });
    const encodedUrl = encodeURIComponent(mediaUrl);
    const encodedTitle = encodeURIComponent(media.title);

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=ChristLeBonBerger,Aide,Soutien`;
      
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      
      case 'whatsapp':
        return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
      
      default:
        return mediaUrl;
    }
  }

  /**
   * Génère des URLs breadcrumb pour la navigation
   */
  generateBreadcrumb(media: {
    id: string;
    title: string;
    type: string;
    category: string;
  }): Array<{ name: string; url: string }> {
    return [
      { name: 'Accueil', url: '/' },
      { name: 'Médiathèque', url: '/mediatheque' },
      { 
        name: this.capitalizeFirstLetter(media.type + 's'), 
        url: `/mediatheque?type=${media.type}` 
      },
      { 
        name: media.category, 
        url: `/mediatheque?category=${encodeURIComponent(media.category)}` 
      },
      { 
        name: media.title, 
        url: this.generateMediaUrl(media) 
      }
    ];
  }

  /**
   * Capitalise la première lettre d'une chaîne
   */
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * Génère une URL de recherche avec filtres
   */
  generateSearchUrl(filters: {
    query?: string;
    type?: string;
    category?: string;
    page?: number;
  }): string {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.type) params.set('type', filters.type);
    if (filters.category) params.set('category', filters.category);
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());

    const queryString = params.toString();
    return `/mediatheque${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Génère des URLs alternatives pour différentes langues (future extension)
   */
  generateAlternateUrls(media: {
    id: string;
    title: string;
    type: string;
    category?: string;
  }): Record<string, string> {
    const baseUrl = this.generateMediaUrl({
      id: media.id,
      title: media.title,
      type: media.type,
      category: media.category || 'general'
    });
    
    // Pour l'instant, seulement français
    return {
      'fr': `${this.baseUrl}${baseUrl}`,
      // 'en': `${this.baseUrl}/en${baseUrl}`, // Future
      // 'es': `${this.baseUrl}/es${baseUrl}`, // Future
    };
  }
}

export const urlGenerator = new UrlGenerator();