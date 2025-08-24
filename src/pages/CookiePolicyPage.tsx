import React from 'react';
import { Cookie, Shield, Eye, BarChart3, Settings, Clock, Globe, Lock } from 'lucide-react';
import { useCookieConsent } from '../services/cookieService';

const CookiePolicyPage: React.FC = () => {
  const { preferences, updatePreferences, resetConsent } = useCookieConsent();

  const cookieTypes = [
    {
      title: 'Cookies strictement nécessaires',
      icon: Shield,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      description: 'Ces cookies sont essentiels au fonctionnement du site web et ne peuvent pas être désactivés dans nos systèmes.',
      examples: [
        'Cookies de session pour maintenir votre connexion',
        'Cookies de sécurité CSRF',
        'Cookies de préférences de langue',
        'Cookies de consentement aux cookies'
      ],
      duration: 'Session ou 1 an',
      required: true
    },
    {
      title: 'Cookies fonctionnels',
      icon: Settings,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      description: 'Ces cookies permettent au site web de fournir des fonctionnalités et une personnalisation améliorées.',
      examples: [
        'Préférences d\'affichage (thème, taille de police)',
        'Historique du chat d\'assistance',
        'Préférences de notification',
        'Contenu personnalisé'
      ],
      duration: '1 an',
      required: false
    },
    {
      title: 'Cookies analytiques',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      description: 'Ces cookies nous permettent de compter les visites et les sources de trafic afin d\'améliorer les performances de notre site.',
      examples: [
        'Google Analytics pour mesurer l\'audience',
        'Statistiques de pages visitées',
        'Temps passé sur le site',
        'Parcours utilisateur anonymisé'
      ],
      duration: '2 ans',
      required: false
    },
    {
      title: 'Cookies marketing',
      icon: Eye,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      description: 'Ces cookies sont utilisés pour suivre les visiteurs sur les sites web afin d\'afficher des publicités pertinentes.',
      examples: [
        'Publicités ciblées sur les réseaux sociaux',
        'Remarketing et retargeting',
        'Mesure de l\'efficacité publicitaire',
        'Partage sur les réseaux sociaux'
      ],
      duration: '1 an',
      required: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Cookie className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Politique des Cookies
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Transparence totale sur l'utilisation des cookies sur notre site
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Qu'est-ce qu'un cookie ?</h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              Un cookie est un petit fichier texte stocké sur votre ordinateur, tablette ou smartphone lorsque vous visitez un site web. 
              Les cookies nous permettent de reconnaître votre appareil et de stocker certaines informations sur vos préférences ou actions passées.
            </p>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 mb-12">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-800">Notre engagement</h3>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Nous respectons votre vie privée et nous nous engageons à être transparents sur l'utilisation des cookies. 
                Vous avez le contrôle total sur les cookies que vous acceptez, à l'exception de ceux strictement nécessaires au fonctionnement du site.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Types de cookies */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Types de cookies utilisés</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Voici les différents types de cookies que nous utilisons et leur finalité
            </p>
          </div>

          <div className="space-y-8">
            {cookieTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <div key={index} className={`bg-gradient-to-br ${type.bgColor} rounded-3xl p-8 border border-white/50 shadow-lg`}>
                  <div className="flex items-start space-x-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-slate-800">{type.title}</h3>
                        {type.required ? (
                          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                            Obligatoire
                          </span>
                        ) : (
                          <span className="bg-white/80 text-slate-600 px-3 py-1 rounded-full text-sm">
                            Optionnel
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-700 leading-relaxed mb-6">
                        {type.description}
                      </p>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span>Exemples d'utilisation :</span>
                          </h4>
                          <ul className="space-y-2">
                            {type.examples.map((example, exampleIndex) => (
                              <li key={exampleIndex} className="flex items-start space-x-2 text-slate-600">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm">{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Durée de conservation :</span>
                          </h4>
                          <p className="text-slate-600 text-sm bg-white/60 rounded-lg p-3">
                            {type.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gestion des cookies */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Gérer vos préférences</h2>
            <p className="text-xl text-slate-600">
              Vous pouvez modifier vos préférences de cookies à tout moment
            </p>
          </div>

          {preferences && (
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-3xl p-8 border border-emerald-100 mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Vos préférences actuelles :</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${preferences.necessary ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Cookies nécessaires</span>
                  </div>
                  <span className="text-sm">Toujours activés</span>
                </div>
                <div className={`p-4 rounded-xl ${preferences.functional ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Cookies fonctionnels</span>
                  </div>
                  <span className="text-sm">{preferences.functional ? 'Activés' : 'Désactivés'}</span>
                </div>
                <div className={`p-4 rounded-xl ${preferences.analytics ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="font-medium">Cookies analytiques</span>
                  </div>
                  <span className="text-sm">{preferences.analytics ? 'Activés' : 'Désactivés'}</span>
                </div>
                <div className={`p-4 rounded-xl ${preferences.marketing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">Cookies marketing</span>
                  </div>
                  <span className="text-sm">{preferences.marketing ? 'Activés' : 'Désactivés'}</span>
                </div>
              </div>
              
              <button
                onClick={resetConsent}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Modifier mes préférences
              </button>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-800">Contrôle depuis votre navigateur</h3>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              Vous pouvez également gérer les cookies directement depuis votre navigateur :
            </p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Bloquer tous les cookies dans les paramètres de votre navigateur</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Supprimer les cookies existants</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Configurer des exceptions pour certains sites</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Questions sur les cookies ?</h2>
          <p className="text-xl text-white/90 mb-8">
            N'hésitez pas à nous contacter pour toute question concernant notre politique des cookies
          </p>
          <a
            href="/contact"
            className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Nous contacter
          </a>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicyPage;