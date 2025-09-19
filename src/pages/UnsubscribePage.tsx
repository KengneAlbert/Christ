import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const UnsubscribePage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleUnsubscribe = async () => {
      const searchParams = new URLSearchParams(location.search);
      const email = searchParams.get('email');

      if (!email) {
        setStatus('error');
        setMessage('Adresse email non fournie.');
        return;
      }

      try {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('email', email);

        if (error) {
          console.error('Erreur désabonnement:', error);
          throw new Error('Une erreur technique est survenue.');
        }

        setStatus('success');
        setMessage('Vous avez été désabonné(e) de notre newsletter avec succès.');
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erreur lors du traitement.');
      }
    };

    handleUnsubscribe();
  }, [location]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Traitement de votre demande...</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Désabonnement réussi</h2>
            <p className="text-slate-600">{message}</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Erreur</h2>
            <p className="text-slate-600">{message}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Mail className="w-8 h-8 text-emerald-500" />
          <h1 className="text-2xl font-bold text-slate-800">Newsletter</h1>
        </div>
        {renderContent()}
        <div className="mt-8 text-center text-sm text-slate-500 flex items-center justify-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Christ Le Bon Berger</span>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;