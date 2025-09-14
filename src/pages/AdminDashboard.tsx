import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminAuth from '../components/AdminAuth';
import AdminLayout from '../components/AdminLayout';

interface AdminDashboardProps {
  children: React.ReactNode;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ children }) => {
  const { user, loading } = useAuth();

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

  // Temporairement, permettre l'accès même sans utilisateur pour tester la base de données
  // En production, décommenter la ligne suivante :
  // if (!user) return <AdminAuth onSuccess={() => window.location.reload()} />;
  
  // Pour le moment, permettre l'accès direct au tableau de bord pour tester
  if (!user) {
    return <AdminAuth onSuccess={() => window.location.reload()} />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminDashboard;