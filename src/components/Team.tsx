import React from 'react';
import { User, Mail, Phone } from 'lucide-react';

const Team: React.FC = () => {
  const teamMembers = [
    {
      name: 'Suzy POKA',
      role: 'Présidente',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50',
      description: 'Dirige l\'association avec passion et dévouement'
    },
    {
      name: 'Christelle YOUETO',
      role: 'Secrétaire',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      description: 'Gère les communications et l\'administration'
    },
    {
      name: 'Florence NOUMO',
      role: 'Avocate',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      description: 'Apporte son expertise juridique aux victimes'
    },
    {
      name: 'Mariette KOM',
      role: 'Trésorière',
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      description: 'Assure la gestion financière de l\'association'
    }
  ];

  return (
    <section id="team" className="py-24 bg-gradient-to-br from-white via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Content */}
          <div className="animate-slide-in-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <User className="w-4 h-4" />
              <span>Nos experts</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-8">
              Notre équipe
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 mb-8 rounded-full animate-glow"></div>
            
            <div className="prose prose-lg text-slate-600 leading-relaxed space-y-6">
              <p>
                Notre équipe dévouée est le cœur de notre organisation. Chaque membre apporte des compétences uniques et une passion commune pour l'aide aux autres.
              </p>
              <p>
                Ensemble, nous créons un environnement favorable où chacun se sent valorisé et compris. Nous sommes là pour vous guider sur le chemin de la guérison.
              </p>
            </div>

            <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100 hover-lift animate-scale-in delay-600">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center animate-heartbeat">
                  <Phone className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Contactez notre équipe</div>
                  <div className="text-sm text-slate-600">Disponible 24h/24 pour vous accompagner</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-in-right">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className={`group bg-gradient-to-br ${member.bgColor} rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 text-center border border-white/50 hover-tilt animate-scale-in delay-${index * 200}`}
              >
                <div className={`w-24 h-24 bg-gradient-to-r ${member.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg animate-bounce-gentle delay-${index * 300}`}>
                  <User className="w-12 h-12 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                  {member.name}
                </h3>
                
                <p className={`text-sm font-semibold bg-gradient-to-r ${member.color} bg-clip-text text-transparent mb-4`}>
                  {member.role}
                </p>

                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {member.description}
                </p>

                <button className="group/btn flex items-center justify-center space-x-2 text-slate-600 hover:text-slate-800 mx-auto transition-all duration-300 hover:scale-110">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Contacter</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/50 max-w-4xl mx-auto hover-lift animate-slide-up delay-800">
            <h3 className="text-3xl font-bold text-slate-800 mb-6">
              Rejoignez notre mission
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Vous souhaitez contribuer à notre cause ? Nous recherchons toujours des bénévoles passionnés pour nous aider dans notre mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact#contact-form"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover-glow animate-slide-in-left delay-1000"
              >
                Devenir bénévole
              </a>
              <a 
                href="https://www.helloasso.com/associations/christ-le-bon-berger-c-l-b-b/formulaires/1"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover-glow animate-slide-in-right delay-1200"
              >
                Faire un don
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;