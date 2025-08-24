import emailjs from '@emailjs/browser';

// Configuration EmailJS
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Interface pour les données du formulaire
export interface ContactFormData {
  firstName: string;
  lastName?: string;
  email: string;
  subject: string;
  message: string;
}

// Fonction pour envoyer un email
export const sendContactEmail = async (formData: ContactFormData): Promise<boolean> => {
  try {
    // Initialisation d'EmailJS avec la clé publique
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Préparation des données pour le template
    const templateParams = {
      from_name: `${formData.firstName} ${formData.lastName || ''}`.trim(),
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      to_name: 'Christ Le Bon Berger',
      reply_to: formData.email,
    };

    // Envoi de l'email
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email envoyé avec succès:', response.status, response.text);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

// Fonction pour envoyer un email d'urgence
export const sendUrgencyEmail = async (message: string, contactInfo?: string): Promise<boolean> => {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const templateParams = {
      from_name: 'Demande d\'urgence',
      from_email: contactInfo || 'urgence@christlebonberger.fr',
      subject: '🚨 DEMANDE D\'URGENCE - Action immédiate requise',
      message: `DEMANDE D'URGENCE:\n\n${message}\n\nContact: ${contactInfo || 'Non fourni'}\n\nHeure: ${new Date().toLocaleString('fr-FR')}`,
      to_name: 'Équipe d\'urgence - Christ Le Bon Berger',
      reply_to: contactInfo || 'urgence@christlebonberger.fr',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_urgency', // Template spécial pour les urgences
      templateParams
    );

    console.log('Email d\'urgence envoyé:', response.status);
    return true;
  } catch (error) {
    console.error('Erreur envoi email d\'urgence:', error);
    return false;
  }
};