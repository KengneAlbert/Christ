import { supabase } from '../lib/supabase';
import { buildNewsletterHtml } from '../emails/renderers';

// Using Brevo via Supabase Edge Function for newsletters

// Interface pour les abonnés
export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionDate: Date;
  isActive: boolean;
  preferences: {
    actualites: boolean;
    temoignages: boolean;
    evenements: boolean;
    ressources: boolean;
  };
}

// Interface pour les newsletters
export interface Newsletter {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  category: 'actualites' | 'temoignages' | 'evenements' | 'ressources';
  scheduledDate?: Date;
  sentDate?: Date;
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
}



// (Optionnel) Une fonction d'email de bienvenue pourra être ajoutée ici si nécessaire.

// Fonction pour envoyer une newsletter
type NewsletterCategory = 'actualites' | 'temoignages' | 'evenements' | 'ressources';
type NewsletterInput = {
  title: string;
  content: string;
  category: NewsletterCategory;
  htmlContent?: string;
  html_content?: string;
};

export const sendNewsletter = async (newsletter: NewsletterInput, subscribers: NewsletterSubscriber[]): Promise<boolean> => {
  try {
    const filteredSubscribers = subscribers.filter(sub => sub.preferences[newsletter.category]);
    if (filteredSubscribers.length === 0) return false;

    const recipients = filteredSubscribers.map(sub => ({ email: sub.email, name: sub.firstName || 'Abonné' }));

    // Améliorer le contenu avec un design professionnel
    const rawHtml = newsletter.htmlContent ?? newsletter.html_content ?? newsletter.content;
    const formattedContent = rawHtml.includes('<') ? rawHtml : `
      <div style="line-height:1.8; font-size:16px;">
        ${rawHtml.split('\n').map(line => 
          line.trim() ? `<p style="margin:0 0 16px 0;">${line.trim()}</p>` : '<br>'
        ).join('')}
      </div>
    `;

    // Pour l'envoi groupé, on utilise un template générique (pas d'email spécifique dans l'URL)
    const htmlContent = buildNewsletterHtml(newsletter.title, formattedContent, {
      headerTitle: 'Christ Le Bon Berger',
      brandColor: 'linear-gradient(135deg, #10b981, #14b8a6)',
      logoUrl: '',
    });

    // Minifier pour éviter les mails tronqués par certains clients (Gmail clipping)
    const minifiedHtml = htmlContent
      .replace(/\n+/g, '\n')
      .replace(/\s{2,}/g, ' ')
      .replace(/>\s+</g, '><');

    const { error } = await supabase.functions.invoke('brevo-newsletter-send', {
      body: {
        subject: newsletter.title,
  htmlContent: minifiedHtml,
        recipients,
      }
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la newsletter:', error);
    return false;
  }
};

// Les fonctions de création/programmation/statistiques seront implémentées côté base ou dans des services dédiés.