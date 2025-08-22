import React from 'react';
import { Shield, Users, Award, CheckCircle, Heart, Lock } from 'lucide-react';

const TrustBanner: React.FC = () => {
  const trustElements = [
    {
      icon: Shield,
      title: 'Professionnels formés',
      description: 'Équipe spécialisée dans l\'accompagnement des victimes',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Users,
      title: 'Communauté bienveillante',
      description: 'Plus de 500 personnes accompagnées avec succès',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Award,
      title: 'Reconnue officiellement',
      description: 'Association agréée et partenaire institutionnel',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Lock,
      title: 'Données sécurisées',
      description: 'Protocoles de sécurité renforcés pour votre protection',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const testimonials = [
    {
      text: "Grâce à cette association, j'ai retrouvé confiance en moi et ma liberté.",
      author: "Marie, 34 ans",
      location: "Paris"
    },
    {
      text: "L'écoute bienveillante m'a permis de sortir de l'isolement.",
      author: "Sophie, 28 ans", 
      location: "Lyon"
    },
    {
      text: "Un accompagnement professionnel qui m'a sauvé la vie.",
      author: "Claire, 41 ans",
      location: "Marseille"
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-teal-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Trust Elements */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>Votre confiance, notre priorité</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Pourquoi nous faire confiance ?
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {trustElements.map((element, index) => (
            <div 
              key={index}
              className="group bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-slate-100"
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${element.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <element.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">{element.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{element.description}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-12 border border-emerald-100">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">Témoignages anonymes</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Des femmes qui ont retrouvé leur liberté grâce à notre accompagnement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-white/50"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                    <Heart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <CheckCircle key={i} className="w-4 h-4 text-emerald-500" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-slate-700 italic mb-4 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                <div className="text-sm text-slate-500">
                  <div className="font-medium">{testimonial.author}</div>
                  <div>{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Reminder */}
        <div className="mt-16 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-3">Rappel important sur votre sécurité</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-700">
                <div>
                  <h4 className="font-semibold mb-2">Navigation sécurisée :</h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Utilisez un ordinateur sûr</li>
                    <li>• Naviguez en mode privé</li>
                    <li>• Effacez votre historique</li>
                    <li>• Fermez tous les onglets</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">En cas de danger immédiat :</h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Appelez le 17 (Police)</li>
                    <li>• Appelez le 15 (SAMU)</li>
                    <li>• Appelez le 3919 (Info violences)</li>
                    <li>• Quittez immédiatement ce site</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;