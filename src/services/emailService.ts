import { CSRFService } from './csrfService';
import { ValidationService } from './validationService';
import { supabase } from '../lib/supabase';

// Switching to Brevo via Supabase Edge Function

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
    // Validation des données avant envoi
    const validationResult = ValidationService.validateContactForm({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    });

    if (!validationResult.isValid) {
      console.error('Données invalides:', validationResult.errors);
      return false;
    }

    // Nettoyer les données
    const sanitizedData = {
      firstName: ValidationService.sanitizeString(formData.firstName, 50),
      lastName: formData.lastName ? ValidationService.sanitizeString(formData.lastName, 50) : '',
      email: ValidationService.sanitizeString(formData.email, 254),
      subject: ValidationService.sanitizeString(formData.subject, 200),
      message: ValidationService.sanitizeString(formData.message, 5000)
    };

    const { data, error } = await supabase.functions.invoke('brevo-contact-send', {
      body: {
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        csrf_token: CSRFService.getToken(),
      }
    });
    if (error) {
      console.error('Erreur Brevo:', error);
      return false;
    }
    console.log('Brevo contact envoyé:', data);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

// Fonction pour envoyer un email d'urgence
export const sendUrgencyEmail = async (message: string, contactInfo?: string): Promise<boolean> => {
  try {
    // Validation et nettoyage du message d'urgence
    const sanitizedMessage = ValidationService.sanitizeString(message, 2000);
    const sanitizedContact = contactInfo ? ValidationService.sanitizeString(contactInfo, 100) : '';

    if (!sanitizedMessage) {
      console.error('Message d\'urgence vide après nettoyage');
      return false;
    }

    const { data, error } = await supabase.functions.invoke('brevo-contact-send', {
      body: {
        firstName: 'Demande',
        lastName: 'Urgence',
        email: sanitizedContact || 'urgence@christlebonberger.fr',
        subject: "🚨 DEMANDE D'URGENCE - Action immédiate requise",
        message: `DEMANDE D'URGENCE:\n\n${sanitizedMessage}\n\nContact: ${sanitizedContact || 'Non fourni'}\n\nHeure: ${new Date().toLocaleString('fr-FR')}`,
      }
    });
    if (error) {
      console.error('Erreur Brevo urgence:', error);
      return false;
    }
    console.log('Brevo urgence envoyé:', data);
    return true;
  } catch (error) {
    console.error('Erreur envoi email d\'urgence:', error);
    return false;
  }
};