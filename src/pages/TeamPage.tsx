import React from 'react';
import { User, Mail, Phone, Heart, Shield, Users, Award, Calendar, MapPin } from 'lucide-react';

const TeamPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Suzy POKA',
      role: 'Présidente',
      description: 'Fondatrice de l\'association, elle dirige avec passion et dévouement notre mission d\'aide aux victimes de violences conjugales.',
      expertise: ['Leadership', 'Accompagnement', 'Témoignage'],
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Christelle YOUETO',
      role: 'Secrétaire',
      description: 'Responsable de la gestion administrative et des communications de l\'association, elle assure le bon fonctionnement quotidien.',
      expertise: ['Administration', 'Communication', 'Organisation'],
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Florence NOUMO',
      role: 'Avocate',
      description: 'Experte juridique de l\'association, elle apporte son expertise légale pour accompagner les victimes dans leurs démarches.',
      expertise: ['Droit familial', 'Conseil juridique', 'Procédures'],
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Mariette KOM',
      role: 'Trésorière',
      description: 'Responsable de la gestion financière de l\'association, elle veille à la bonne utilisation des ressources pour notre mission.',
      expertise: ['Gestion financière', 'Comptabilité', 'Budget'],
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Compassion',
      description: 'Une écoute bienveillante et un accompagnement sans jugement'
    },
    {
      icon: Shield,
      title: 'Protection',
      description: 'Défendre et protéger les droits des victimes avec détermination'
    },
    {
      icon: Users,
      title: 'Solidarité',
      description: 'Créer un environnement de soutien mutuel et d\'entraide'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative min-h-[500px] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/80"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            NOTRE ÉQUIPE
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
            Des professionnels dévoués à votre service
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">
            Une équipe unie par une mission commune
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            Notre équipe dévouée est le cœur de notre organisation. Chaque membre apporte des compétences uniques et une passion commune pour l'aide aux autres. Ensemble, nous créons un environnement favorable où chacun se sent valorisé et compris. Nous sommes là pour vous guider sur le chemin de la guérison.
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className={`group bg-gradient-to-br ${member.bgColor} rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-white/50`}
              >
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
                  {/* Photo */}
                  <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg">
                      <img 
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className={`absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-r ${member.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      {member.name}
                    </h3>
                    <p className={`text-lg font-semibold bg-gradient-to-r ${member.color} bg-clip-text text-transparent mb-4`}>
                      {member.role}
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {member.description}
                    </p>

                    {/* Expertise */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Domaines d'expertise :</h4>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {member.expertise.map((skill, skillIndex) => (
                          <span 
                            key={skillIndex}
                            className="px-3 py-1 bg-white/80 text-slate-600 text-sm rounded-full border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex justify-center md:justify-start space-x-3">
                      <button className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center hover:bg-white transition-colors duration-300 shadow-sm">
                        <Mail className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center hover:bg-white transition-colors duration-300 shadow-sm">
                        <Phone className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              Nos valeurs partagées
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Ces valeurs guident chacune de nos actions et unissent notre équipe
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  {value.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-12 shadow-xl border border-emerald-100">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-6">
              Rejoignez notre mission
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Vous souhaitez contribuer à notre cause ? Nous recherchons toujours des bénévoles passionnés pour nous aider dans notre mission d'accompagnement et de soutien.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Devenir bénévole
              </button>
              <button className="border-2 border-slate-300 text-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105">
                En savoir plus
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Team */}
      <section className="py-16 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Phone className="w-8 h-8 text-white" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Contactez notre équipe
            </h2>
          </div>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Notre équipe est disponible pour vous accompagner dans vos démarches et répondre à toutes vos questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:0781324474"
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>07 81 32 44 74</span>
            </a>
            <a 
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Nous écrire</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;