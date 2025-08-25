import React from 'react';
import { TrendingUp, AlertTriangle, Users } from 'lucide-react';

const Statistics: React.FC = () => {
  const stats = [
    {
      percentage: '69%',
      label: 'Violences physiques',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100',
      iconColor: 'text-red-600'
    },
    {
      percentage: '4%',
      label: 'Violences sexuelles',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      percentage: '27%',
      label: 'Autres types de violences',
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      iconColor: 'text-emerald-600'
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-48 h-48 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-teal-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 md:w-56 md:h-56 lg:w-72 lg:h-72 bg-slate-300 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Separator Line */}
        <div className="flex items-center justify-center mb-12 md:mb-16 lg:mb-20">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
          <div className="px-6">
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
        </div>

        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-emerald-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg border border-emerald-200">
            <TrendingUp className="w-4 h-4" />
            <span>Statistiques importantes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-4 md:mb-6 px-4">
            Les chiffres qui parlent
          </h2>
          <div className="w-16 md:w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full mb-6 md:mb-8"></div>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-4">
            Ces statistiques révèlent l'ampleur du problème des violences conjugales et l'importance de notre mission d'accompagnement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`group bg-gradient-to-br ${stat.bgColor} rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105 border border-white/50 ${
                index === 2 && 'md:col-span-2 lg:col-span-1 md:mx-auto md:max-w-sm lg:max-w-none lg:mx-0'
              }`}
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 bg-white/80 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.iconColor}`} />
              </div>
              
              <div className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {stat.percentage}
              </div>
              
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 mb-3 md:mb-4 leading-tight">
                {stat.label}
              </h3>
              
              <div className={`w-full h-2 bg-gradient-to-r ${stat.color} rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-100 max-w-4xl mx-auto">
            <p className="text-base md:text-lg text-slate-700 leading-relaxed">
              <strong className="text-slate-800">Chaque statistique représente une personne</strong> qui a besoin d'aide et de soutien. 
              Notre association s'engage à être présente pour chacune d\'entre elles, sans exception.
            </p>
            <div className="mt-6 pt-4 border-t border-emerald-200">
              <p className="text-sm text-slate-600">
                <strong>Source :</strong>{' '}
                <a 
                  href="https://www.vie-publique.fr/en-bref/291834-violences-conjugales-en-2022-86-de-femmes-victimes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 underline transition-colors duration-300"
                >
                  Vie Publique - Violences conjugales en 2022
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;