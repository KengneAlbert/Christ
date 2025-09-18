import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminAuth from '../components/AdminAuth';
import AdminLayout from '../components/AdminLayout';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  children: React.ReactNode;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ children }) => {
  const { user, loading, initialized } = useAuth();
  const navigate = useNavigate();
  
  // État pour forcer le rafraîchissement après la connexion
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!user);
    
    // Vérifier la session sauvegardée si pas d'utilisateur mais initialisé
    if (initialized && !user && !sessionChecked) {
      const savedSession = sessionStorage.getItem('admin_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          const hourAgo = Date.now() - (60 * 60 * 1000);
          
          // Si la session est récente (moins d'1h), considérer comme connecté
          if (session.timestamp > hourAgo) {
            console.log('Session admin récupérée depuis le cache');
            setIsLoggedIn(true);
          } else {
            sessionStorage.removeItem('admin_session');
          }
        } catch (error) {
          console.error('Erreur lecture session:', error);
          sessionStorage.removeItem('admin_session');
        }
      }
      setSessionChecked(true);
    }
  }, [user]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate('/admin/mediatheque'); // Redirection plus propre avec React Router
  };

  if (loading || !initialized || (!sessionChecked && !user)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminAuth onSuccess={handleLoginSuccess} />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminDashboard;
