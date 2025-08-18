import React from 'react';
import { ArrowRight, Heart } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-slate-400 rounded-full blur-3xl"></div>
      </div>

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-teal-900/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8">
            <Heart className="w-6 h-6 text-emerald-600" />
            <span className="text-slate-700 font-medium">Association d'aide et de soutien</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-8 leading-tight">
          L'association lutte contre les{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            violences conjugales
          </span>
        </h1>
        
        <blockquote className="text-2xl md:text-3xl mb-12 italic font-light leading-relaxed text-slate-600 max-w-4xl mx-auto">
          « La souffrance ne fait pas de distinction et il ne faut pas croire que cela n'arrive qu'aux autres! »
        </blockquote>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center space-x-3">
            <span>CONTACTEZ-NOUS!</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <button className="border-2 border-slate-300 text-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-700 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105">
            En savoir plus
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
            <div className="text-slate-600">Écoute disponible</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">100%</div>
            <div className="text-slate-600">Confidentiel</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">Gratuit</div>
            <div className="text-slate-600">Accompagnement</div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-32 left-16 w-24 h-24 bg-emerald-200/30 rounded-full animate-pulse"></div>
      <div className="absolute bottom-40 right-20 w-20 h-20 bg-teal-200/30 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-8 w-16 h-16 bg-slate-200/30 rounded-full animate-pulse delay-500"></div>
    </section>
  );
};

export default Hero;