import React from 'react';
import { ArrowRight, Phone, Heart, Shield } from 'lucide-react';
import Fondatrice from "../assets/fondatrice.jpg";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section À propos */}
      <section 
        className="relative min-h-[500px] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-slate-800/70"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            À PROPOS
          </h1>
          <blockquote className="text-2xl md:text-3xl text-white/90 italic font-light leading-relaxed">
            « Je suis le Bon berger, le bon berger donne sa vie pour ses brebis! »
          </blockquote>
        </div>
      </section>

      {/* Motivation de la fondatrice */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Contenu textuel */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                  Motivation de la fondatrice
                </h2>
                <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-8"></div>
              </div>

              <div className="space-y-6 text-slate-600 leading-relaxed">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 italic">
                    Les raisons de la création de l'association
                  </h3>
                  <p>
                    L'association Christ Le Bon Berger est née de mon vécu personnel et de 
                    mon témoignage. À travers les épreuves que j'ai traversées, j'ai compris à 
                    quel point il est essentiel d'être entouré des bonnes personnes lorsque l'on 
                    traverse des moments difficiles. Avoir un soutien sincère, sans jugement, 
                    peut faire toute la différence dans le processus de reconstruction.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 italic">
                    Pourquoi ce nom ?
                  </h3>
                  <p>
                    Nous sommes tous issus d'un même Créateur. Parfois, la vie nous bouscule 
                    et nous éloigne de nos fondations. Il est alors essentiel de revenir aux 
                    sources pour retrouver force, clarté et amour.
                  </p>
                  <p className="mt-4">
                    Nous avons un Dieu qui nous aime inconditionnellement et qui ne demande 
                    qu'à être à nos côtés pour nous soutenir et nous fortifier face aux 
                    épreuves. Cette association est un lieu où chacun peut trouver écoute, 
                    réconfort et accompagnement, guidé par ces valeurs de bienveillance et 
                    de foi.
                  </p>
                </div>
              </div>
            </div>

            {/* Photo de la fondatrice */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={Fondatrice}
                  alt="Fondatrice de l'association"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
              </div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-blue-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-800">Fondatrice</div>
                    <div className="text-sm text-slate-600">Suzy POKA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Contexte */}
      <section className="py-24 bg-slate-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Contexte
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full mb-8"></div>
          </div>

          <div className="space-y-8 text-center max-w-5xl mx-auto">
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed">
              Les violences conjugales englobent toutes formes de violences physiques, sexuelles, psychologiques 
              et économiques au sein du couple, qu'il soit marié ou non.
            </p>
            
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Selon l'OMS, une femme sur trois dans le monde, subit des violences physiques ou sexuelles de la part 
              de leur partenaire intime au cours de leur vie.
            </p>
            
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Le taux de violence conjugale varie selon les régions. Par exemple en France, environ 220000 femmes 
              sont victimes de violences.
            </p>
          </div>
        </div>
      </section>

      {/* Histoire de la création */}
      <section className="py-24 bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Contenu textuel */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                  Histoire de la création
                </h2>
                <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-8"></div>
              </div>

              <div className="space-y-6 text-slate-600 leading-relaxed">
                <p>
                  Il arrive que nous traversions des moments difficiles, mais nous n'osons pas 
                  toujours demander de l'aide. Pour certaines personnes, consulter un 
                  psychologue revient à admettre une souffrance qu'elles préfèrent taire, par 
                  crainte d'être jugées ou perçues comme ayant un trouble mental. Cette peur du 
                  regard des autres pousse de nombreuses personnes à souffrir en silence.
                </p>

                <p>
                  L'association Christ Le Bon Berger est née de cette réalité : offrir un lieu 
                  d'écoute et de réconfort à ceux et celles qui ont besoin de parler, sans crainte 
                  d'être stigmatisés. Dans certaines cultures, notamment en Afrique, aller voir un 
                  psychologue est encore tabou. Beaucoup associent cela à la folie, ce qui 
                  empêche de nombreuses victimes de chercher du soutien et de briser le cycle 
                  de la souffrance.
                </p>

                <p>
                  Moi-même, j'ai longtemps hésité à demander de l'aide. Ayant 
                  subi de nombreuses violences, je me suis enfermée dans le silence, persuadée 
                  que consulter signifiait que j'étais folle – ce qui n'était évidemment pas le cas.
                </p>

                <p>
                  Avec la grâce de Dieu, j'ai trouvé du réconfort et du soutien auprès d'ami(e)s 
                  fidèles qui m'ont aidée à traverser cette épreuve. Grâce à cette expérience et à 
                  l'aide du Seigneur, j'ai pu m'en sortir. Aujourd'hui, à travers cette association, je 
                  veux offrir aux autres ce que j'ai reçu : une oreille attentive, du réconfort et une 
                  main tendue vers l'espoir et la reconstruction.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3">
                  <span>CONTACTEZ-NOUS !</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <div className="flex items-center space-x-3 text-slate-600">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">07 81 32 44 74</span>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-8">
                <img 
                  src="https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Soutien et réconfort"
                  className="w-full h-96 object-cover rounded-2xl"
                />
                <div className="absolute inset-8 bg-gradient-to-t from-slate-900/40 to-transparent rounded-2xl"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-200/30 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-indigo-200/30 rounded-full animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Nos valeurs fondamentales
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Protection',
                description: 'Nous protégeons et défendons les droits des victimes avec bienveillance et sans jugement.',
                gradient: 'from-blue-500 to-indigo-600',
                bgGradient: 'from-blue-50 to-indigo-50'
              },
              {
                icon: Heart,
                title: 'Compassion',
                description: 'Une écoute attentive et un réconfort sincère pour accompagner chaque personne.',
                gradient: 'from-rose-500 to-pink-600',
                bgGradient: 'from-rose-50 to-pink-50'
              },
              {
                icon: Shield,
                title: 'Solidarité',
                description: 'Ensemble, nous brisons le silence et créons un environnement de soutien mutuel.',
                gradient: 'from-emerald-500 to-teal-600',
                bgGradient: 'from-emerald-50 to-teal-50'
              }
            ].map((value, index) => (
              <div 
                key={index} 
                className={`group bg-gradient-to-br ${value.bgGradient} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-white/50`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
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
    </div>
  );
};

export default AboutPage;