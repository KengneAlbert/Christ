import emailjs from '@emailjs/browser';
import { CSRFService } from './csrfService';
import { ValidationService } from './validationService';

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

    // Initialisation d'EmailJS avec la clé publique
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Préparation des données pour le template
    const templateParams = {
      from_name: `${sanitizedData.firstName} ${sanitizedData.lastName}`.trim(),
      from_email: sanitizedData.email,
      subject: sanitizedData.subject,
      message: sanitizedData.message,
      to_name: 'Christ Le Bon Berger',
      reply_to: sanitizedData.email,
      csrf_token: CSRFService.getToken()
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
    // Validation et nettoyage du message d'urgence
    const sanitizedMessage = ValidationService.sanitizeString(message, 2000);
    const sanitizedContact = contactInfo ? ValidationService.sanitizeString(contactInfo, 100) : '';

    if (!sanitizedMessage) {
      console.error('Message d\'urgence vide après nettoyage');
      return false;
    }

    emailjs.init(EMAILJS_PUBLIC_KEY);

    const templateParams = {
      from_name: 'Demande d\'urgence',
      from_email: sanitizedContact || 'urgence@christlebonberger.fr',
      subject: '🚨 DEMANDE D\'URGENCE - Action immédiate requise',
      message: `DEMANDE D'URGENCE:\n\n${sanitizedMessage}\n\nContact: ${sanitizedContact || 'Non fourni'}\n\nHeure: ${new Date().toLocaleString('fr-FR')}`,
      to_name: 'Équipe d\'urgence - Christ Le Bon Berger',
      reply_to: sanitizedContact || 'urgence@christlebonberger.fr',
      csrf_token: CSRFService.getToken()
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