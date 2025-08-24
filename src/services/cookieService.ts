// Service de gestion des cookies
export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export class CookieService {
  private static readonly CONSENT_KEY = 'cookie-consent';
  private static readonly EXPIRY_DAYS = 365;

  // Obtenir les préférences de cookies
  static getPreferences(): CookiePreferences | null {
    try {
      const stored = localStorage.getItem(this.CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erreur lors de la lecture des préférences cookies:', error);
      return null;
    }
  }

  // Sauvegarder les préférences de cookies
  static savePreferences(preferences: CookiePreferences): void {
    try {
      localStorage.setItem(this.CONSENT_KEY, JSON.stringify(preferences));
      
      // Sauvegarder aussi dans un cookie pour les sous-domaines
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.EXPIRY_DAYS);
      
      document.cookie = `${this.CONSENT_KEY}=${JSON.stringify(preferences)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences cookies:', error);
    }
  }

  // Vérifier si un type de cookie est autorisé
  static isAllowed(type: keyof CookiePreferences): boolean {
    const preferences = this.getPreferences();
    if (!preferences) return false;
    return preferences[type];
  }

  // Vérifier si le consentement a été donné
  static hasConsent(): boolean {
    return this.getPreferences() !== null;
  }

  // Réinitialiser les préférences
  static resetPreferences(): void {
    localStorage.removeItem(this.CONSENT_KEY);
    document.cookie = `${this.CONSENT_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // Obtenir tous les cookies du domaine
  static getAllCookies(): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  }

  // Supprimer un cookie spécifique
  static deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  }

  // Supprimer tous les cookies non nécessaires
  static deleteNonEssentialCookies(): void {
    const preferences = this.getPreferences();
    if (!preferences) return;

    const allCookies = this.getAllCookies();
    const essentialCookies = [this.CONSENT_KEY, 'session', 'csrf'];

    Object.keys(allCookies).forEach(cookieName => {
      if (essentialCookies.includes(cookieName)) return;

      // Supprimer selon les préférences
      if (cookieName.includes('analytics') && !preferences.analytics) {
        this.deleteCookie(cookieName);
      }
      if (cookieName.includes('marketing') && !preferences.marketing) {
        this.deleteCookie(cookieName);
      }
      if (cookieName.includes('functional') && !preferences.functional) {
        this.deleteCookie(cookieName);
      }
    });
  }

  // Initialiser les services selon les préférences
  static initializeServices(): void {
    const preferences = this.getPreferences();
    if (!preferences) return;

    // Google Analytics
    if (preferences.analytics) {
      this.initializeGoogleAnalytics();
    }

    // Services marketing
    if (preferences.marketing) {
      this.initializeMarketingServices();
    }

    // Services fonctionnels
    if (preferences.functional) {
      this.initializeFunctionalServices();
    }
  }

  private static initializeGoogleAnalytics(): void {
    // Initialiser Google Analytics si autorisé
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  }

  private static initializeMarketingServices(): void {
    // Initialiser les services marketing si autorisés
    console.log('Services marketing initialisés');
  }

  private static initializeFunctionalServices(): void {
    // Initialiser les services fonctionnels si autorisés
    console.log('Services fonctionnels initialisés');
  }
}

// Hook React pour utiliser les cookies
export const useCookieConsent = () => {
  const preferences = CookieService.getPreferences();
  const hasConsent = CookieService.hasConsent();

  const updatePreferences = (newPreferences: CookiePreferences) => {
    CookieService.savePreferences(newPreferences);
    CookieService.initializeServices();
  };

  const resetConsent = () => {
    CookieService.resetPreferences();
    window.location.reload();
  };

  return {
    preferences,
    hasConsent,
    updatePreferences,
    resetConsent,
    isAllowed: CookieService.isAllowed
  };
};