import { supabase } from '../lib/supabase';

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, unknown>;
}

export interface MediaSEO {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
  views_count: number;
  file_url?: string;
  thumbnail_url?: string;
  duration?: string;
  pages?: number;
}

class SEOService {
  private baseUrl = import.meta.env.VITE_SITE_URL || 'https://christ-le-bon-berger.com';
  
  // Meta descriptions par défaut pour chaque page
  private defaultMeta = {
    home: {
      title: 'Christ Le Bon Berger - Association de Lutte contre les Violences Conjugales',
      description: 'Association dédiée à la lutte contre les violences conjugales. Soutien, écoute et accompagnement aux victimes. Aide d\'urgence 24h/24.',
      keywords: ['violences conjugales', 'aide victimes', 'association', 'soutien psychologique', 'urgence', 'écoute', 'accompagnement'],
    },
    about: {
      title: 'À Propos - Christ Le Bon Berger',
      description: 'Découvrez notre mission, nos valeurs et notre équipe dévouée à la lutte contre les violences conjugales et l\'accompagnement des victimes.',
      keywords: ['mission', 'valeurs', 'équipe', 'histoire', 'engagement social'],
    },
    actions: {
      title: 'Nos Actions - Christ Le Bon Berger',
      description: 'Découvrez nos actions concrètes : soutien psychologique, accompagnement juridique, hébergement d\'urgence et prévention.',
      keywords: ['actions', 'soutien psychologique', 'accompagnement juridique', 'hébergement urgence', 'prévention'],
    },
    mediatheque: {
      title: 'Médiathèque - Ressources et Documents - Christ Le Bon Berger',
      description: 'Accédez à notre médiathèque : vidéos éducatives, documents informatifs, témoignages audio et ressources pour les victimes.',
      keywords: ['médiathèque', 'ressources', 'vidéos', 'documents', 'témoignages', 'éducation'],
    },
    contact: {
      title: 'Contact - Christ Le Bon Berger',
      description: 'Contactez-nous pour obtenir de l\'aide ou des informations. Ligne d\'urgence 24h/24. Confidentialité garantie.',
      keywords: ['contact', 'aide', 'urgence', 'confidentialité', 'hotline'],
    },
    team: {
      title: 'Notre Équipe - Christ Le Bon Berger',
      description: 'Rencontrez notre équipe de professionnels dévoués : psychologues, juristes, travailleurs sociaux et bénévoles.',
      keywords: ['équipe', 'professionnels', 'psychologues', 'juristes', 'bénévoles'],
    }
  };

