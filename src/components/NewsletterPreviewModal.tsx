import React, { useState, useEffect } from 'react';
import { X, Edit, Save, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Newsletter {
  id: string;
  title: string;
  content: string;
  html_content?: string;
  category: "actualites" | "temoignages" | "evenements" | "ressources";
  status: "draft" | "scheduled" | "sent";
  scheduled_date?: string;
  sent_date?: string;
  recipients_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface NewsletterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsletter: Newsletter | null;
  onSuccess: () => void;
}

const NewsletterPreviewModal: React.FC<NewsletterPreviewModalProps> = ({ isOpen, onClose, newsletter, onSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNewsletter, setEditedNewsletter] = useState(newsletter);

  useEffect(() => {
    setEditedNewsletter(newsletter);
    setIsEditing(false);
  }, [newsletter]);

  const handleSave = async () => {
    if (!editedNewsletter) return;

    try {
      const { error } = await supabase
        .from('newsletters')
        .update({
          title: editedNewsletter.title,
          content: editedNewsletter.content,
          category: editedNewsletter.category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editedNewsletter.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur mise à jour newsletter:', error);
    }
  };

  if (!isOpen || !newsletter) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">
              {isEditing ? 'Modifier la newsletter' : 'Aperçu de la newsletter'}
            </h2>
            <div className="flex items-center space-x-2">
              {newsletter.status === 'draft' && (
                <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-slate-400 hover:text-slate-600">
                  {isEditing ? <Eye className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                </button>
              )}
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={editedNewsletter?.title || ''}
                  onChange={(e) => setEditedNewsletter(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Catégorie</label>
                <select
                  value={editedNewsletter?.category || ''}
                  onChange={(e) => setEditedNewsletter(prev => prev ? { ...prev, category: e.target.value as Newsletter['category'] } : null)}
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
                  rows={15}
                  value={editedNewsletter?.content || ''}
                  onChange={(e) => setEditedNewsletter(prev => prev ? { ...prev, content: e.target.value } : null)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2">
                  <Save className="w-5 h-5" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <h1>{newsletter.title}</h1>
              <p>{newsletter.content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterPreviewModal;