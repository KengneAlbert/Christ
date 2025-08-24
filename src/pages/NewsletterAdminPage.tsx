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
  Filter
} from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  firstName?: string;
  subscriptionDate: string;
  isActive: boolean;
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
  category: 'actualites' | 'temoignages' | 'evenements' | 'ressources';
  status: 'draft' | 'scheduled' | 'sent';
  createdDate: string;
  sentDate?: string;
  recipients: number;
}

const NewsletterAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'newsletters' | 'create' | 'stats'>('subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Newsletter creation form
  const [newNewsletter, setNewNewsletter] = useState({
    title: '',
    content: '',
    category: 'actualites' as Newsletter['category']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Charger les abonnés
    const storedSubscribers = localStorage.getItem('newsletter_subscribers');
    if (storedSubscribers) {
      setSubscribers(JSON.parse(storedSubscribers));
    }

    // Charger les newsletters
    const storedNewsletters = localStorage.getItem('newsletters_archive');
    if (storedNewsletters) {
      setNewsletters(JSON.parse(storedNewsletters));
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subscriber.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && subscriber.isActive) ||
                         (filterStatus === 'inactive' && !subscriber.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleCreateNewsletter = () => {
    if (!newNewsletter.title || !newNewsletter.content) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const newsletter: Newsletter = {
      id: Date.now().toString(),
      title: newNewsletter.title,
      content: newNewsletter.content,
      category: newNewsletter.category,
      status: 'draft',
      createdDate: new Date().toISOString(),
      recipients: 0
    };

    const updatedNewsletters = [...newsletters, newsletter];
    setNewsletters(updatedNewsletters);
    localStorage.setItem('newsletters_archive', JSON.stringify(updatedNewsletters));

    setNewNewsletter({ title: '', content: '', category: 'actualites' });
    setActiveTab('newsletters');
  };

  const handleSendNewsletter = (newsletter: Newsletter) => {
    const activeSubscribers = subscribers.filter(sub => 
      sub.isActive && sub.preferences[newsletter.category]
    );

    const updatedNewsletter = {
      ...newsletter,
      status: 'sent' as const,
      sentDate: new Date().toISOString(),
      recipients: activeSubscribers.length
    };

    const updatedNewsletters = newsletters.map(n => 
      n.id === newsletter.id ? updatedNewsletter : n
    );

    setNewsletters(updatedNewsletters);
    localStorage.setItem('newsletters_archive', JSON.stringify(updatedNewsletters));

    alert(`Newsletter envoyée à ${activeSubscribers.length} abonnés !`);
  };

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Prénom', 'Date d\'abonnement', 'Statut', 'Actualités', 'Témoignages', 'Événements', 'Ressources'],
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.firstName || '',
        new Date(sub.subscriptionDate).toLocaleDateString('fr-FR'),
        sub.isActive ? 'Actif' : 'Inactif',
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
    const activeSubscribers = subscribers.filter(sub => sub.isActive).length;
    const totalNewsletters = newsletters.filter(n => n.status === 'sent').length;
    const lastNewsletter = newsletters
      .filter(n => n.sentDate)
      .sort((a, b) => new Date(b.sentDate!).getTime() - new Date(a.sentDate!).getTime())[0];

    return {
      totalSubscribers,
      activeSubscribers,
      inactiveSubscribers: totalSubscribers - activeSubscribers,
      totalNewsletters,
      lastNewsletterDate: lastNewsletter?.sentDate
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-800">Gestion des Newsletters</h1>
          <p className="text-slate-600 mt-2">Administration des abonnés et envoi des newsletters</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
          {[
            { id: 'subscribers', label: 'Abonnés', icon: Users },
            { id: 'newsletters', label: 'Newsletters', icon: Mail },
            { id: 'create', label: 'Créer', icon: Plus },
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
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Tous</option>
                    <option value="active">Actifs</option>
                    <option value="inactive">Inactifs</option>
                  </select>
                </div>
                <button
                  onClick={exportSubscribers}
                  className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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
                      <th className="text-left px-6 py-4 font-medium text-slate-700">Prénom</th>
                      <th className="text-left px-6 py-4 font-medium text-slate-700">Date d'abonnement</th>
                      <th className="text-left px-6 py-4 font-medium text-slate-700">Statut</th>
                      <th className="text-left px-6 py-4 font-medium text-slate-700">Préférences</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-800">{subscriber.email}</td>
                        <td className="px-6 py-4 text-slate-600">{subscriber.firstName || '-'}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(subscriber.subscriptionDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subscriber.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {subscriber.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-1">
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
            <div className="grid gap-6">
              {newsletters.map((newsletter) => (
                <div key={newsletter.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-800">{newsletter.title}</h3>
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
                        <span>Créée le {new Date(newsletter.createdDate).toLocaleDateString('fr-FR')}</span>
                        {newsletter.sentDate && (
                          <span>Envoyée le {new Date(newsletter.sentDate).toLocaleDateString('fr-FR')}</span>
                        )}
                        {newsletter.recipients > 0 && (
                          <span>{newsletter.recipients} destinataires</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      {newsletter.status === 'draft' && (
                        <button
                          onClick={() => handleSendNewsletter(newsletter)}
                          className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
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
          </div>
        )}

        {/* Create Newsletter Tab */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Créer une nouvelle newsletter</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={newNewsletter.title}
                  onChange={(e) => setNewNewsletter(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Titre de la newsletter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Catégorie</label>
                <select
                  value={newNewsletter.category}
                  onChange={(e) => setNewNewsletter(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="actualites">Actualités</option>
                  <option value="temoignages">Témoignages</option>
                  <option value="evenements">Événements</option>
                  <option value="ressources">Ressources</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contenu</label>
                <textarea
                  rows={12}
                  value={newNewsletter.content}
                  onChange={(e) => setNewNewsletter(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Contenu de la newsletter..."
                />
              </div>
              <button
                onClick={handleCreateNewsletter}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
              >
                Créer la newsletter
              </button>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total abonnés</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalSubscribers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Abonnés actifs</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.activeSubscribers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Newsletters envoyées</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalNewsletters}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
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
    </div>
  );
};

export default NewsletterAdminPage;