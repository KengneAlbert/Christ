import React from 'react';
import { ArrowRight, Heart, Shield, Lock, Phone, Clock } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-slate-400 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/30 to-teal-900/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in">
        {/* Hero Image Section */}
        <div className="mb-12 relative">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Femmes se soutenant mutuellement"
                className="w-full h-64 md:h-80 lg:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <p className="text-slate-800 font-medium text-sm md:text-base">
                    "Ensemble, nous brisons le silence et construisons un avenir sans violence"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8 animate-bounce-gentle">
            <Heart className="w-6 h-6 text-emerald-600" />
            <span className="text-slate-700 font-medium">Association d'aide et de soutien</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-8 leading-tight animate-slide-up">
          L'association lutte contre les{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            violences conjugales
          </span>
        </h1>
        
        <blockquote className="text-2xl md:text-3xl mb-12 italic font-light leading-relaxed text-slate-600 max-w-4xl mx-auto animate-slide-up delay-200">
          « La souffrance ne fait pas de distinction et il ne faut pas croire que cela n'arrive qu'aux autres! »
        </blockquote>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up delay-300">
          <button className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl flex items-center space-x-3 animate-pulse-gentle">
            <span>CONTACTEZ-NOUS!</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <button className="border-2 border-slate-300 text-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-700 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            En savoir plus
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-slide-up delay-400">
          <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
            <div className="mb-4 relative">
              <img 
                src="https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Écoute disponible 24/7"
                className="w-20 h-20 rounded-2xl object-cover mx-auto shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mb-2">24/7</div>
            <div className="text-slate-600 font-medium">Écoute disponible</div>
            <div className="text-sm text-slate-500 mt-1">Jour et nuit, nous sommes là</div>
          </div>
          <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
            <div className="mb-4 relative">
              <img 
                src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Confidentialité garantie"
                className="w-20 h-20 rounded-2xl object-cover mx-auto shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mb-2">100%</div>
            <div className="text-slate-600 font-medium">Confidentiel</div>
            <div className="text-sm text-slate-500 mt-1">Vos informations protégées</div>
          </div>
          <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
            <div className="mb-4 relative">
              <img 
                src="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Accompagnement gratuit"
                className="w-20 h-20 rounded-2xl object-cover mx-auto shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mb-2">Gratuit</div>
            <div className="text-slate-600 font-medium">Accompagnement</div>
            <div className="text-sm text-slate-500 mt-1">Sans frais, sans jugement</div>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="mt-12 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-emerald-100 max-w-4xl mx-auto animate-slide-up delay-500 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-start space-x-4">
            <div className="hidden md:block flex-shrink-0">
              <img 
                src="https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Sécurité et protection"
                className="w-24 h-24 rounded-xl object-cover shadow-lg"
              />
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse-gentle">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Votre sécurité avant tout</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Si vous êtes en danger ou surveillé(e), quittez immédiatement ce site. Utilisez un ordinateur sûr ou un téléphone que votre partenaire ne peut pas vérifier.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="tel:17"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105 hover:shadow-lg animate-pulse-gentle"
                >
                  <Phone className="w-4 h-4" />
                  <span>Cliquez pour appeler: 17</span>
                </a>
                <button 
                  onClick={() => {
                    if (confirm('Voulez-vous effacer votre historique de navigation ? Cette action supprimera toutes les traces de votre visite sur ce site.')) {
                      // Effacer l'historique (méthode compatible navigateurs)
                      if (window.history && window.history.replaceState) {
                        window.history.replaceState(null, '', window.location.href);
                      }
                      // Rediriger vers une page neutre
                      window.location.href = 'https://www.google.com';
                    }
                  }}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Cliquez pour effacer l'historique
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-32 left-16 w-24 h-24 bg-emerald-200/40 rounded-full animate-float"></div>
      <div className="absolute bottom-40 right-20 w-20 h-20 bg-teal-200/40 rounded-full animate-float delay-1000"></div>
      <div className="absolute top-1/2 left-8 w-16 h-16 bg-slate-200/40 rounded-full animate-float delay-500"></div>
      <div className="absolute top-20 right-32 w-12 h-12 bg-emerald-300/30 rounded-full animate-bounce-gentle delay-700"></div>
      <div className="absolute bottom-20 left-32 w-14 h-14 bg-teal-300/30 rounded-full animate-bounce-gentle delay-300"></div>
    </section>
  );
};

export default Hero;