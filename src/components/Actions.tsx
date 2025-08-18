import React from 'react';
import { UserCheck, Compass, Calendar, ArrowRight } from 'lucide-react';

const Actions: React.FC = () => {
  const actions = [
    {
      icon: UserCheck,
      title: 'Accueil personnalisé',
      description: 'Nous vous offrons un soutien personnalisé pour reconstruire votre vie avec compassion et compréhension.',
      features: ['Écoute bienveillante', 'Accompagnement individuel', 'Suivi personnalisé'],
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50'
    },
    {
      icon: Compass,
      title: "Guide d'orientation",
      description: 'Nous vous guidons pour trouver les meilleures solutions à votre problème.',
      features: ['Orientation juridique', 'Ressources disponibles', 'Démarches administratives'],
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      icon: Calendar,
      title: 'Évènements',
      description: 'Réunions, Conférences, Groupes de paroles...',
      features: ['Réunions', 'Conférences', 'Groupes de paroles'],
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50'
    }
  ];

  return (
    <section id="actions" className="py-24 bg-slate-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-slate-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <UserCheck className="w-4 h-4" />
            <span>Nos services</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Nos actions
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full"></div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mt-8 leading-relaxed">
            Nous proposons un accompagnement complet et personnalisé pour vous aider à retrouver votre autonomie et votre sérénité.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {actions.map((action, index) => (
            <div 
              key={index} 
              className="group bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-3xl p-8 hover:border-slate-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:bg-slate-700/70"
            >
              <div className={`w-20 h-20 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <action.icon className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold mb-6 group-hover:text-emerald-300 transition-colors duration-300">
                {action.title}
              </h3>
              
              <p className="text-slate-300 leading-relaxed mb-8">
                {action.description}
              </p>

              <ul className="space-y-3 mb-8">
                {action.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3 text-slate-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="group/btn flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-300">
                <span>En savoir plus</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Besoin d'aide immédiate ?</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Notre équipe est disponible pour vous accompagner dans vos démarches. N'hésitez pas à nous contacter.
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Contactez-nous maintenant
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Actions;