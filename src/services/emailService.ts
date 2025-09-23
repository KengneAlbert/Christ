import { CSRFService } from './csrfService';
import { ValidationService } from './validationService';
import { supabase } from '../lib/supabase';
import { buildContactHtml } from '../emails/renderers';

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

    const inner = `
      <div style="background:#f8fafc; padding:20px; border-radius:12px; margin-bottom:24px; border-left:4px solid #10b981;">
        <h3 style="margin:0 0 12px 0; color:#059669; font-size:18px;">Nouveau message de contact</h3>
        <p style="margin:0; color:#475569; font-size:14px;">Reçu le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
      </div>
      <div style="margin-bottom:20px;">
        <p style="margin:0 0 8px 0; color:#64748b; font-size:14px; font-weight:600;">EXPÉDITEUR</p>
        <p style="margin:0; color:#0f172a; font-size:16px;">${sanitizedData.firstName} ${sanitizedData.lastName}</p>
        <p style="margin:0; color:#059669; font-size:14px;">
          <a href="mailto:${sanitizedData.email}" style="color:#059669; text-decoration:none;">${sanitizedData.email}</a>
        </p>
      </div>
      <div style="margin-bottom:24px;">
        <p style="margin:0 0 8px 0; color:#64748b; font-size:14px; font-weight:600;">MESSAGE</p>
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:20px; white-space:pre-wrap; line-height:1.7; color:#0f172a;">${sanitizedData.message}</div>
      </div>
      <div style="text-align:center; margin-top:32px;">
        <a href="mailto:${sanitizedData.email}?subject=Re: ${encodeURIComponent(sanitizedData.subject)}" style="display:inline-block; background:linear-gradient(135deg, #10b981, #14b8a6); color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:500; font-size:14px;">
          Répondre à ${sanitizedData.firstName}
        </a>
      </div>
    `;
    const htmlContent = buildContactHtml(sanitizedData.subject, inner, {
      headerTitle: 'Nouveau message de contact',
      brandColor: 'linear-gradient(135deg, #10b981, #14b8a6)',
      logoUrl: '',
    });

    // Logging pour diagnostic
    const csrfToken = CSRFService.getToken();
    console.log('CSRF Token length:', csrfToken.length);
    console.log('Origin:', window.location.origin);
    
    // Tentative avec brevo-contact-send d'abord
    let { data, error } = await supabase.functions.invoke('brevo-contact-send', {
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: {
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        htmlContent,
      }
    });
    
    // Si erreur 403, essayer avec brevo-newsletter-send comme fallback
    if (error && (error.message?.includes('403') || error.message?.includes('Forbidden'))) {
      console.warn('Fallback vers brevo-newsletter-send pour le contact');
      const newsletterPayload = {
        subject: `[CONTACT] ${sanitizedData.subject}`,
        htmlContent,
        textContent: `Contact de: ${sanitizedData.firstName} ${sanitizedData.lastName || ''} <${sanitizedData.email}>\n\n${sanitizedData.message}`,
        recipients: [{ 
          email: 'contact@christ-le-bon-berger.com',
          name: 'Équipe Contact'
        }],
        senderName: 'Christ Le Bon Berger - Contact'
      };
      
      const fallbackResult = await supabase.functions.invoke('brevo-newsletter-send', {
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: newsletterPayload
      });
      
      data = fallbackResult.data;
      error = fallbackResult.error;
    }
    
    if (error) {
      console.error('Erreur Brevo détaillée:', {
        error,
        message: error.message,
        details: error.details,
        status: error.status,
        origin: window.location.origin,
        csrfTokenLength: csrfToken.length
      });
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

    const inner = `
      <div style="background:#fef2f2; padding:20px; border-radius:12px; margin-bottom:24px; border-left:4px solid #ef4444;">
        <h3 style="margin:0 0 8px 0; color:#dc2626; font-size:18px; display:flex; align-items:center;">
          <span style="margin-right:8px;">🚨</span> DEMANDE D'URGENCE
        </h3>
        <p style="margin:0; color:#7f1d1d; font-size:14px; font-weight:600;">ACTION IMMÉDIATE REQUISE</p>
      </div>
      <div style="background:#ffffff; border:1px solid #fca5a5; border-radius:8px; padding:20px; margin-bottom:20px;">
        <div style="white-space:pre-wrap; line-height:1.7; color:#0f172a; font-size:16px;">${sanitizedMessage}</div>
      </div>
      <div style="background:#f8fafc; padding:16px; border-radius:8px; border-left:4px solid #6b7280;">
        <p style="margin:0; color:#374151; font-size:14px;">
          <strong>Contact fourni:</strong> ${sanitizedContact || 'Non fourni'}
        </p>
        <p style="margin:8px 0 0 0; color:#6b7280; font-size:12px;">
          Reçu le ${new Date().toLocaleString('fr-FR')}
        </p>
      </div>
    `;
    const htmlContent = buildContactHtml("🚨 DEMANDE D'URGENCE - Action immédiate requise", inner, {
      headerTitle: '🚨 URGENCE',
      brandColor: 'linear-gradient(135deg, #ef4444, #dc2626)',
      logoUrl: '',
    });
    const { data, error } = await supabase.functions.invoke('brevo-contact-send', {
      headers: {
        'X-CSRF-Token': CSRFService.getToken(),
      },
      body: {
        firstName: 'Demande',
        lastName: 'Urgence',
        email: sanitizedContact || 'urgence@christlebonberger.fr',
        subject: "🚨 DEMANDE D'URGENCE - Action immédiate requise",
        message: `DEMANDE D'URGENCE:\n\n${sanitizedMessage}\n\nContact: ${sanitizedContact || 'Non fourni'}\n\nHeure: ${new Date().toLocaleString('fr-FR')}`,
        htmlContent,
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