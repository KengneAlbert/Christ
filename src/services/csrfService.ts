// Service de gestion des tokens CSRF
export class CSRFService {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_HEADER = 'X-CSRF-Token';
  private static readonly TOKEN_LENGTH = 32;

  // Générer un token CSRF sécurisé
  static generateToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Obtenir le token CSRF actuel
  static getToken(): string {
    let token = sessionStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      token = this.generateToken();
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
    return token;
  }

  // Renouveler le token CSRF
  static refreshToken(): string {
    const newToken = this.generateToken();
    sessionStorage.setItem(this.TOKEN_KEY, newToken);
    return newToken;
  }

  // Valider un token CSRF
  static validateToken(token: string): boolean {
    const storedToken = sessionStorage.getItem(this.TOKEN_KEY);
    return storedToken === token && token.length === this.TOKEN_LENGTH * 2;
  }

  // Ajouter le token aux headers de requête
  static addTokenToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      ...headers,
      [this.TOKEN_HEADER]: this.getToken()
    };
  }

  // Créer un champ hidden pour les formulaires
  static createHiddenInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'csrf_token';
    input.value = this.getToken();
    return input;
  }

  // Nettoyer le token (déconnexion)
  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
}

// Hook React pour utiliser CSRF
export const useCSRF = () => {
  const [token, setToken] = React.useState<string>('');

  React.useEffect(() => {
    setToken(CSRFService.getToken());
  }, []);

  const refreshToken = React.useCallback(() => {
    const newToken = CSRFService.refreshToken();
    setToken(newToken);
    return newToken;
  }, []);

  return {
    token,
    refreshToken,
    addToHeaders: CSRFService.addTokenToHeaders,
    createHiddenInput: CSRFService.createHiddenInput
  };
};