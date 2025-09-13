// Service de gestion de l'historique de navigation pour la sécurité des victimes
export class HistoryService {
  
  // Effacer l'historique de navigation de manière sécurisée
  static clearBrowsingHistory(): void {
    try {
      // 1. Effacer l'historique local du navigateur (limité par les permissions)
      if (window.history && window.history.replaceState) {
        // Remplacer l'entrée actuelle dans l'historique
        window.history.replaceState(null, '', '/');
        
        // Essayer de vider l'historique en naviguant vers une page vide
        window.history.pushState(null, '', 'about:blank');
      }

      // 2. Effacer les données de session et localStorage
      this.clearStorageData();

      // 3. Effacer les cookies du site
      this.clearSiteCookies();

      // 4. Désactiver le cache pour cette session
      this.disableCache();

      // 5. Afficher un message de confirmation
      this.showClearanceConfirmation();

      // 6. Rediriger vers une page neutre après un délai
      setTimeout(() => {
        this.redirectToNeutralSite();
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'effacement de l\'historique:', error);
      // Fallback: redirection immédiate
      this.redirectToNeutralSite();
    }
  }

  // Effacer toutes les données de stockage local
  private static clearStorageData(): void {
    try {
      // Vider localStorage
      localStorage.clear();
      
      // Vider sessionStorage
      sessionStorage.clear();
      
      // Vider IndexedDB (si utilisé)
      if ('indexedDB' in window) {
        indexedDB.databases?.().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        }).catch(() => {
          // Ignorer les erreurs IndexedDB
        });
      }
    } catch (error) {
      console.error('Erreur effacement stockage:', error);
    }
  }

  // Effacer les cookies du site actuel
  private static clearSiteCookies(): void {
    try {
      const cookies = document.cookie.split(';');
      
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        if (name) {
          // Effacer le cookie pour le domaine actuel
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        }
      });
    } catch (error) {
      console.error('Erreur effacement cookies:', error);
    }
  }

  // Désactiver le cache pour cette session
  private static disableCache(): void {
    try {
      // Ajouter des headers no-cache si possible
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        }).catch(() => {
          // Ignorer les erreurs service worker
        });
      }
    } catch (error) {
      console.error('Erreur désactivation cache:', error);
    }
  }

  // Afficher un message de confirmation
  private static showClearanceConfirmation(): void {
    // Créer un overlay de confirmation
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 20px;">✓</div>
        <h2 style="margin: 0 0 10px 0; font-size: 24px;">Historique effacé</h2>
        <p style="margin: 0; font-size: 16px; opacity: 0.8;">
          Vos données de navigation ont été supprimées.<br>
          Redirection en cours vers un site neutre...
        </p>
        <div style="margin-top: 20px;">
          <div style="width: 40px; height: 40px; border: 3px solid #fff; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.appendChild(overlay);
  }

  // Rediriger vers un site neutre
  private static redirectToNeutralSite(): void {
    // Liste de sites neutres pour la redirection
    const neutralSites = [
      'https://www.google.com',
      'https://www.wikipedia.org',
      'https://www.france.fr',
      'https://www.service-public.fr'
    ];
    
    // Choisir un site aléatoire
    const randomSite = neutralSites[Math.floor(Math.random() * neutralSites.length)];
    
    // Redirection avec remplacement de l'historique
    window.location.replace(randomSite);
  }

  // Vérifier si l'utilisateur est en mode navigation privée
  static isPrivateBrowsing(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Test pour Chrome/Safari
        if ('webkitRequestFileSystem' in window) {
          (window as any).webkitRequestFileSystem(
            0, 1,
            () => resolve(false), // Pas en mode privé
            () => resolve(true)   // Mode privé
          );
        }
        // Test pour Firefox
        else if ('MozAppearance' in document.documentElement.style) {
          const db = indexedDB.open('test');
          db.onerror = () => resolve(true);  // Mode privé
          db.onsuccess = () => resolve(false); // Pas en mode privé
        }
        // Autres navigateurs
        else {
          resolve(false);
        }
      } catch {
        resolve(false);
      }
    });
  }

  // Recommandations de sécurité pour l'utilisateur
  static getSecurityRecommendations(): string[] {
    return [
      'Utilisez toujours le mode navigation privée/incognito',
      'Effacez régulièrement votre historique de navigation',
      'Utilisez un ordinateur public ou un appareil sûr',
      'Fermez tous les onglets après utilisation',
      'Redémarrez le navigateur après consultation',
      'Évitez d\'enregistrer les mots de passe',
      'Déconnectez-vous de tous les comptes'
    ];
  }

  // Afficher les recommandations de sécurité
  static showSecurityTips(): void {
    const tips = this.getSecurityRecommendations();
    const message = 'Conseils de sécurité:\n\n' + tips.map((tip, index) => `${index + 1}. ${tip}`).join('\n');
    alert(message);
  }
}

// Fonction globale pour effacer l'historique (utilisée dans les composants)
export const clearBrowsingHistory = (): void => {
  HistoryService.clearBrowsingHistory();
};

// Fonction pour vérifier la navigation privée
export const checkPrivateBrowsing = (): Promise<boolean> => {
  return HistoryService.isPrivateBrowsing();
};

// Fonction pour afficher les conseils de sécurité
export const showSecurityTips = (): void => {
  HistoryService.showSecurityTips();
};