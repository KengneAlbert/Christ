import React from 'react';
import { Quote, ExternalLink, Calendar, Newspaper } from 'lucide-react';
import NewsletterSubscription from './NewsletterSubscription';

const News: React.FC = () => {
  const newsItems = [
    {
      source: 'Le monde.fr',
      title: 'Coalition féministe (novembre 2024)',
      excerpt: 'Une coalition de soixante organisations féministes a présenté une plateforme de 140 propositions pour lutter contre les violences sexistes et sexuelles, critiquant les moyens insuffisants et la réponse judiciaire inadéquate face à ces violences.',
      url: 'https://www.lemonde.fr/societe/article/2024/09/27/le-proces-des-viols-de-mazan-un-tournant-historique_6335880_3224.html?utm_source=chatgpt.com',
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'from-emerald-50 to-teal-50',
      date: 'Novembre 2024'
    },
    {
      source: 'France 24',
      title: 'Les chiffres parlent d\'eux-mêmes',
      excerpt: 'de 112 articles mentionnant un « féminicide » en 2017, ce nombre est passé à plus de 3 200 en 2022. « Cette hausse reflète une meilleure reconnaissance des meurtres de femmes comme un phénomène social systémique et non plus comme un fait divers isolé », explique Clémentine Chauvbrac, membre de #NousToutes.',
      url: 'https://www.france24.com/fr/france/20241119-f%C3%A9minicides-en-france-un-terme-qui-a-%C3%A9volu%C3%A9-justice',
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50',
      date: 'Novembre 2024'
    },
    {
      source: 'France Bleu',
      title: 'Les mécanismes de la violence conjugale',
      excerpt: 'Les mécanismes qui conduisent à la violence conjugale ont tous un point commun : une forme de violence déjà vécue dans l\'enfance. Se défaire de l\'engrenage de la violence conjugale est très complexe pour des victimes déjà très fragilisées',
      url: 'https://www.francebleu.fr/emissions/a-votre-service-par-france-bleu-poitou/violences-conjugales-j-avais-juste-le-droit-de-prendre-des-coups-1059590',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      date: 'Octobre 2024'
    }
  ];

  return (
    <section id="news" className="py-24 bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Newspaper className="w-4 h-4" />
            <span>Dernières nouvelles</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            Actualités
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mt-8 leading-relaxed">
            Restez informés des dernières actualités concernant la lutte contre les violences conjugales et les avancées dans ce domaine.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <article 
              key={index} 
              className={`group bg-gradient-to-br ${item.bgColor} rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-white/50`}
            >
              <div className="flex items-start mb-6">
                <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg`}>
                  <Quote className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">{item.date}</span>
                  </div>
                  <h3 className={`text-sm font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>
                    {item.source}
                  </h3>
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-emerald-600 transition-colors duration-300 leading-tight">
                {item.title}
              </h4>
              
              <p className="text-slate-700 leading-relaxed mb-6 text-sm">
                {item.excerpt}
              </p>
              
              <div className="pt-6 border-t border-white/50">
                <a 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center text-slate-600 hover:text-slate-800 text-sm transition-colors duration-300 font-medium"
                >
                  <span className="mr-2">Lire l'article complet</span>
                  <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Restez informé</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Abonnez-vous à notre newsletter pour recevoir les dernières actualités et informations importantes sur la lutte contre les violences conjugales.
            </p>
            <NewsletterSubscription variant="inline" className="max-w-2xl mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default News;