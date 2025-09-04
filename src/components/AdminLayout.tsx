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
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const menuItems = [
    {
      name: 'Médiathèque',
      href: '/admin/mediatheque',
      icon: FileText,
      description: 'Gérer les ressources multimédia'
    },
    {
      name: 'Newsletters',
      href: '/admin/newsletter',
      icon: Mail,
      description: 'Gérer les abonnés et envois'
    },
    {
      name: 'Statistiques',
      href: '/admin/stats',
      icon: BarChart3,
      description: 'Analyser les performances'
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
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 text-sm transition-colors duration-300 p-2 rounded-lg hover:bg-slate-50 w-full text-left"
                >
                  <Settings className="w-4 h-4" />
                  <span>Paramètres</span>
                </button>
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