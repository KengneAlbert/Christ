import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminAuth from '../components/AdminAuth';
import AdminLayout from '../components/AdminLayout';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  children: React.ReactNode;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // État pour forcer le rafraîchissement après la connexion
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate('/admin/mediatheque'); // Redirection plus propre avec React Router
  };

  if (loading) {
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
