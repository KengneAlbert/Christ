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
      setTimeout(() => setShowBanner(true), 2000);
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
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="max-w-4xl mx-auto">
          {!showSettings ? (
            /* Banner principal */
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    Respect de votre vie privée
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Nous utilisons des cookies pour améliorer votre expérience sur notre site, analyser le trafic et personnaliser le contenu. 
                    Vos données sont traitées de manière confidentielle et sécurisée, conformément au RGPD.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Accepter tous les cookies
                    </button>
                    <button
                      onClick={handleRejectAll}
                      className="border-2 border-slate-300 text-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      Refuser tout
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="text-slate-600 hover:text-slate-800 px-6 py-3 rounded-xl font-medium transition-colors duration-300 flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Personnaliser</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Panneau de paramètres détaillés */
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Paramètres des cookies</h3>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-white/90 mt-2">
                  Choisissez les types de cookies que vous souhaitez autoriser
                </p>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-6">
                  {cookieTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.key} className="border border-slate-200 rounded-xl p-4">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 ${type.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-6 h-6 ${type.color}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-slate-800">
                                {type.title}
                              </h4>
                              <div className="flex items-center">
                                {type.required ? (
                                  <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
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
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                  </label>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
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
              <div className="border-t border-slate-200 p-6 bg-slate-50">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-slate-600 hover:text-slate-800 px-6 py-3 rounded-xl font-medium transition-colors duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Sauvegarder mes préférences</span>
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500">
                    En sauvegardant vos préférences, vous acceptez notre{' '}
                    <a href="/privacy" className="text-emerald-600 hover:text-emerald-700 underline">
                      politique de confidentialité
                    </a>
                    {' '}et nos{' '}
                    <a href="/cookies" className="text-emerald-600 hover:text-emerald-700 underline">
                      conditions d'utilisation des cookies
                    </a>
                  </p>
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