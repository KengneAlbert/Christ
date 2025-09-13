import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Shield, Heart, Bell } from 'lucide-react';
import { useCSRF, CSRFService } from '../services/csrfService';
import { useValidation, ValidationService } from '../services/validationService';

interface NewsletterSubscriptionProps {
  className?: string;
  variant?: 'inline' | 'modal' | 'sidebar';
}

const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({ 
  className = '', 
  variant = 'inline' 
}) => {
  const { token: csrfToken } = useCSRF();
  const { errors, validateField, clearErrors, hasErrors } = useValidation();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [preferences, setPreferences] = useState({
    actualites: true,
    temoignages: true,
    evenements: true,
    ressources: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des données
    const emailValidation = ValidationService.validateEmail(email);
    const nameValidation = firstName ? ValidationService.validateName(firstName, 'prénom') : { isValid: true, errors: [] };
    
    if (!emailValidation.isValid || !nameValidation.isValid) {
      setStatus('error');
      return;
    }

    // Vérification CSRF
    if (!CSRFService.validateToken(csrfToken)) {
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulation d'envoi - remplacer par l'appel API réel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sauvegarder localement (en attendant une vraie base de données)
      const subscriber = {
        email: ValidationService.sanitizeString(email, 254),
        firstName: ValidationService.sanitizeString(firstName, 50),
        preferences,
        subscriptionDate: new Date().toISOString(),
        id: Date.now().toString()
      };
      
      const existingSubscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      
      // Vérifier si déjà abonné
      if (existingSubscribers.some((sub: any) => sub.email === email)) {
        throw new Error('Cette adresse email est déjà abonnée');
      }
      
      existingSubscribers.push(subscriber);
      localStorage.setItem('newsletter_subscribers', JSON.stringify(existingSubscribers));
      
      setStatus('success');
      setEmail('');
      setFirstName('');
    } catch (error) {
      console.error('Erreur abonnement newsletter:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (variant === 'inline') {
    return (
      <div className={`bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100 ${className}`}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Restez informé(e)</h3>
          <p className="text-slate-600 leading-relaxed">
            Recevez nos actualités, témoignages et ressources directement dans votre boîte mail
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-green-800 mb-2">Merci pour votre abonnement !</h4>
            <p className="text-green-700">Vous recevrez bientôt un email de confirmation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Token CSRF caché */}
            <input type="hidden" name="csrf_token" value={csrfToken} />

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Erreur lors de l'abonnement</span>
                </div>
                <p className="text-sm mt-1">Veuillez vérifier votre adresse email ou réessayer.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prénom (optionnel)
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFirstName(value);
                    if (value) validateField('firstName', value, { maxLength: 50 });
                  }}
                  maxLength={50}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="Votre prénom"
                />
                {errors.firstName && (
                  <div className="mt-1 text-sm text-red-600">
                    {errors.firstName.map((error, i) => <div key={i}>{error}</div>)}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    validateField('email', value, { required: true, maxLength: 254 });
                  }}
                  maxLength={254}
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="votre@email.com"
                />
                {errors.email && (
                  <div className="mt-1 text-sm text-red-600">
                    {errors.email.map((error, i) => <div key={i}>{error}</div>)}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Que souhaitez-vous recevoir ?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'actualites', label: 'Actualités', icon: Bell },
                  { key: 'temoignages', label: 'Témoignages', icon: Heart },
                  { key: 'evenements', label: 'Événements', icon: Mail },
                  { key: 'ressources', label: 'Ressources', icon: Shield }
                ].map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[key as keyof typeof preferences]}
                      onChange={() => handlePreferenceChange(key as keyof typeof preferences)}
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>Vos données sont protégées. Désabonnement possible à tout moment.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || hasErrors}
              className={`w-full focus-ring ${
                isSubmitting || hasErrors
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 hover-glow'
              } text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-3`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Abonnement en cours...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 group-hover:animate-wiggle" />
                  <span>S'abonner à la newsletter</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  return null;
};

export default NewsletterSubscription;