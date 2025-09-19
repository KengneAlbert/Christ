import React from 'react';
import { CheckCircle, XCircle, Trash2, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ 
    selectedCount, 
    onPublish, 
    onUnpublish, 
    onDelete, 
    onClear 
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up">
        <div className="max-w-4xl mx-auto mb-6 px-6">
            <div className="bg-slate-800 text-white rounded-xl shadow-2xl flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                    <span className="font-bold text-lg">{selectedCount}</span>
                    <span className="text-slate-300">média(s) sélectionné(s)</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={onPublish}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span>Publier</span>
                    </button>
                    <button 
                        onClick={onUnpublish}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors font-semibold"
                    >
                        <XCircle className="w-5 h-5" />
                        <span>Dépublier</span>
                    </button>
                    <button 
                        onClick={onDelete}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span>Supprimer</span>
                    </button>
                </div>
                <button 
                    onClick={onClear}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
    </div>
  );
};