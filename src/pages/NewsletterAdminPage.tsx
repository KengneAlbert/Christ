import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  Send, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  BarChart3,
  Download,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Save,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from './AdminDashboard';

interface Subscriber {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  subscription_date: string;
  is_active: boolean;
  preferences: {
    actualites: boolean;
    temoignages: boolean;
    evenements: boolean;
    ressources: boolean;
  };
}

interface Newsletter {
  id: string;
  title: string;
  content: string;
  html_content?: string;
  category: 'actualites' | 'temoignages' | 'evenements' | 'ressources';
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_date?: string;
  sent_date?: string;
  recipients_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const NewsletterAdminContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'subscribers' | 'newsletters' | 'create' | 'stats'>('subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Newsletter creation form
  const [newNewsletter, setNewNewsletter] = useState({
    title: '',
    content: '',
    category: 'actualites' as Newsletter['category']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger les abonnés
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscription_date', { ascending: false });

      if (subscribersError) throw subscribersError;
      setSubscribers(subscribersData || []);

      // Charger les newsletters
      const { data: newslettersData, error: newslettersError } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (newslettersError) throw newslettersError;
      setNewsletters(newslettersData || []);

    } catch (error: any) {
      console.error('Erreur chargement données:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subscriber.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && subscriber.is_active) ||
                         (filterStatus === 'inactive' && !subscriber.is_active);
    return matchesSearch && matchesFilter;
  });

  const handleCreateNewsletter = async () => {
    if (!newNewsletter.title || !newNewsletter.content || !user) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }

    try {
      const { error } = await supabase
        .from('newsletters')
        .insert({
          title: newNewsletter.title,
          content: newNewsletter.content,
          category: newNewsletter.category,
          status: 'draft',
          recipients_count: 0,
          created_by: user.id
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Newsletter créée avec succès' });
      setNewNewsletter({ title: '', content: '', category: 'actualites' });
      setActiveTab('newsletters');
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erreur lors de la création' });
    }
  };

  const handleSendNewsletter = async (newsletter: Newsletter) => {
    try {
      const activeSubscribers = subscribers.filter(sub => 
        sub.is_active && sub.preferences[newsletter.category]
      );

      // Mettre à jour le statut de la newsletter
      const { error } = await supabase
        .from('newsletters')
        .update({
          status: 'sent',
          sent_date: new Date().toISOString(),
          recipients_count: activeSubscribers.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', newsletter.id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Newsletter envoyée à ${activeSubscribers.length} abonnés !` 
      });
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi' });
    }
  };

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Prénom', 'Nom', 'Date d\'abonnement', 'Statut', 'Actualités', 'Témoignages', 'Événements', 'Ressources'],
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.first_name || '',
        sub.last_name || '',
        new Date(sub.subscription_date).toLocaleDateString('fr-FR'),
        sub.is_active ? 'Actif' : 'Inactif',
        sub.preferences.actualites ? 'Oui' : 'Non',
        sub.preferences.temoignages ? 'Oui' : 'Non',
        sub.preferences.evenements ? 'Oui' : 'Non',
        sub.preferences.ressources ? 'Oui' : 'Non'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abonnes_newsletter_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const totalSubscribers = subscribers.length;
    const activeSubscribers = subscribers.filter(sub => sub.is_active).length;
    const totalNewsletters = newsletters.filter(n => n.status === 'sent').length;
    const lastNewsletter = newsletters
      .filter(n => n.sent_date)
      .sort((a, b) => new Date(b.sent_date!).getTime() - new Date(a.sent_date!).getTime())[0];

    return {
      totalSubscribers,
      activeSubscribers,
      inactiveSubscribers: totalSubscribers - activeSubscribers,
      totalNewsletters,
      lastNewsletterDate: lastNewsletter?.sent_date
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestion des Newsletters</h1>
          <p className="text-slate-600 mt-2">Administration des abonnés et envoi des newsletters</p>
        </div>
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
          { id: 'subscribers', label: 'Abonnés', icon: Users },
          { id: 'newsletters', label: 'Newsletters', icon: Mail },
          { id: 'create', label: 'Créer', icon: Plus },
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

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un abonné..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                >
                  <option value="all">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>
              <button
                onClick={exportSubscribers}
                className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover-glow"
              >
                <Download className="w-4 h-4" />
                <span>Exporter CSV</span>
              </button>
            </div>
          </div>

          {/* Subscribers List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-slate-700">Email</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-700">Nom</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-700">Date d'abonnement</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-700">Statut</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-700">Préférences</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSubscribers.map((subscriber, index) => (
                    <tr key={subscriber.id} className={`hover:bg-slate-50 transition-colors duration-200 animate-slide-up delay-${index * 50}`}>
                      <td className="px-6 py-4 text-slate-800 font-medium">{subscriber.email}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {subscriber.first_name || subscriber.last_name 
                          ? `${subscriber.first_name || ''} ${subscriber.last_name || ''}`.trim()
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(subscriber.subscription_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          subscriber.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscriber.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(subscriber.preferences).map(([key, value]) => (
                            value && (
                              <span key={key} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs">
                                {key}
                              </span>
                            )
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Newsletters Tab */}
      {activeTab === 'newsletters' && (
        <div className="space-y-6">
          {newsletters.map((newsletter, index) => (
            <div key={newsletter.id} className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 animate-slide-up delay-${index * 100}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-800 hover:text-emerald-600 transition-colors duration-300">
                      {newsletter.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      newsletter.status === 'sent' ? 'bg-green-100 text-green-800' :
                      newsletter.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {newsletter.status === 'sent' ? 'Envoyée' :
                       newsletter.status === 'scheduled' ? 'Programmée' : 'Brouillon'}
                    </span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs">
                      {newsletter.category}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-4 line-clamp-2">{newsletter.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Créée le {new Date(newsletter.created_at).toLocaleDateString('fr-FR')}</span>
                    </span>
                    {newsletter.sent_date && (
                      <span className="flex items-center space-x-1">
                        <Send className="w-4 h-4" />
                        <span>Envoyée le {new Date(newsletter.sent_date).toLocaleDateString('fr-FR')}</span>
                      </span>
                    )}
                    {newsletter.recipients_count > 0 && (
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{newsletter.recipients_count} destinataires</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors duration-300 hover:scale-110 transform">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors duration-300 hover:scale-110 transform">
                    <Edit className="w-4 h-4" />
                  </button>
                  {newsletter.status === 'draft' && (
                    <button
                      onClick={() => handleSendNewsletter(newsletter)}
                      className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm transition-all duration-300 hover:scale-105 shadow-lg hover-glow"
                    >
                      <Send className="w-3 h-3" />
                      <span>Envoyer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Newsletter Tab */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Créer une nouvelle newsletter</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Titre *</label>
              <input
                type="text"
                value={newNewsletter.title}
                onChange={(e) => setNewNewsletter(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                placeholder="Titre de la newsletter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Catégorie *</label>
              <select
                value={newNewsletter.category}
                onChange={(e) => setNewNewsletter(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
              >
                <option value="actualites">Actualités</option>
                <option value="temoignages">Témoignages</option>
                <option value="evenements">Événements</option>
                <option value="ressources">Ressources</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contenu *</label>
              <textarea
                rows={12}
                value={newNewsletter.content}
                onChange={(e) => setNewNewsletter(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none focus-ring"
                placeholder="Contenu de la newsletter..."
              />
            </div>
            <button
              onClick={handleCreateNewsletter}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover-glow flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Créer la newsletter</span>
            </button>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center animate-bounce-gentle">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total abonnés</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalSubscribers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center animate-bounce-gentle delay-100">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Abonnés actifs</p>
                <p className="text-2xl font-bold text-slate-800">{stats.activeSubscribers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center animate-bounce-gentle delay-200">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Newsletters envoyées</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalNewsletters}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center animate-bounce-gentle delay-300">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Dernière newsletter</p>
                <p className="text-sm font-medium text-slate-800">
                  {stats.lastNewsletterDate 
                    ? new Date(stats.lastNewsletterDate).toLocaleDateString('fr-FR')
                    : 'Aucune'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NewsletterAdminPage: React.FC = () => {
  return (
    <AdminDashboard>
      <NewsletterAdminContent />
    </AdminDashboard>
  );
};

export default NewsletterAdminPage;