  /**
   * Génère les meta tags SEO pour une page
   */
  generatePageSEO(pageKey: keyof typeof this.defaultMeta, customData?: Partial<SEOData>): SEOData {
    const defaults = this.defaultMeta[pageKey];
    const baseData = {
      title: defaults.title,
      description: defaults.description,
      keywords: defaults.keywords,
      ogTitle: defaults.title,
      ogDescription: defaults.description,
      ogType: 'website',
      canonicalUrl: `${this.baseUrl}/${pageKey === 'home' ? '' : pageKey}`,
      ...customData
    };

    // Schema.org pour l'organisation
    const organizationSchema = this.generateOrganizationSchema();
    
    return {
      ...baseData,
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [organizationSchema]
      }
    };
  }

  /**
   * Génère les meta tags SEO pour un média spécifique
   */
  generateMediaSEO(media: MediaSEO): SEOData {
    const mediaTypeMap = {
      video: 'Vidéo',
      audio: 'Audio',
      document: 'Document',
      image: 'Image'
    };

    const title = `${media.title} - ${mediaTypeMap[media.type as keyof typeof mediaTypeMap]} | Christ Le Bon Berger`;
    const description = this.truncateText(media.description, 155) || 
      `Découvrez ${mediaTypeMap[media.type as keyof typeof mediaTypeMap].toLowerCase()} "${media.title}" dans notre médiathèque. Ressource éducative sur ${media.category}.`;

    const keywords = [
      media.category.toLowerCase(),
      media.type,
      'ressource éducative',
      'violences conjugales',
      'aide victimes',
      'prévention'
    ];

    // Schema.org pour le média
    const mediaSchema = this.generateMediaSchema(media);
    const organizationSchema = this.generateOrganizationSchema();

    return {
      title,
      description,
      keywords,
      ogTitle: media.title,
      ogDescription: description,
      ogImage: media.thumbnail_url || `${this.baseUrl}/assets/LogoChrist.png`,
      ogType: media.type === 'video' ? 'video.other' : 'article',
      canonicalUrl: `${this.baseUrl}/mediatheque/${media.id}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [organizationSchema, mediaSchema]
      }
    };
  }

  /**
   * Génère le Schema.org pour l'organisation
   */
  private generateOrganizationSchema() {
    return {
      '@type': 'NGO',
      '@id': `${this.baseUrl}/#organization`,
      name: 'Christ Le Bon Berger',
      alternateName: 'CLBB Association',
      description: 'Association dédiée à la lutte contre les violences conjugales, offrant soutien, écoute et accompagnement aux victimes.',
      url: this.baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${this.baseUrl}/assets/LogoChrist.png`,
        width: 400,
        height: 400
      },
      sameAs: [
        'https://www.facebook.com/permalink.php?story_fbid=pfbid025go4Kiaq1MYgqX8omSdCtNBcgy54NgdjefomAkfP4bpfGXdS4uJwh5AVRD8MjorWl&id=61573609049917',
        'https://www.linkedin.com/company/christ-le-bon-berger',
        'https://www.instagram.com/clbb.association/?igsh=bWx5dnBzazBqdWdu#',
        'https://www.youtube.com/@clbb-association-l-amour-gagne'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+33781324474',
        email: 'pokasuzy99@gmail.com',
        contactType: 'customer service',
        availableLanguage: 'French'
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: '29 rue du docteur Fleming',
        addressLocality: 'Aulnay-sous-bois',
        addressCountry: 'FR'
      },
      foundingDate: '2024',
      knowsAbout: [
        'Violence domestique',
        'Soutien psychologique',
        'Accompagnement juridique',
        'Prévention',
        'Aide aux victimes'
      ]
    };
  }

  /**
   * Génère le Schema.org pour un média
   */
  private generateMediaSchema(media: MediaSEO) {
    const baseSchema = {
      '@id': `${this.baseUrl}/mediatheque/${media.id}`,
      name: media.title,
      description: media.description,
      dateCreated: media.created_at,
      dateModified: media.updated_at,
      author: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}/#organization`
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}/#organization`
      },
      url: `${this.baseUrl}/mediatheque/${media.id}`,
      thumbnailUrl: media.thumbnail_url,
      keywords: [media.category, media.type, 'éducation', 'prévention'],
      inLanguage: 'fr-FR',
      isAccessibleForFree: true,
      usageInfo: 'Ressource éducative gratuite'
    };

    switch (media.type) {
      case 'video':
        return {
          '@type': 'VideoObject',
          ...baseSchema,
          duration: media.duration ? `PT${media.duration}` : undefined,
          contentUrl: media.file_url,
          embedUrl: media.file_url?.includes('youtube') ? media.file_url : undefined,
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/WatchAction',
            userInteractionCount: media.views_count
          }
        };

      case 'audio':
        return {
          '@type': 'AudioObject',
          ...baseSchema,
          duration: media.duration ? `PT${media.duration}` : undefined,
          contentUrl: media.file_url,
          encodingFormat: 'audio/mpeg'
        };

      case 'document':
        return {
          '@type': 'DigitalDocument',
          ...baseSchema,
          fileFormat: 'application/pdf',
          numberOfPages: media.pages,
          contentUrl: media.file_url
        };

      case 'image':
        return {
          '@type': 'ImageObject',
          ...baseSchema,
          contentUrl: media.file_url,
          width: 800,
          height: 600
        };

      default:
        return {
          '@type': 'CreativeWork',
          ...baseSchema
        };
    }
  }

  /**
   * Génère le Schema.org pour un événement
   */
  generateEventSchema(event: {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    location?: string;
    isOnline?: boolean;
  }) {
    return {
      '@type': 'Event',
      '@id': `${this.baseUrl}/events/${event.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      eventAttendanceMode: event.isOnline 
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: event.location ? {
        '@type': 'Place',
        name: event.location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Aulnay-sous-bois',
          addressCountry: 'FR'
        }
      } : {
        '@type': 'VirtualLocation',
        url: this.baseUrl
      },
      organizer: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}/#organization`
      },
      isAccessibleForFree: true
    };
  }

  /**
   * Génère un sitemap XML dynamique
   */
  async generateSitemap(): Promise<string> {
    try {
      // Pages statiques
      const staticPages = [
        { url: '', priority: '1.0', changefreq: 'weekly' },
        { url: 'about', priority: '0.8', changefreq: 'monthly' },
        { url: 'actions', priority: '0.8', changefreq: 'monthly' },
        { url: 'team', priority: '0.7', changefreq: 'monthly' },
        { url: 'contact', priority: '0.9', changefreq: 'monthly' },
        { url: 'mediatheque', priority: '0.9', changefreq: 'weekly' },
        { url: 'mentions-legales', priority: '0.3', changefreq: 'yearly' },
        { url: 'confidentialite', priority: '0.3', changefreq: 'yearly' },
        { url: 'cookies', priority: '0.3', changefreq: 'yearly' }
      ];

      // Récupérer les médias publiés
      const { data: mediaItems } = await supabase
        .from('media_items')
        .select('id, updated_at, type, category')
        .eq('is_published', true)
        .order('updated_at', { ascending: false });

      const currentDate = new Date().toISOString().split('T')[0];

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      // Pages statiques
      staticPages.forEach(page => {
        sitemap += `
  <url>
    <loc>${this.baseUrl}/${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      });

      // Pages des médias
      mediaItems?.forEach(media => {
        const lastmod = new Date(media.updated_at).toISOString().split('T')[0];
        const priority = media.type === 'video' ? '0.8' : '0.7';
        
        sitemap += `
  <url>
    <loc>${this.baseUrl}/mediatheque/${media.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
      });

      sitemap += `
</urlset>`;

      return sitemap;
    } catch (error) {
      console.error('Erreur génération sitemap:', error);
      return this.generateBasicSitemap();
    }
  }

  /**
   * Génère un sitemap basique en cas d'erreur
   */
  private generateBasicSitemap(): string {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${this.baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${this.baseUrl}/mediatheque</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${this.baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
  }

  /**
   * Génère des URLs SEO-friendly (slugs)
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
   * Tronque le texte à une longueur donnée
   */
  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }

  /**
   * Valide et nettoie les données SEO
   */
  validateSEOData(data: Partial<SEOData>): SEOData {
    return {
      title: this.truncateText(data.title || 'Christ Le Bon Berger', 60),
      description: this.truncateText(data.description || '', 155),
      keywords: data.keywords?.slice(0, 10) || [],
      ogTitle: this.truncateText(data.ogTitle || data.title || '', 40),
      ogDescription: this.truncateText(data.ogDescription || data.description || '', 200),
      ogImage: data.ogImage || `${this.baseUrl}/assets/LogoChrist.png`,
      ogType: data.ogType || 'website',
      canonicalUrl: data.canonicalUrl || this.baseUrl,
      structuredData: data.structuredData
    };
  }
}

export const seoService = new SEOService();