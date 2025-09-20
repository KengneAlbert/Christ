import { supabase } from '../lib/supabase';

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



// Fonction pour envoyer l'email de bienvenue
const sendWelcomeEmail = async (subscriber: NewsletterSubscriber): Promise<boolean> => {
  try {
    const subject = 'Bienvenue dans notre communauté de soutien';
    const htmlContent = `
      <p>Bonjour ${subscriber.firstName || ''},</p>
      <p>Merci de vous être abonné(e) à notre newsletter. Vous recevrez désormais :</p>
      <ul>
        <li>Les dernières actualités de notre association</li>
        <li>Des témoignages inspirants de reconstruction</li>
        <li>Les annonces de nos événements et groupes de parole</li>
        <li>Des ressources utiles pour votre parcours</li>
      </ul>
      <p>Vous pouvez modifier vos préférences ou vous vous désabonner à tout moment.</p>
      <p>Avec tout notre soutien,<br/>L'équipe Christ Le Bon Berger</p>
    `;
    const { error } = await supabase.functions.invoke('brevo-newsletter-send', {
      body: {
        subject,
        htmlContent,
        recipients: [{ email: subscriber.email, name: subscriber.firstName || 'Abonné' }],
      }
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur envoi email de bienvenue:', error);
    return false;
  }
};

// Fonction pour envoyer une newsletter
export const sendNewsletter = async (newsletter: Newsletter, subscribers: NewsletterSubscriber[]): Promise<boolean> => {
  try {
    const filteredSubscribers = subscribers.filter(sub => sub.preferences[newsletter.category]);
    if (filteredSubscribers.length === 0) return false;

    const recipients = filteredSubscribers.map(sub => ({ email: sub.email, name: sub.firstName || 'Abonné' }));

    const { error } = await supabase.functions.invoke('brevo-newsletter-send', {
      body: {
        subject: newsletter.title,
        htmlContent: newsletter.htmlContent || `<pre>${newsletter.content}</pre>`,
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



// Fonction pour créer une nouvelle newsletter
export const createNewsletter = (
  title: string,
  content: string,
  htmlContent: string,
  category: Newsletter['category']
): Newsletter => {
  return {
    id: Date.now().toString(),
    title,
    content,
    htmlContent,
    category,
    status: 'draft',
    recipients: 0
  };
};

// Fonction pour programmer une newsletter
export const scheduleNewsletter = (newsletter: Newsletter, scheduledDate: Date): Newsletter => {
  const updatedNewsletter = {
    ...newsletter,
    scheduledDate,
    status: 'scheduled' as const
  };
  
  saveNewsletterToArchive(updatedNewsletter);
  return updatedNewsletter;
};

// Fonction pour obtenir les statistiques
export const getNewsletterStats = () => {
  const subscribers = getSubscribers();
  const activeSubscribers = getActiveSubscribers();
  const archives = getNewsletterArchives();
  
  return {
    totalSubscribers: subscribers.length,
    activeSubscribers: activeSubscribers.length,
    inactiveSubscribers: subscribers.length - activeSubscribers.length,
    totalNewslettersSent: archives.filter(n => n.status === 'sent').length,
    averageOpenRate: 0, // À implémenter avec un service de tracking
    lastNewsletterDate: archives
      .filter(n => n.sentDate)
      .sort((a, b) => new Date(b.sentDate!).getTime() - new Date(a.sentDate!).getTime())[0]?.sentDate
  };
};