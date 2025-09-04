import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  Video, 
  FileText, 
  Image, 
  Music,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Download,
  ExternalLink,
  Save,
  X,
  Youtube,
  File,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from './AdminDashboard';

interface MediaItem {
  id: string;
  type: 'video' | 'document' | 'audio' | 'image';
  title: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  file_url?: string;
  youtube_id?: string;
  file_name?: string;
  file_size?: number;
  duration?: string;
  pages?: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  views_count: number;
  downloads_count: number;
  created_by: string;
}

const MediathequeAdminContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'document' | 'audio' | 'image'>('all');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Formulaire d'ajout/édition
  const [formData, setFormData] = useState({
    type: 'video' as MediaItem['type'],
    title: '',
    description: '',
    category: '',
    youtubeUrl: '',
    file: null as File | null,
    duration: '',
    pages: 0
  });

  useEffect(() => {
    loadMediaItems();
  }, []);

  const loadMediaItems = async () => {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error) {
      console.error('Erreur chargement médias:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des médias' });
    } finally {
      setIsLoading(false);
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const generateThumbnail = (type: string, youtubeId?: string): string => {
    if (type === 'video' && youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
    
    const defaultThumbnails = {
      video: 'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=400',
      document: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=400',
      audio: 'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=400',
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=400'
    };
    
    return defaultThumbnails[type as keyof typeof defaultThumbnails];
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `media/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('media-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!formData.title || !formData.description || !user) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' });
      return;
    }

    try {
      let mediaData: Partial<MediaItem> = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        duration: formData.duration || null,
        pages: formData.pages || null,
        created_by: user.id,
        updated_at: new Date().toISOString()
      };

      // Gestion des vidéos YouTube
      if (formData.type === 'video' && formData.youtubeUrl) {
        const youtubeId = extractYouTubeId(formData.youtubeUrl);
        if (!youtubeId) {
          setMessage({ type: 'error', text: 'URL YouTube invalide' });
          return;
        }
        
        mediaData.youtube_id = youtubeId;
        mediaData.file_url = formData.youtubeUrl;
        mediaData.thumbnail_url = generateThumbnail('video', youtubeId);
      }
      
      // Gestion des fichiers uploadés
      else if (formData.file) {
        const fileUrl = await uploadFile(formData.file);
        mediaData.file_url = fileUrl;
        mediaData.file_name = formData.file.name;
        mediaData.file_size = formData.file.size;
        mediaData.thumbnail_url = generateThumbnail(formData.type);
      } else {
        setMessage({ type: 'error', text: 'Veuillez fournir un fichier ou une URL YouTube' });
        return;
      }

      if (editingItem) {
        // Mise à jour
        const { error } = await supabase
          .from('media_items')
          .update(mediaData)
          .eq('id', editingItem.id);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Média mis à jour avec succès' });
      } else {
        // Création
        const { error } = await supabase
          .from('media_items')
          .insert({
            ...mediaData,
            is_published: true,
            views_count: 0,
            downloads_count: 0
          });

        if (error) throw error;
        setMessage({ type: 'success', text: 'Média ajouté avec succès' });
      }

      resetForm();
      setShowModal(false);
      loadMediaItems();
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la sauvegarde' });
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'video',
      title: '',
      description: '',
      category: '',
      youtubeUrl: '',
      file: null,
      duration: '',
      pages: 0
    });
    setEditingItem(null);
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description,
      category: item.category,
      youtubeUrl: item.file_url || '',
      file: null,
      duration: item.duration || '',
      pages: item.pages || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Média supprimé avec succès' });
      loadMediaItems();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('media_items')
        .update({ 
          is_published: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      setMessage({ 
        type: 'success', 
        text: `Média ${!currentStatus ? 'publié' : 'dépublié'} avec succès` 
      });
      loadMediaItems();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erreur lors de la modification' });
    }
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'document': return FileText;
      case 'audio': return Music;
      case 'image': return Image;
      default: return File;
    }
  };

  const getStats = () => {
    return {
      total: mediaItems.length,
      published: mediaItems.filter(item => item.is_published).length,
      videos: mediaItems.filter(item => item.type === 'video').length,
      documents: mediaItems.filter(item => item.type === 'document').length,
      totalViews: mediaItems.reduce((sum, item) => sum + item.views_count, 0),
      totalDownloads: mediaItems.reduce((sum, item) => sum + item.downloads_count, 0)
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des médias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestion Médiathèque</h1>
          <p className="text-slate-600 mt-2">Administration des ressources multimédia</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 hover-glow"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un média</span>
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border animate-slide-down ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200 mb-8">
        {[
          { id: 'list', label: 'Liste des médias', icon: FileText },
          { id: 'stats', label: 'Statistiques', icon: BarChart3 }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
              activeTab === id
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Liste des médias */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Filtres */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                >
                  <option value="all">Tous les types</option>
                  <option value="video">Vidéos</option>
                  <option value="document">Documents</option>
                  <option value="audio">Audio</option>
                  <option value="image">Images</option>
                </select>
              </div>
              <div className="text-sm text-slate-600">
                {filteredItems.length} élément(s) trouvé(s)
              </div>
            </div>
          </div>

          {/* Grille des médias */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <div key={item.id} className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 animate-scale-in delay-${index * 50}`}>
                  {/* Thumbnail */}
                  <div className="relative h-48 group">
                    <img 
                      src={item.thumbnail_url || generateThumbnail(item.type, item.youtube_id || undefined)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      <div className="w-8 h-8 bg-black/70 rounded-lg flex items-center justify-center animate-bounce-gentle">
                        <TypeIcon className="w-4 h-4 text-white" />
                      </div>
                      {item.youtube_id && (
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center animate-bounce-gentle delay-200">
                          <Youtube className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        item.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                    
                    {(item.duration || item.pages) && (
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {item.duration || `${item.pages} pages`}
                      </div>
                    )}

                    {/* Preview Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <a
                        href={`/mediatheque/${item.id}`}
                        className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 animate-bounce-in"
                      >
                        <Eye className="w-6 h-6 text-slate-800" />
                      </a>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 hover:text-emerald-600 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    {item.category && (
                      <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs mb-3">
                        {item.category}
                      </span>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span>{new Date(item.created_at).toLocaleDateString('fr-FR')}</span>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{item.views_count}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Download className="w-3 h-3" />
                          <span>{item.downloads_count}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors duration-300 hover:scale-110 transform"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors duration-300 hover:scale-110 transform"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <a
                          href={`/mediatheque/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-emerald-600 transition-colors duration-300 hover:scale-110 transform"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <button
                        onClick={() => togglePublish(item.id, item.is_published)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all duration-300 hover:scale-105 ${
                          item.is_published
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {item.is_published ? 'Dépublier' : 'Publier'}
                      </button>
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
              <h3 className="text-xl font-bold text-slate-800 mb-3">Aucun média trouvé</h3>
              <p className="text-slate-600 mb-6">Essayez de modifier vos critères de recherche</p>
              <button 
                onClick={() => {
                  setFilterType('all');
                  setSearchTerm('');
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover-glow"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {/* Statistiques */}
      {activeTab === 'stats' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center animate-bounce-gentle">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total médias</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center animate-bounce-gentle delay-100">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Publiés</p>
                <p className="text-2xl font-bold text-slate-800">{stats.published}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center animate-bounce-gentle delay-200">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Vidéos</p>
                <p className="text-2xl font-bold text-slate-800">{stats.videos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center animate-bounce-gentle delay-300">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Documents</p>
                <p className="text-2xl font-bold text-slate-800">{stats.documents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center animate-bounce-gentle delay-400">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total vues</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalViews}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center animate-bounce-gentle delay-500">
                <Download className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Téléchargements</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalDownloads}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingItem ? 'Modifier le média' : 'Ajouter un média'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors duration-300 hover:scale-110 transform"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                  >
                    <option value="video">Vidéo</option>
                    <option value="document">Document</option>
                    <option value="audio">Audio</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Catégorie *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                    placeholder="Ex: Témoignages, Guides, etc."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                  placeholder="Titre du média"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none focus-ring"
                  placeholder="Description du contenu"
                  required
                />
              </div>

              {/* Options spécifiques aux vidéos */}
              {formData.type === 'video' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      URL YouTube (optionnel)
                    </label>
                    <input
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="text-center text-slate-500 text-sm">ou</div>
                </div>
              )}

              {/* Upload de fichier */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {formData.type === 'video' && formData.youtubeUrl ? 'Fichier (optionnel)' : 'Fichier *'}
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors duration-300 hover:bg-emerald-50/30">
                  <input
                    type="file"
                    onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    className="hidden"
                    id="file-upload"
                    accept={
                      formData.type === 'video' ? 'video/*' :
                      formData.type === 'audio' ? 'audio/*' :
                      formData.type === 'image' ? 'image/*' :
                      '.pdf,.doc,.docx,.txt'
                    }
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 hover:scale-110 transition-transform duration-300" />
                    <p className="text-slate-600">
                      {formData.file ? formData.file.name : 'Cliquez pour sélectionner un fichier'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.type === 'video' ? 'Formats: MP4, AVI, MOV' :
                       formData.type === 'audio' ? 'Formats: MP3, WAV, OGG' :
                       formData.type === 'image' ? 'Formats: JPG, PNG, GIF' :
                       'Formats: PDF, DOC, DOCX, TXT'}
                    </p>
                  </label>
                </div>
              </div>

              {/* Champs additionnels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(formData.type === 'video' || formData.type === 'audio') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Durée</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                      placeholder="Ex: 12:34"
                    />
                  </div>
                )}
                {formData.type === 'document' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre de pages</label>
                    <input
                      type="number"
                      value={formData.pages}
                      onChange={(e) => setFormData(prev => ({ ...prev, pages: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-300 hover:scale-105 transform"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 hover-glow"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingItem ? 'Modifier' : 'Ajouter'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MediathequeAdminPage: React.FC = () => {
  return (
    <AdminDashboard>
      <MediathequeAdminContent />
    </AdminDashboard>
  );
};

export default MediathequeAdminPage;