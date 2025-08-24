import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Shield, Eye, BarChart3, Check } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Toujours activé
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      // Délai pour laisser la page se charger
      setTimeout(() => setShowBanner(true), 5000);
    } else {
      // Charger les préférences sauvegardées
      const savedPreferences = JSON.parse(cookieConsent);
      setPreferences(savedPreferences);
      applyCookieSettings(savedPreferences);
    }
  }, []);

  const applyCookieSettings = (prefs: CookiePreferences) => {
    // Appliquer les paramètres de cookies selon les préférences
    if (prefs.analytics) {
      // Activer Google Analytics ou autres outils d'analyse
      console.log('Analytics cookies enabled');
    }
    
    if (prefs.marketing) {
      // Activer les cookies marketing/publicitaires
      console.log('Marketing cookies enabled');
    }
    
    if (prefs.functional) {
      // Activer les cookies fonctionnels (chat, préférences, etc.)
      console.log('Functional cookies enabled');
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    applyCookieSettings(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    
    setPreferences(onlyNecessary);
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary));
    applyCookieSettings(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    applyCookieSettings(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const cookieTypes = [
    {
      key: 'necessary' as keyof CookiePreferences,
      title: 'Cookies nécessaires',
      description: 'Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      required: true
    },
    {
      key: 'functional' as keyof CookiePreferences,
      title: 'Cookies fonctionnels',
      description: 'Ces cookies permettent d\'améliorer les fonctionnalités du site (chat, préférences utilisateur).',
      icon: Settings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      required: false
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      title: 'Cookies analytiques',
      description: 'Ces cookies nous aident à comprendre comment vous utilisez notre site pour l\'améliorer.',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      required: false
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      title: 'Cookies marketing',
      description: 'Ces cookies sont utilisés pour vous proposer du contenu et des publicités pertinents.',
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      required: false
    }
  ];

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-6 right-6 z-50 max-w-sm">
        <div className="animate-slide-up">
          {!showSettings ? (
            /* Banner principal */
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
                <button
                  onClick={handleRejectAll}
                  className="w-8 h-8 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                🍪 Cookies
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Nous utilisons des cookies pour améliorer votre expérience. Vos données sont sécurisées et conformes au RGPD.
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={handleAcceptAll}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm"
                >
                  Accepter tous
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex-1 text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg font-medium transition-colors duration-300 text-sm flex items-center justify-center space-x-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Options</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Panneau de paramètres détaillés */
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 max-h-[70vh] overflow-hidden w-80">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-6 h-6" />
                    <h3 className="text-lg font-bold">Paramètres</h3>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-white/90 mt-2 text-sm">
                  Choisissez les types de cookies que vous souhaitez autoriser
                </p>
              </div>

              {/* Content */}
              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="space-y-6">
                  {cookieTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.key} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-start space-x-4">
                          <div className={`w-8 h-8 ${type.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${type.color}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-slate-800">
                                {type.title}
                              </h4>
                              <div className="flex items-center">
                                {type.required ? (
                                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    Obligatoire
                                  </span>
                                ) : (
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={preferences[type.key]}
                                      onChange={() => handlePreferenceChange(type.key)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                  </label>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-600 text-xs leading-relaxed">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 p-4 bg-slate-50/50">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg font-medium transition-colors duration-300 text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm flex items-center justify-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Sauvegarder</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CookieConsent;