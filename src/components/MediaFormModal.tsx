import React, { useState, useEffect, useMemo } from "react";
import { Upload, Save, X, AlertCircle, FileText } from "lucide-react";
import { supabase } from "../lib/supabase";
import { StorageService } from "../services/storageService";
import { useAuth } from "../hooks/useAuth";
import CustomDropdown from "./CustomDropdown";

// This interface should ideally be in a dedicated types file (e.g., src/types/index.ts)
interface MediaItem {
  id: string;
  type: "video" | "document" | "audio" | "image";
  title: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  file_url?: string;
  youtube_id?: string | null;
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

interface MediaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  editingItem: MediaItem | null;
  initialFile?: File | null; // Prop for dropped file
  categories: string[];
}

const getMediaTypeFromFile = (file: File): MediaItem["type"] => {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("image/")) return "image";
  return "document";
};

const MediaPreview = ({ item }: { item: MediaItem }) => {
  const getYoutubeIdFromUrl = (url?: string | null): string | null => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/?|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2]?.length === 11 ? match[2] : null;
  };

  const renderPreview = () => {
    const derivedYoutubeId =
      item.youtube_id || getYoutubeIdFromUrl(item.file_url);
    const type = derivedYoutubeId ? "youtube" : item.type;
    switch (type) {
      case "image":
        return (
          <img
            src={item.file_url}
            alt={item.title}
            className="max-h-60 w-auto mx-auto rounded-lg shadow-md"
          />
        );
      case "youtube":
        return (
          <div
            style={{
              position: "relative",
              paddingTop: "56.25%",
              height: 0,
              width: "100%",
              flex: "0 0 100%",
            }}
            className="rounded-lg overflow-hidden shadow-md w-full"
          >
            <iframe
              src={`https://www.youtube.com/embed/${derivedYoutubeId}?autoplay=1&mute=1&playsinline=1&rel=0`}
              title={item.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            ></iframe>
          </div>
        );
      case "video":
        return (
          <video
            src={item.file_url}
            controls
            className="max-h-60 w-auto mx-auto rounded-lg shadow-md"
          />
        );
      case "audio":
        return <audio src={item.file_url} controls className="w-full" />;
      case "document":
        return (
          <div className="text-center p-4 bg-slate-100 rounded-lg">
            <FileText className="w-16 h-16 mx-auto text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">
              Aperçu non disponible pour les documents.
            </p>
            <a
              href={item.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline font-semibold"
            >
              Télécharger le document
            </a>
          </div>
        );
      default:
        return (
          <p className="text-center text-slate-500">Aperçu non disponible.</p>
        );
    }
  };

  return (
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-base font-semibold text-slate-800 mb-4">
        Aperçu du média
      </h3>
      <div className="bg-slate-50 p-4 rounded-xl min-h-[120px] flex items-center justify-center">
        {renderPreview()}
      </div>
    </div>
  );
};

const MediaFormModal: React.FC<MediaFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
  initialFile,
  categories,
}) => {
  const { user } = useAuth();

  const initialFormData = useMemo(
    () => ({
      type: "video" as MediaItem["type"],
      title: "",
      description: "",
      category: "",
      youtubeUrl: "",
      file: null as File | null,
      duration: "",
      pages: 0,
    }),
    []
  );

  const extractYouTubeId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/?|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const [formData, setFormData] = useState(initialFormData);
  const [uploadProgress, setUploadProgress] = useState({
    percentage: 0,
    isUploading: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          type: editingItem.type,
          title: editingItem.title,
          description: editingItem.description,
          category: editingItem.category,
          youtubeUrl:
            editingItem.youtube_id ||
            (editingItem.file_url
              ? extractYouTubeId(editingItem.file_url)
              : null)
              ? editingItem.file_url || ""
              : "",
          file: null,
          duration: editingItem.duration || "",
          pages: editingItem.pages || 0,
        });
      } else if (initialFile) {
        setFormData({
          ...initialFormData,
          file: initialFile,
          title: initialFile.name.split(".").slice(0, -1).join("."), // Pre-fill title
          type: getMediaTypeFromFile(initialFile),
        });
      } else {
        setFormData(initialFormData);
      }
      setErrorMessage(null);
      setUploadProgress({ percentage: 0, isUploading: false });
      setShowNewCategory(false);
      setNewCategory("");
    }
  }, [editingItem, isOpen, initialFile, initialFormData]);

  useEffect(() => {
    if (showNewCategory) {
      setFormData((prev) => ({ ...prev, category: newCategory }));
    } else {
      setFormData((prev) => ({
        ...prev,
        category: editingItem?.category || categories[0] || "",
      }));
    }
  }, [showNewCategory, newCategory, editingItem, categories]);

  // extractYouTubeId defined earlier for use in initializers

  const generateThumbnail = (type: string, youtubeId?: string): string => {
    if (type === "video" && youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
    const defaultThumbnails = {
      video:
        "https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=400",
      document:
        "https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=400",
      audio:
        "https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=400",
      image:
        "https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=400",
    };
    return defaultThumbnails[type as keyof typeof defaultThumbnails];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.title || !formData.description || !formData.category) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (!user) {
      setErrorMessage(
        "Utilisateur non authentifié. Veuillez vous reconnecter."
      );
      return;
    }

    setUploadProgress({ percentage: 0, isUploading: true });

    try {
      const { error: upsertError } = await supabase.from("admin_users").upsert(
        {
          id: user.id,
          email: user.email!,
          last_login: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: "id" }
      );
      if (upsertError) throw upsertError;

      const mediaData: Partial<Omit<MediaItem, "id" | "created_at">> = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        duration: formData.duration || undefined,
        pages: formData.pages || undefined,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      };

      if (formData.type === "video" && formData.youtubeUrl) {
        const youtubeId = extractYouTubeId(formData.youtubeUrl);
        if (!youtubeId) {
          setErrorMessage("URL YouTube invalide.");
          setUploadProgress({ percentage: 0, isUploading: false });
          return;
        }
        mediaData.youtube_id = youtubeId;
        mediaData.file_url = formData.youtubeUrl;
        mediaData.thumbnail_url = generateThumbnail("video", youtubeId);
      } else if (formData.file) {
        const uploadResult = await StorageService.uploadFile(
          formData.file,
          formData.type,
          (progress) => {
            setUploadProgress({
              percentage: progress.percentage,
              isUploading: true,
            });
          }
        );

        if (!uploadResult.success || !uploadResult.url) {
          setErrorMessage(
            uploadResult.error || "Erreur lors de l'upload du fichier."
          );
          setUploadProgress({ percentage: 0, isUploading: false });
          return;
        }
        mediaData.file_url = uploadResult.url;
        mediaData.file_name = formData.file.name;
        mediaData.file_size = uploadResult.metadata?.size || formData.file.size;
        mediaData.thumbnail_url = generateThumbnail(formData.type);
        mediaData.youtube_id = null;
      } else if (!editingItem) {
        setErrorMessage("Veuillez fournir un fichier ou une URL YouTube.");
        setUploadProgress({ percentage: 0, isUploading: false });
        return;
      }

      if (editingItem) {
        const { error } = await supabase
          .from("media_items")
          .update(mediaData)
          .eq("id", editingItem.id);
        if (error) throw error;
        onSuccess("Média mis à jour avec succès.");
      } else {
        const { error } = await supabase
          .from("media_items")
          .insert({
            ...mediaData,
            is_published: true,
            views_count: 0,
            downloads_count: 0,
          });
        if (error) throw error;
        onSuccess("Média ajouté avec succès.");
      }

      onClose();
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      const msg =
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors de la sauvegarde.";
      setErrorMessage(msg);
    } finally {
      setUploadProgress({ percentage: 0, isUploading: false });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">
              {editingItem ? "Modifier le média" : "Ajouter un média"}
            </h2>
            <button
              onClick={onClose}
              disabled={uploadProgress.isUploading}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors duration-300 hover:scale-110 transform"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {editingItem && <MediaPreview item={editingItem} />}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800 animate-slide-down">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type *
              </label>
              <CustomDropdown
                options={[
                  { value: "video", label: "Vidéo" },
                  { value: "document", label: "Document" },
                  { value: "audio", label: "Audio" },
                  { value: "image", label: "Image" },
                ]}
                value={formData.type}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as MediaItem["type"],
                  }))
                }
                placeholder="Sélectionner un type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Catégorie *
              </label>
              {showNewCategory ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                    placeholder="Nouvelle catégorie"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(false)}
                    className="p-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CustomDropdown
                    options={categories.map((cat) => ({
                      value: cat,
                      label: cat,
                    }))}
                    value={formData.category}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                    placeholder="catégorie"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                  >
                    Nouveau
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
              placeholder="Titre du média"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none focus-ring"
              placeholder="Description du contenu"
              required
            />
          </div>

          {formData.type === "video" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL YouTube (optionnel)
                </label>
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      youtubeUrl: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="text-center text-slate-500 text-sm font-medium">
                ou
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {editingItem
                ? "Remplacer le fichier (optionnel)"
                : formData.type === "video" && formData.youtubeUrl
                ? "Fichier (optionnel)"
                : "Fichier *"}
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                uploadProgress.isUploading
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30"
              }`}
            >
              <input
                type="file"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    file: e.target.files?.[0] || null,
                  }))
                }
                className="hidden"
                id="file-upload"
                disabled={uploadProgress.isUploading}
                accept={
                  formData.type === "video"
                    ? "video/*"
                    : formData.type === "audio"
                    ? "audio/*"
                    : formData.type === "image"
                    ? "image/*"
                    : ".pdf,.doc,.docx,.txt"
                }
              />
              <label
                htmlFor="file-upload"
                className={
                  uploadProgress.isUploading
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 hover:scale-110 transition-transform duration-300" />
                <p className="text-slate-600">
                  {formData.file
                    ? formData.file.name
                    : "Cliquez pour sélectionner un fichier"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.type === "video"
                    ? "Formats: MP4, AVI, MOV"
                    : formData.type === "audio"
                    ? "Formats: MP3, WAV, OGG"
                    : formData.type === "image"
                    ? "Formats: JPG, PNG, GIF"
                    : "Formats: PDF, DOC, DOCX, TXT"}
                </p>
              </label>
              {uploadProgress.isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Upload en cours... {Math.round(uploadProgress.percentage)}%
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(formData.type === "video" || formData.type === "audio") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Durée
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                  placeholder="Ex: 12:34"
                />
              </div>
            )}
            {formData.type === "document" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre de pages
                </label>
                <input
                  type="number"
                  value={formData.pages}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pages: parseInt(e.target.value) || 0,
                    }))
                  }
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
              onClick={onClose}
              disabled={uploadProgress.isUploading}
              className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-300 hover:scale-105 transform"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploadProgress.isUploading}
              className={`text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center space-x-2 ${
                uploadProgress.isUploading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 hover-glow"
              }`}
            >
              {uploadProgress.isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Upload...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{editingItem ? "Modifier" : "Ajouter"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaFormModal;
