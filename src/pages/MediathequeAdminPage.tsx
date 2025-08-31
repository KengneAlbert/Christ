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
  File
} from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'video' | 'document' | 'audio' | 'image';
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  url?: string; // Pour les liens YouTube ou fichiers uploadés
  youtubeId?: string; // ID YouTube extrait
  fileName?: string; // Nom du fichier uploadé
  fileSize?: number; // Taille du fichier
  duration?: string; // Pour vidéos/audio
  pages?: number; // Pour documents
  uploadDate: string;
  isPublished: boolean;
  views: number;
  downloads: number;
}

const MediathequeAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'stats'>('list');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'document' | 'audio' | 'image'>('all');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const loadMediaItems = () => {
    const stored = localStorage.getItem('mediatheque_items');
    if (stored) {
      setMediaItems(JSON.parse(stored));
    }
  };

  const saveMediaItems = (items: MediaItem[]) => {
    localStorage.setItem('mediatheque_items', JSON.stringify(items));
    setMediaItems(items);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    let newItem: MediaItem;
    
    if (formData.type === 'video' && formData.youtubeUrl) {
      const youtubeId = extractYouTubeId(formData.youtubeUrl);
      if (!youtubeId) {
        alert('URL YouTube invalide');
        return;
      }
      
      newItem = {
        id: editingItem?.id || Date.now().toString(),
        type: formData.type,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        url: formData.youtubeUrl,
        youtubeId,
        thumbnail: generateThumbnail('video', youtubeId),
        duration: formData.duration,
        uploadDate: editingItem?.uploadDate || new Date().toISOString(),
        isPublished: true,
        views: editingItem?.views || 0,
        downloads: editingItem?.downloads || 0
      };
    } else if (formData.file) {
      // Simulation d'upload de fichier
      const fileUrl = URL.createObjectURL(formData.file);
      
      newItem = {
        id: editingItem?.id || Date.now().toString(),
        type: formData.type,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        url: fileUrl,
        fileName: formData.file.name,
        fileSize: formData.file.size,
        thumbnail: generateThumbnail(formData.type),
        duration: formData.type === 'video' || formData.type === 'audio' ? formData.duration : undefined,
        pages: formData.type === 'document' ? formData.pages : undefined,
        uploadDate: editingItem?.uploadDate || new Date().toISOString(),
        isPublished: true,
        views: editingItem?.views || 0,
        downloads: editingItem?.downloads || 0
      };
    } else {
      alert('Veuillez fournir un fichier ou une URL YouTube');
      return;
    }

    if (editingItem) {
      const updatedItems = mediaItems.map(item => 
        item.id === editingItem.id ? newItem : item
      );
      saveMediaItems(updatedItems);
    } else {
      saveMediaItems([...mediaItems, newItem]);
    }

    resetForm();
    setShowModal(false);
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
      youtubeUrl: item.url || '',
      file: null,
      duration: item.duration || '',
      pages: item.pages || 0
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      const updatedItems = mediaItems.filter(item => item.id !== id);
      saveMediaItems(updatedItems);
    }
  };

  const togglePublish = (id: string) => {
    const updatedItems = mediaItems.map(item =>
      item.id === id ? { ...item, isPublished: !item.isPublished } : item
    );
    saveMediaItems(updatedItems);
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
      published: mediaItems.filter(item => item.isPublished).length,
      videos: mediaItems.filter(item => item.type === 'video').length,
      documents: mediaItems.filter(item => item.type === 'document').length,
      totalViews: mediaItems.reduce((sum, item) => sum + item.views, 0),
      totalDownloads: mediaItems.reduce((sum, item) => sum + item.downloads, 0)
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Gestion Médiathèque</h1>
              <p className="text-slate-600 mt-2">Administration des ressources multimédia</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter un média</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
          {[
            { id: 'list', label: 'Liste des médias', icon: FileText },
            { id: 'stats', label: 'Statistiques', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              {filteredItems.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Thumbnail */}
                    <div className="relative h-48">
                      <img 
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex items-center space-x-2">
                        <div className="w-8 h-8 bg-black/70 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-4 h-4 text-white" />
                        </div>
                        {item.youtubeId && (
                          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <Youtube className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          item.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isPublished ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                      {(item.duration || item.pages) && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {item.duration || `${item.pages} pages`}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      {item.category && (
                        <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs mb-3">
                          {item.category}
                        </span>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <span>{new Date(item.uploadDate).toLocaleDateString('fr-FR')}</span>
                        <div className="flex items-center space-x-3">
                          <span>{item.views} vues</span>
                          <span>{item.downloads} téléch.</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => togglePublish(item.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            item.isPublished
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {item.isPublished ? 'Dépublier' : 'Publier'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistiques */}
        {activeTab === 'stats' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total médias</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Publiés</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.published}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Vidéos</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.videos}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Documents</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.documents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total vues</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalViews}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
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
      </div>

      {/* Modal d'ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingItem ? 'Modifier le média' : 'Ajouter un média'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
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
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
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
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="text-center text-slate-500">ou</div>
                </div>
              )}

              {/* Upload de fichier */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {formData.type === 'video' && formData.youtubeUrl ? 'Fichier (optionnel)' : 'Fichier *'}
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
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
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600">
                      {formData.file ? formData.file.name : 'Cliquez pour sélectionner un fichier'}
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
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
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

export default MediathequeAdminPage;