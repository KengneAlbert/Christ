// Service de sécurité pour l'authentification admin
export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ip?: string;
}

export interface SecurityConfig {
  maxAttempts: number;
  lockoutDuration: number; // en minutes
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  sessionTimeout: number; // en minutes
}

export class AuthSecurityService {
  private static readonly ATTEMPTS_KEY = 'auth_attempts';
  private static readonly LOCKOUT_KEY = 'auth_lockout';
  private static readonly SESSION_KEY = 'auth_session';
  
  private static readonly DEFAULT_CONFIG: SecurityConfig = {
    maxAttempts: 5,
    lockoutDuration: 15, // 15 minutes
    passwordMinLength: 12,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    sessionTimeout: 60 // 1 heure
  };

  // Vérifier si un email est verrouillé
  static isEmailLocked(email: string): boolean {
    const lockouts = this.getLockouts();
    const lockout = lockouts[email];
    
    if (!lockout) return false;
    
    const now = Date.now();
    const lockoutExpiry = lockout.timestamp + (this.DEFAULT_CONFIG.lockoutDuration * 60 * 1000);
    
    if (now > lockoutExpiry) {
      // Lockout expiré, le supprimer
      delete lockouts[email];
      localStorage.setItem(this.LOCKOUT_KEY, JSON.stringify(lockouts));
      return false;
    }
    
    return true;
  }

  // Obtenir le temps restant de verrouillage
  static getLockoutTimeRemaining(email: string): number {
    const lockouts = this.getLockouts();
    const lockout = lockouts[email];
    
    if (!lockout) return 0;
    
    const now = Date.now();
    const lockoutExpiry = lockout.timestamp + (this.DEFAULT_CONFIG.lockoutDuration * 60 * 1000);
    
    return Math.max(0, Math.ceil((lockoutExpiry - now) / 1000 / 60)); // en minutes
  }

  // Enregistrer une tentative de connexion
  static recordLoginAttempt(email: string, success: boolean): void {
    const attempts = this.getAttempts();
    const now = Date.now();
    
    // Nettoyer les anciennes tentatives (plus de 24h)
    const dayAgo = now - (24 * 60 * 60 * 1000);
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > dayAgo);
    
    // Ajouter la nouvelle tentative
    recentAttempts.push({
      email,
      timestamp: now,
      success,
      ip: this.getClientIP()
    });
    
    localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(recentAttempts));
    
    // Si échec, vérifier si verrouillage nécessaire
    if (!success) {
      this.checkAndApplyLockout(email);
    } else {
      // Si succès, supprimer le verrouillage
      this.removeLockout(email);
    }
  }

  // Vérifier et appliquer un verrouillage si nécessaire
  private static checkAndApplyLockout(email: string): void {
    const attempts = this.getAttempts();
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    // Compter les échecs dans la dernière heure
    const recentFailures = attempts.filter(attempt => 
      attempt.email === email && 
      !attempt.success && 
      attempt.timestamp > hourAgo
    );
    
    if (recentFailures.length >= this.DEFAULT_CONFIG.maxAttempts) {
      const lockouts = this.getLockouts();
      lockouts[email] = {
        timestamp: now,
        attempts: recentFailures.length
      };
      localStorage.setItem(this.LOCKOUT_KEY, JSON.stringify(lockouts));
    }
  }

  // Supprimer un verrouillage
  private static removeLockout(email: string): void {
    const lockouts = this.getLockouts();
    delete lockouts[email];
    localStorage.setItem(this.LOCKOUT_KEY, JSON.stringify(lockouts));
  }

  // Obtenir les tentatives
  private static getAttempts(): LoginAttempt[] {
    try {
      const stored = localStorage.getItem(this.ATTEMPTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Obtenir les verrouillages
  private static getLockouts(): Record<string, { timestamp: number; attempts: number }> {
    try {
      const stored = localStorage.getItem(this.LOCKOUT_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Obtenir l'IP du client (approximatif)
  private static getClientIP(): string {
    // En production, ceci devrait venir du serveur
    return 'client-ip';
  }

  // Validation stricte des mots de passe
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.DEFAULT_CONFIG;
    
    if (password.length < config.passwordMinLength) {
      errors.push(`Le mot de passe doit contenir au moins ${config.passwordMinLength} caractères`);
    }
    
    if (config.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    if (config.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    if (config.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (config.passwordRequireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    // Vérifier les mots de passe communs
    if (this.isCommonPassword(password)) {
      errors.push('Ce mot de passe est trop commun, veuillez en choisir un autre');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Vérifier si c'est un mot de passe commun
  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      'dragon', 'master', 'shadow', 'superman', 'michael'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }

  // Vérifier si l'email est autorisé pour l'inscription admin
  static isEmailAuthorizedForAdmin(email: string): boolean {
    // Liste des domaines/emails autorisés pour l'inscription admin
    const authorizedEmails = [
      'admin@christlebonberger.fr',
      'suzy.poka@christlebonberger.fr',
      'christelle.youeto@christlebonberger.fr',
      'florence.noumo@christlebonberger.fr',
      'mariette.kom@christlebonberger.fr'
    ];
    
    const authorizedDomains = [
      'christlebonberger.fr'
    ];
    
    // Vérifier email exact
    if (authorizedEmails.includes(email.toLowerCase())) {
      return true;
    }
    
    // Vérifier domaine
    const domain = email.split('@')[1]?.toLowerCase();
    return authorizedDomains.includes(domain);
  }

  // Gestion des sessions sécurisées
  static createSecureSession(userId: string, email: string): void {
    const session = {
      userId,
      email,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      fingerprint: this.generateFingerprint()
    };
    
    // Chiffrer la session (basique)
    const encrypted = btoa(JSON.stringify(session));
    sessionStorage.setItem(this.SESSION_KEY, encrypted);
  }

  // Valider une session
  static validateSession(): { isValid: boolean; session?: any } {
    try {
      const encrypted = sessionStorage.getItem(this.SESSION_KEY);
      if (!encrypted) return { isValid: false };
      
      const session = JSON.parse(atob(encrypted));
      const now = Date.now();
      
      // Vérifier l'expiration
      const sessionAge = now - session.createdAt;
      const maxAge = this.DEFAULT_CONFIG.sessionTimeout * 60 * 1000;
      
      if (sessionAge > maxAge) {
        this.clearSession();
        return { isValid: false };
      }
      
      // Vérifier l'inactivité
      const inactivity = now - session.lastActivity;
      const maxInactivity = 30 * 60 * 1000; // 30 minutes
      
      if (inactivity > maxInactivity) {
        this.clearSession();
        return { isValid: false };
      }
      
      // Vérifier l'empreinte
      if (session.fingerprint !== this.generateFingerprint()) {
        this.clearSession();
        return { isValid: false };
      }
      
      // Mettre à jour l'activité
      session.lastActivity = now;
      const updatedEncrypted = btoa(JSON.stringify(session));
      sessionStorage.setItem(this.SESSION_KEY, updatedEncrypted);
      
      return { isValid: true, session };
    } catch {
      this.clearSession();
      return { isValid: false };
    }
  }

  // Générer une empreinte du navigateur
  private static generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 10, 10);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Hash simple
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString();
  }

  // Nettoyer la session
  static clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  // Obtenir les statistiques de sécurité
  static getSecurityStats(): {
    totalAttempts: number;
    failedAttempts: number;
    lockedEmails: number;
    recentAttempts: LoginAttempt[];
  } {
    const attempts = this.getAttempts();
    const lockouts = this.getLockouts();
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > hourAgo);
    
    return {
      totalAttempts: attempts.length,
      failedAttempts: attempts.filter(a => !a.success).length,
      lockedEmails: Object.keys(lockouts).length,
      recentAttempts
    };
  }
}