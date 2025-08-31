import React, { useState, useEffect } from 'react';
import { Play, Download, FileText, Image, Video, Music, Search, Filter, Calendar, Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MediaItem {
  id: number;
  type: 'video' | 'document' | 'audio' | 'image';
  title: string;
  description: string;
  thumbnail: string;
  duration?: string;
  pages?: number;
  date: string;
  category: string;
  views?: number;
  downloads?: number;
  url?: string;
  youtubeId?: string;
  fileName?: string;
}

const MediathequePage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const mediaItems: MediaItem[] = [
    {
      id: 1,
      type: 'video',
      title: 'Témoignage de Marie - Sortir du cycle de la violence',
      description: 'Un témoignage poignant sur le parcours de reconstruction après des violences conjugales. Marie partage son expérience et les étapes qui l\'ont menée vers la liberté.',
      thumbnail: 'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '12:34',
      date: '2024-01-15',
      category: 'Témoignages',
      views: 1250,
      youtubeId: 'dQw4w9WgXcQ' // Exemple d'ID YouTube
    },
    {
      id: 2,
      type: 'document',
      title: 'Guide pratique - Reconnaître les signes de violence',
      description: 'Document complet pour identifier les différents types de violences conjugales : physiques, psychologiques, économiques et sexuelles. Inclut des conseils pratiques et des ressources.',
      thumbnail: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=400',
      pages: 24,
      date: '2024-01-10',
      category: 'Guides',
      downloads: 890,
      url: 'https://www.pdf24.org/pdf/sample.pdf' // Exemple de PDF
    },
    {
      id: 3,
      type: 'audio',
      title: 'Podcast - Reconstruire sa confiance en soi',
      description: 'Épisode dédié aux techniques pour retrouver l\'estime de soi après un traumatisme. Avec des conseils pratiques et des exercices de développement personnel.',
      thumbnail: 'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '28:45',
      date: '2024-01-08',
      category: 'Podcasts',
      views: 675,
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Exemple d'audio
    },
    {
      id: 4,
      type: 'video',
      title: 'Conférence - Les droits des victimes',
      description: 'Présentation complète des droits légaux et des recours disponibles pour les victimes de violences conjugales. Animée par notre avocate Florence NOUMO.',
      thumbnail: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '45:12',
      date: '2024-01-05',
      category: 'Formations',
      views: 2100,
      youtubeId: 'dQw4w9WgXcQ' // Exemple d'ID YouTube
    },
    {
      id: 5,
      type: 'document',
      title: 'Brochure - Numéros d\'urgence et contacts utiles',
      description: 'Liste complète des numéros d\'urgence et organisations d\'aide disponibles en France. Document à imprimer et garder à portée de main.',
      thumbnail: 'https://images.pexels.com/photos/4226769/pexels-photo-4226769.jpeg?auto=compress&cs=tinysrgb&w=400',
      pages: 8,
      date: '2024-01-03',
      category: 'Ressources',
      downloads: 1500,
      url: 'https://www.pdf24.org/pdf/sample.pdf' // Exemple de PDF
    },
    {
      id: 6,
      type: 'image',
      title: 'Infographie - Statistiques sur les violences conjugales',
      description: 'Données visuelles sur l\'ampleur des violences conjugales en France et dans le monde. Chiffres officiels 2024.',
      thumbnail: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=400',
      date: '2024-01-01',
      category: 'Statistiques',
      views: 980,
      url: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=1200'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tout', icon: Filter },
    { id: 'video', name: 'Vidéos', icon: Video },
    { id: 'document', name: 'Documents', icon: FileText },
    { id: 'audio', name: 'Audio', icon: Music },
    { id: 'image', name: 'Images', icon: Image }
  ];

  const filteredItems = mediaItems.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'document': return FileText;
      case 'audio': return Music;
      case 'image': return Image;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'from-red-500 to-red-600';
      case 'document': return 'from-blue-500 to-blue-600';
      case 'audio': return 'from-purple-500 to-purple-600';
      case 'image': return 'from-green-500 to-green-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const handleMediaClick = (item: MediaItem) => {
    // Incrémenter les vues (simulation)
    if (item.views !== undefined) {
      item.views += 1;
    }
    
    // Naviguer vers la page de consultation
    navigate(`/mediatheque/${item.id}`);
  };

  const handleDownload = (item: MediaItem) => {
    if (item.url) {
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.fileName || `${item.title}.${item.type === 'document' ? 'pdf' : item.type === 'audio' ? 'mp3' : 'jpg'}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Incrémenter les téléchargements (simulation)
      if (item.downloads !== undefined) {
        item.downloads += 1;
      }
    }
  };

  // Charger les données depuis le localStorage (gérées par l'admin)
  useEffect(() => {
    const stored = localStorage.getItem('mediatheque_items');
    if (stored) {
      const adminItems = JSON.parse(stored);
      // Filtrer seulement les éléments publiés
      const publishedItems = adminItems.filter((item: any) => item.isPublished);
      // Adapter le format si nécessaire
      const adaptedItems = publishedItems.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        thumbnail: item.thumbnail,
        duration: item.duration,
        pages: item.pages,
        date: item.uploadDate,
        category: item.category,
        views: item.views,
        downloads: item.downloads,
        url: item.url,
        youtubeId: item.youtubeId,
        fileName: item.fileName
      }));
      // Vous pouvez choisir de remplacer complètement ou de fusionner
      // Pour cet exemple, on garde les données statiques et on ajoute les nouvelles
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative min-h-[400px] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/80"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight animate-slide-up">
            MÉDIATHÈQUE
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed animate-slide-up delay-200">
            Ressources, témoignages et outils pour vous accompagner
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-12 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md animate-slide-in-left">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher dans la médiathèque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:shadow-lg focus-ring"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 animate-slide-in-right">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveFilter(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 animate-scale-in delay-${index * 100} ${
                      activeFilter === category.id
                        ? 'bg-emerald-500 text-white shadow-lg hover-glow'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover-lift'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {filteredItems.length} ressource{filteredItems.length > 1 ? 's' : ''} trouvée{filteredItems.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </section>

      {/* Media Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <div 
                  key={item.id}
                  className={`group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-slate-100 overflow-hidden cursor-pointer hover-lift animate-scale-in delay-${index * 100}`}
                  onClick={() => handleMediaClick(item)}
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    
                    {/* Type Badge */}
                    <div className={`absolute top-3 left-3 w-10 h-10 bg-gradient-to-r ${getTypeColor(item.type)} rounded-xl flex items-center justify-center shadow-lg animate-bounce-gentle delay-${index * 200}`}>
                      <TypeIcon className="w-5 h-5 text-white" />
                    </div>

                    {/* Duration/Pages */}
                    {(item.duration || item.pages) && (
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-sm animate-fade-in delay-300">
                        {item.duration || `${item.pages} pages`}
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 animate-bounce-in">
                        {item.type === 'document' ? (
                          <Eye className="w-8 h-8 text-slate-800 ml-1" />
                        ) : (
                          <Play className="w-8 h-8 text-slate-800 ml-1" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        {item.category}
                      </span>
                      <div className="flex items-center space-x-1 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      {item.views && (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{item.views} vues</span>
                        </div>
                      )}
                      {item.downloads && (
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{item.downloads} téléchargements</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMediaClick(item);
                        }}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 hover-glow"
                      >
                        {item.type === 'document' ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>Consulter</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Lire</span>
                          </>
                        )}
                      </button>
                      
                      {(item.type === 'document' || item.type === 'image' || item.type === 'audio') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item);
                          }}
                          className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center hover-lift"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Aucune ressource trouvée</h3>
              <p className="text-slate-600 mb-6">Essayez de modifier vos critères de recherche</p>
              <button 
                onClick={() => {
                  setActiveFilter('all');
                  setSearchTerm('');
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover-glow"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6 animate-slide-up">Ressources recommandées</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto animate-slide-up delay-200">
              Nos contenus les plus utiles pour vous accompagner
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 hover-lift animate-slide-in-left delay-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg animate-heartbeat">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Témoignages vidéo</h3>
                  <p className="text-slate-600">Histoires de reconstruction et d'espoir</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Découvrez les témoignages inspirants de femmes qui ont surmonté les violences conjugales et retrouvé leur liberté.
              </p>
              <button 
                onClick={() => setActiveFilter('video')}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover-glow"
              >
                Voir les témoignages
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 hover-lift animate-slide-in-right delay-400">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-heartbeat delay-500">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Guides pratiques</h3>
                  <p className="text-slate-600">Outils et conseils concrets</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Téléchargez nos guides complets pour comprendre vos droits et les démarches à entreprendre.
              </p>
              <button 
                onClick={() => setActiveFilter('document')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover-glow"
              >
                Télécharger les guides
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-slide-up">
            Besoin d'aide personnalisée ?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed animate-slide-up delay-200">
            Notre équipe est disponible pour vous accompagner et répondre à vos questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact"
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover-lift animate-slide-in-left delay-400"
            >
              Nous contacter
            </a>
            <a 
              href="tel:0781324474"
              className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover-lift animate-slide-in-right delay-500"
            >
              Appeler maintenant
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

// Fonction utilitaire pour trouver un média par ID
export const findMediaById = (id: string): MediaItem | null => {
  const mediaItems: MediaItem[] = [
    {
      id: 1,
      type: 'video',
      title: 'Témoignage de Marie - Sortir du cycle de la violence',
      description: 'Un témoignage poignant sur le parcours de reconstruction après des violences conjugales. Marie partage son expérience et les étapes qui l\'ont menée vers la liberté.',
      thumbnail: 'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '12:34',
      date: '2024-01-15',
      category: 'Témoignages',
      views: 1250,
      youtubeId: 'dQw4w9WgXcQ'
    },
    {
      id: 2,
      type: 'document',
      title: 'Guide pratique - Reconnaître les signes de violence',
      description: 'Document complet pour identifier les différents types de violences conjugales : physiques, psychologiques, économiques et sexuelles. Inclut des conseils pratiques et des ressources.',
      thumbnail: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=400',
      pages: 24,
      date: '2024-01-10',
      category: 'Guides',
      downloads: 890,
      url: 'https://www.pdf24.org/pdf/sample.pdf'
    },
    {
      id: 3,
      type: 'audio',
      title: 'Podcast - Reconstruire sa confiance en soi',
      description: 'Épisode dédié aux techniques pour retrouver l\'estime de soi après un traumatisme. Avec des conseils pratiques et des exercices de développement personnel.',
      thumbnail: 'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '28:45',
      date: '2024-01-08',
      category: 'Podcasts',
      views: 675,
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: 4,
      type: 'video',
      title: 'Conférence - Les droits des victimes',
      description: 'Présentation complète des droits légaux et des recours disponibles pour les victimes de violences conjugales. Animée par notre avocate Florence NOUMO.',
      thumbnail: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '45:12',
      date: '2024-01-05',
      category: 'Formations',
      views: 2100,
      youtubeId: 'dQw4w9WgXcQ'
    },
    {
      id: 5,
      type: 'document',
      title: 'Brochure - Numéros d\'urgence et contacts utiles',
      description: 'Liste complète des numéros d\'urgence et organisations d\'aide disponibles en France. Document à imprimer et garder à portée de main.',
      thumbnail: 'https://images.pexels.com/photos/4226769/pexels-photo-4226769.jpeg?auto=compress&cs=tinysrgb&w=400',
      pages: 8,
      date: '2024-01-03',
      category: 'Ressources',
      downloads: 1500,
      url: 'https://www.pdf24.org/pdf/sample.pdf'
    },
    {
      id: 6,
      type: 'image',
      title: 'Infographie - Statistiques sur les violences conjugales',
      description: 'Données visuelles sur l\'ampleur des violences conjugales en France et dans le monde. Chiffres officiels 2024.',
      thumbnail: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=400',
      date: '2024-01-01',
      category: 'Statistiques',
      views: 980,
      url: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=1200'
    }
  ];

  return mediaItems.find(item => item.id.toString() === id) || null;
};

export default MediathequePage;