// Service de validation renforcée des données
import DOMPurify from 'dompurify';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationService {
  // Validation stricte des emails
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Validation des noms (lettres, espaces, tirets, apostrophes)
  private static readonly NAME_REGEX = /^[a-zA-ZÀ-ÿ\s\-']{1,50}$/;
  
  // Validation des téléphones français
  private static readonly PHONE_REGEX = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

  // Nettoyer et valider une chaîne
  static sanitizeString(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') return '';
    
    // Nettoyer le HTML et les scripts
    const cleaned = DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
    
    // Limiter la longueur
    return cleaned.slice(0, maxLength).trim();
  }

  // Validation d'email renforcée
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    const sanitized = this.sanitizeString(email, 254); // RFC 5321 limite

    if (!sanitized) {
      errors.push('L\'adresse email est requise');
      return { isValid: false, errors };
    }

    if (sanitized.length > 254) {
      errors.push('L\'adresse email est trop longue (max 254 caractères)');
    }

    if (!this.EMAIL_REGEX.test(sanitized)) {
      errors.push('Format d\'adresse email invalide');
    }

    // Vérifications supplémentaires
    if (sanitized.includes('..')) {
      errors.push('L\'adresse email ne peut pas contenir deux points consécutifs');
    }

    if (sanitized.startsWith('.') || sanitized.endsWith('.')) {
      errors.push('L\'adresse email ne peut pas commencer ou finir par un point');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validation de nom
  static validateName(name: string, fieldName: string = 'nom'): ValidationResult {
    const errors: string[] = [];
    const sanitized = this.sanitizeString(name, 50);

    if (sanitized && !this.NAME_REGEX.test(sanitized)) {
      errors.push(`Le ${fieldName} ne peut contenir que des lettres, espaces, tirets et apostrophes`);
    }

    if (sanitized.length > 50) {
      errors.push(`Le ${fieldName} ne peut pas dépasser 50 caractères`);
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validation de téléphone
  static validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];
    const sanitized = this.sanitizeString(phone, 20);

    if (sanitized && !this.PHONE_REGEX.test(sanitized)) {
      errors.push('Format de numéro de téléphone invalide');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validation de message/contenu
  static validateMessage(message: string, minLength: number = 10, maxLength: number = 5000): ValidationResult {
    const errors: string[] = [];
    const sanitized = this.sanitizeString(message, maxLength);

    if (!sanitized) {
      errors.push('Le message est requis');
      return { isValid: false, errors };
    }

    if (sanitized.length < minLength) {
      errors.push(`Le message doit contenir au moins ${minLength} caractères`);
    }

    if (sanitized.length > maxLength) {
      errors.push(`Le message ne peut pas dépasser ${maxLength} caractères`);
    }

    // Détecter le spam potentiel
    if (this.detectSpam(sanitized)) {
      errors.push('Le contenu semble être du spam');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validation générique avec règles
  static validateField(value: string, rules: ValidationRule, fieldName: string): ValidationResult {
    const errors: string[] = [];
    const sanitized = this.sanitizeString(value, rules.maxLength || 1000);

    if (rules.required && !sanitized) {
      errors.push(`Le champ ${fieldName} est requis`);
      return { isValid: false, errors };
    }

    if (rules.minLength && sanitized.length < rules.minLength) {
      errors.push(`${fieldName} doit contenir au moins ${rules.minLength} caractères`);
    }

    if (rules.maxLength && sanitized.length > rules.maxLength) {
      errors.push(`${fieldName} ne peut pas dépasser ${rules.maxLength} caractères`);
    }

    if (rules.pattern && !rules.pattern.test(sanitized)) {
      errors.push(`Format de ${fieldName} invalide`);
    }

    if (rules.customValidator && !rules.customValidator(sanitized)) {
      errors.push(`${fieldName} ne respecte pas les critères requis`);
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validation complète d'un formulaire de contact
  static validateContactForm(data: {
    firstName: string;
    lastName?: string;
    email: string;
    subject: string;
    message: string;
  }): ValidationResult {
    const errors: string[] = [];

    // Validation prénom
    const firstNameResult = this.validateName(data.firstName, 'prénom');
    if (!firstNameResult.isValid) {
      errors.push(...firstNameResult.errors);
    }

    // Validation nom (optionnel)
    if (data.lastName) {
      const lastNameResult = this.validateName(data.lastName, 'nom');
      if (!lastNameResult.isValid) {
        errors.push(...lastNameResult.errors);
      }
    }

    // Validation email
    const emailResult = this.validateEmail(data.email);
    if (!emailResult.isValid) {
      errors.push(...emailResult.errors);
    }

    // Validation sujet
    const subjectResult = this.validateField(data.subject, {
      required: true,
      minLength: 3,
      maxLength: 200
    }, 'sujet');
    if (!subjectResult.isValid) {
      errors.push(...subjectResult.errors);
    }

    // Validation message
    const messageResult = this.validateMessage(data.message, 10, 5000);
    if (!messageResult.isValid) {
      errors.push(...messageResult.errors);
    }

    return { isValid: errors.length === 0, errors };
  }

  // Détection basique de spam
  private static detectSpam(text: string): boolean {
    const spamKeywords = [
      'viagra', 'casino', 'lottery', 'winner', 'congratulations',
      'click here', 'free money', 'make money fast', 'work from home',
      'weight loss', 'diet pills', 'enlargement'
    ];

    const lowerText = text.toLowerCase();
    
    // Trop de mots en majuscules
    const upperCaseWords = text.match(/[A-Z]{3,}/g);
    if (upperCaseWords && upperCaseWords.length > 3) return true;

    // Mots-clés de spam
    return spamKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Validation d'URL
  static validateURL(url: string): ValidationResult {
    const errors: string[] = [];
    const sanitized = this.sanitizeString(url, 2048);

    if (sanitized) {
      try {
        const urlObj = new URL(sanitized);
        
        // Vérifier les protocoles autorisés
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          errors.push('Seuls les protocoles HTTP et HTTPS sont autorisés');
        }

        // Vérifier la longueur
        if (sanitized.length > 2048) {
          errors.push('L\'URL est trop longue');
        }
      } catch {
        errors.push('Format d\'URL invalide');
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Hook React pour la validation
export const useValidation = () => {
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  const validateField = React.useCallback((
    fieldName: string, 
    value: string, 
    rules: ValidationRule
  ) => {
    const result = ValidationService.validateField(value, rules, fieldName);
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.errors
    }));
    return result.isValid;
  }, []);

  const clearErrors = React.useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = React.useMemo(() => {
    return Object.values(errors).some(fieldErrors => fieldErrors.length > 0);
  }, [errors]);

  return {
    errors,
    validateField,
    clearErrors,
    hasErrors,
    ValidationService
  };
};