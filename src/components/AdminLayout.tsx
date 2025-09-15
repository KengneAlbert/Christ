import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Mail, FileText, BarChart3, Settings, User, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../assets/LogoChrist.png';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    // Créer un popup de confirmation personnalisé
    const confirmLogout = () => {
      return new Promise<boolean>((resolve) => {
        // Créer l'overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        `;

        // Créer le modal
        const modal = document.createElement('div');
        modal.style.cssText = `
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          max-width: 400px;
          width: 90%;
          text-align: center;
          animation: scaleIn 0.2s ease-out;
        `;

        modal.innerHTML = `
          <style>
            @keyframes scaleIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          </style>
          <div style="margin-bottom: 1.5rem;">
            <div style="width: 4rem; height: 4rem; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5-5-5m5 5H9"/>
              </svg>
            </div>
            <h3 style="margin: 0 0 0.5rem; font-size: 1.25rem; font-weight: bold; color: #1e293b;">Confirmer la déconnexion</h3>
            <p style="margin: 0; color: #64748b; font-size: 0.875rem;">Êtes-vous sûr de vouloir vous déconnecter du tableau de bord ?</p>
          </div>
          <div style="display: flex; gap: 0.75rem; justify-content: center;">
            <button id="cancelBtn" style="
              padding: 0.75rem 1.5rem;
              border: 2px solid #e2e8f0;
              background: white;
              color: #64748b;
              border-radius: 0.75rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              font-size: 0.875rem;
            ">Annuler</button>
            <button id="confirmBtn" style="
              padding: 0.75rem 1.5rem;
              background: linear-gradient(135deg, #ef4444, #dc2626);
              color: white;
              border: none;
              border-radius: 0.75rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              font-size: 0.875rem;
            ">Se déconnecter</button>
          </div>
        `;

        // Ajouter les événements
        const cancelBtn = modal.querySelector('#cancelBtn');
        const confirmBtn = modal.querySelector('#confirmBtn');

        cancelBtn?.addEventListener('click', () => {
          document.body.removeChild(overlay);
          resolve(false);
        });

        confirmBtn?.addEventListener('click', () => {
          document.body.removeChild(overlay);
          resolve(true);
        });

        // Fermer avec Escape
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', handleEscape);
            resolve(false);
          }
        };
        document.addEventListener('keydown', handleEscape);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
      });
    };

    // Demander confirmation
    const confirmed = await confirmLogout();
    
    if (confirmed) {
      try {
        // Afficher un indicateur de déconnexion
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 10001;
          color: white;
        `;
        loadingOverlay.innerHTML = `
          <div style="text-align: center;">
            <div style="width: 3rem; height: 3rem; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
            <p style="margin: 0; font-size: 1.125rem; font-weight: 600;">Déconnexion en cours...</p>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;
        document.body.appendChild(loadingOverlay);

        // Déconnexion Supabase
        const { error } = await signOut();
        
        if (error) {
          console.warn('Erreur déconnexion Supabase:', error);
        }
        
        // Nettoyage complet des données locales
        if (typeof window !== 'undefined') {
          sessionStorage.clear();
          localStorage.clear();
          
          // Nettoyer spécifiquement les données Supabase
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('supabase.') || key.startsWith('sb-')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        // Redirection forcée vers la page d'accueil
        setTimeout(() => {
          window.location.replace('/');
        }, 500);
        
      } catch (error) {
        console.error('Erreur critique déconnexion:', error);
        
        // Nettoyage manuel en cas d'erreur critique
        if (typeof window !== 'undefined') {
          sessionStorage.clear();
          localStorage.clear();
        }
        
        // Redirection forcée même en cas d'erreur
        window.location.replace('/');
      }
    }
  };

  const menuItems = [
    {
      name: 'Gestion Médiathèque',
      href: '/admin/mediatheque',
      icon: FileText,
      description: 'Gérer les médias et ressources'
    },
    {
      name: 'Gestion Newsletter',
      href: '/admin/newsletter',
      icon: Mail,
      description: 'Abonnés et campagnes email'
    }
  ];

  const isActivePage = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <img
                src={Logo}
                alt="Logo Christ Le Bon Berger"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-800">Administration</h1>
                <p className="text-sm text-emerald-600">Christ Le Bon Berger</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-800">{user?.email}</p>
                  <p className="text-xs text-slate-500">Administrateur</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-slate-600 hover:text-red-600 transition-colors duration-300 p-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-slate-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-6">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePage(item.href);
                
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce-gentle' : 'group-hover:scale-110 transition-transform duration-300'}`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <a
                  href="/"
                  className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 text-sm transition-colors duration-300 p-2 rounded-lg hover:bg-emerald-50"
                >
                  <Shield className="w-4 h-4" />
                  <span>Voir le site</span>
                </a>
                <a
                  href="/mediatheque"
                  className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 text-sm transition-colors duration-300 p-2 rounded-lg hover:bg-emerald-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>Médiathèque publique</span>
                </a>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;