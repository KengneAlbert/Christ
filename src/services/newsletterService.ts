import emailjs from '@emailjs/browser';

// Configuration EmailJS pour les newsletters
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_NEWSLETTER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID;
const EMAILJS_WELCOME_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

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

// Stockage local des abonnés (en production, utiliser une vraie base de données)
const SUBSCRIBERS_KEY = 'newsletter_subscribers';
const NEWSLETTERS_KEY = 'newsletters_archive';

// Fonction pour s'abonner à la newsletter
export const subscribeToNewsletter = async (
  email: string, 
  firstName?: string, 
  lastName?: string,
  preferences?: Partial<NewsletterSubscriber['preferences']>
): Promise<boolean> => {
  try {
    // Vérifier si l'email existe déjà
    const subscribers = getSubscribers();
    const existingSubscriber = subscribers.find(sub => sub.email === email);
    
    if (existingSubscriber) {
      throw new Error('Cette adresse email est déjà abonnée');
    }

    // Créer un nouvel abonné
    const newSubscriber: NewsletterSubscriber = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      subscriptionDate: new Date(),
      isActive: true,
      preferences: {
        actualites: true,
        temoignages: true,
        evenements: true,
        ressources: true,
        ...preferences
      }
    };

    // Ajouter à la liste
    subscribers.push(newSubscriber);
    localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers));

    // Envoyer email de bienvenue
    await sendWelcomeEmail(newSubscriber);

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'abonnement:', error);
    return false;
  }
};

// Fonction pour se désabonner
export const unsubscribeFromNewsletter = (email: string): boolean => {
  try {
    const subscribers = getSubscribers();
    const updatedSubscribers = subscribers.map(sub => 
      sub.email === email ? { ...sub, isActive: false } : sub
    );
    localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(updatedSubscribers));
    return true;
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    return false;
  }
};

// Fonction pour obtenir tous les abonnés
export const getSubscribers = (): NewsletterSubscriber[] => {
  try {
    const stored = localStorage.getItem(SUBSCRIBERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnés:', error);
    return [];
  }
};

// Fonction pour obtenir les abonnés actifs
export const getActiveSubscribers = (): NewsletterSubscriber[] => {
  return getSubscribers().filter(sub => sub.isActive);
};

// Fonction pour envoyer l'email de bienvenue
const sendWelcomeEmail = async (subscriber: NewsletterSubscriber): Promise<boolean> => {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const templateParams = {
      to_email: subscriber.email,
      to_name: subscriber.firstName || 'Cher(e) abonné(e)',
      from_name: 'Christ Le Bon Berger',
      subject: 'Bienvenue dans notre communauté de soutien',
      message: `
Bonjour ${subscriber.firstName || ''},

Merci de vous être abonné(e) à notre newsletter. Vous recevrez désormais :

• Les dernières actualités de notre association
• Des témoignages inspirants de reconstruction
• Les annonces de nos événements et groupes de parole
• Des ressources utiles pour votre parcours

Vous pouvez modifier vos préférences ou vous désabonner à tout moment.

Avec tout notre soutien,
L'équipe Christ Le Bon Berger
      `
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_WELCOME_TEMPLATE_ID,
      templateParams
    );

    return true;
  } catch (error) {
    console.error('Erreur envoi email de bienvenue:', error);
    return false;
  }
};

// Fonction pour envoyer une newsletter
export const sendNewsletter = async (newsletter: Newsletter): Promise<boolean> => {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    
    const activeSubscribers = getActiveSubscribers();
    const filteredSubscribers = activeSubscribers.filter(sub => 
      sub.preferences[newsletter.category]
    );

    let successCount = 0;

    // Envoyer à tous les abonnés concernés
    for (const subscriber of filteredSubscribers) {
      try {
        const templateParams = {
          to_email: subscriber.email,
          to_name: subscriber.firstName || 'Cher(e) abonné(e)',
          from_name: 'Christ Le Bon Berger',
          subject: newsletter.title,
          message: newsletter.content,
          html_content: newsletter.htmlContent,
          unsubscribe_link: `${window.location.origin}/unsubscribe?email=${subscriber.email}`
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_NEWSLETTER_TEMPLATE_ID,
          templateParams
        );

        successCount++;
      } catch (error) {
        console.error(`Erreur envoi à ${subscriber.email}:`, error);
      }
    }

    // Mettre à jour le statut de la newsletter
    const updatedNewsletter = {
      ...newsletter,
      status: 'sent' as const,
      sentDate: new Date(),
      recipients: successCount
    };

    saveNewsletterToArchive(updatedNewsletter);

    return successCount > 0;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la newsletter:', error);
    return false;
  }
};

// Fonction pour sauvegarder une newsletter dans les archives
const saveNewsletterToArchive = (newsletter: Newsletter): void => {
  try {
    const archives = getNewsletterArchives();
    const existingIndex = archives.findIndex(n => n.id === newsletter.id);
    
    if (existingIndex >= 0) {
      archives[existingIndex] = newsletter;
    } else {
      archives.push(newsletter);
    }
    
    localStorage.setItem(NEWSLETTERS_KEY, JSON.stringify(archives));
  } catch (error) {
    console.error('Erreur sauvegarde newsletter:', error);
  }
};

// Fonction pour obtenir les archives des newsletters
export const getNewsletterArchives = (): Newsletter[] => {
  try {
    const stored = localStorage.getItem(NEWSLETTERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur récupération archives:', error);
    return [];
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