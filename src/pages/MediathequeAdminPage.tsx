import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Video,
  FileText,
  Image,
  Music,
  Search,
  BarChart3,
  Download,
  ExternalLink,
  File,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import MediaFormModal from "../components/MediaFormModal";
import { StatisticsView } from "../components/StatisticsView";
import ConfirmationModal from "../components/ConfirmationModal";
import { BulkActionBar } from "../components/BulkActionBar";
import CustomDropdown from "../components/CustomDropdown";
import { ButtonLoader } from "../components/Loader";

interface MediaItem {
  id: string;
  type: "video" | "document" | "audio" | "image";
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
  const { user, initialized } = useAuth();
  const [activeTab, setActiveTab] = useState<"list" | "stats">("list");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [filterType, setFilterType] = useState<
    "all" | "video" | "document" | "audio" | "image"
  >("all");
  const [publishStatus, setPublishStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_at,desc");

  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const [categories, setCategories] = useState<string[]>([]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("media_items")
        .select("category")
        .limit(1000); // Adjust limit as needed

      if (error) throw error;

      const uniqueCategories = Array.from(
        new Set(data.map((item) => item.category).filter(Boolean))
      );
      setCategories(uniqueCategories.sort());
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des catégories.",
      });
    }
  };

  const loadMediaItems = useCallback(async () => {
    if (!initialized || !user) return;

    setIsLoading(true);

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    try {
      let query = supabase.from("media_items").select("*", { count: "exact" });

      if (debouncedSearchTerm) {
        query = query.ilike("title", `%${debouncedSearchTerm}%`);
      }
      if (filterType !== "all") {
        query = query.eq("type", filterType);
      }
      if (publishStatus !== "all") {
        query = query.eq("is_published", publishStatus === "published");
      }

      const [sortColumn, sortDirection] = sortBy.split(",");
      query = query.order(sortColumn, { ascending: sortDirection === "asc" });

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setMediaItems((data as MediaItem[]) || []);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Erreur chargement médias:", error);
      setMessage({
        type: "error",
        text: `Erreur lors du chargement des médias: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    filterType,
    debouncedSearchTerm,
    itemsPerPage,
    initialized,
    user,
    sortBy,
    publishStatus,
  ]);

  useEffect(() => {
    if (activeTab === "list") {
      loadMediaItems();
      loadCategories();
    }
  }, [loadMediaItems, activeTab]);

  useEffect(() => {
    setSelectedItems(new Set());
  }, [currentPage, filterType, debouncedSearchTerm, publishStatus, sortBy]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setMessage(null);
    await loadMediaItems();
    setIsRefreshing(false);
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { error } = await supabase
        .from("media_items")
        .delete()
        .eq("id", itemToDelete);
      if (error) throw error;
      setMessage({ type: "success", text: "Média supprimé avec succès" });
      loadMediaItems();
    } catch (error) {
      console.error("Erreur suppression média:", error);
      setMessage({ type: "error", text: "Erreur lors de la suppression" });
    } finally {
      setItemToDelete(null);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("media_items")
        .update({
          is_published: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setMessage({
        type: "success",
        text: `Média ${!currentStatus ? "publié" : "dépublié"} avec succès`,
      });
      setMediaItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, is_published: !currentStatus } : item
        )
      );
    } catch (error) {
      console.error("Erreur mise à jour publication:", error);
      setMessage({ type: "error", text: "Erreur lors de la modification" });
    }
  };

  const handleModalSuccess = (successMessage: string) => {
    setMessage({ type: "success", text: successMessage });
    loadMediaItems();
    loadCategories();
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === mediaItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(mediaItems.map((item) => item.id)));
    }
  };

  const handleBulkUpdate = async (updates: Partial<MediaItem>) => {
    const ids = Array.from(selectedItems);
    try {
      const { error } = await supabase
        .from("media_items")
        .update(updates)
        .in("id", ids);
      if (error) throw error;
      setMessage({
        type: "success",
        text: `${ids.length} média(s) mis à jour.`,
      });
      loadMediaItems();
      setSelectedItems(new Set());
    } catch (err) {
      console.error("Erreur mise à jour en masse:", err);
      setMessage({ type: "error", text: "Une erreur est survenue." });
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedItems);
    try {
      const { error } = await supabase
        .from("media_items")
        .delete()
        .in("id", ids);
      if (error) throw error;
      setMessage({
        type: "success",
        text: `${ids.length} média(s) supprimé(s).`,
      });
      loadMediaItems();
      setSelectedItems(new Set());
    } catch (err) {
      console.error("Erreur suppression en masse:", err);
      setMessage({ type: "error", text: "Une erreur est survenue." });
    } finally {
      setIsBulkDeleteConfirmOpen(false);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setEditingItem(null); // Ensure we are in creation mode
      setDroppedFile(e.dataTransfer.files[0]);
      setShowModal(true);
      e.dataTransfer.clearData();
    }
  };

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "document":
        return FileText;
      case "audio":
        return Music;
      case "image":
        return Image;
      default:
        return File;
    }
  };

  return (
    <>
      <div
        className="p-6 pb-24 relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-emerald-500/20 border-4 border-dashed border-emerald-600 rounded-2xl z-30 flex flex-col items-center justify-center pointer-events-none">
            <UploadCloud className="w-24 h-24 text-emerald-600 animate-bounce" />
            <p className="mt-4 text-2xl font-bold text-emerald-700">
              Déposez votre fichier ici
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Gestion Médiathèque
            </h1>
            <p className="text-slate-600 mt-2">
              Administration des ressources multimédia
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || activeTab !== "list"}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform shadow-sm disabled:opacity-50 ${
                isRefreshing
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:scale-105"
              }`}
            >
              {isRefreshing ? (
                <ButtonLoader
                  type="refresh"
                  text="Actualisation..."
                  size="sm"
                />
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Actualiser</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setDroppedFile(null);
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 hover-glow"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter un média</span>
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border animate-slide-down ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200 mb-8">
          {[
            { id: "list", label: "Liste des médias", icon: FileText },
            { id: "stats", label: "Statistiques", icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as "list" | "stats")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                activeTab === id
                  ? "bg-emerald-500 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {activeTab === "list" && (
          <div className="space-y-6">
            {isLoading && mediaItems.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Chargement des médias...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          onChange={toggleSelectAll}
                          checked={
                            selectedItems.size === mediaItems.length &&
                            mediaItems.length > 0
                          }
                          disabled={mediaItems.length === 0}
                        />
                        <label className="ml-2 text-sm text-slate-600">
                          Tout sél.
                        </label>
                      </div>
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
                      <CustomDropdown
                        options={[
                          { value: "all", label: "Tous les types" },
                          { value: "video", label: "Vidéos" },
                          { value: "document", label: "Documents" },
                          { value: "audio", label: "Audio" },
                          { value: "image", label: "Images" },
                        ]}
                        value={filterType}
                        onChange={setFilterType}
                        placeholder="Tous les types"
                        width="w-56"
                      />
                      <CustomDropdown
                        options={[
                          { value: "all", label: "Tout statut" },
                          { value: "published", label: "Publiés" },
                          { value: "unpublished", label: "Brouillons" },
                        ]}
                        value={publishStatus}
                        onChange={setPublishStatus}
                        placeholder="Tout statut"
                        width="w-56"
                      />
                      <CustomDropdown
                        options={[
                          { value: "created_at,desc", label: "Plus récents" },
                          { value: "created_at,asc", label: "Plus anciens" },
                          { value: "views_count,desc", label: "Plus vus" },
                          {
                            value: "downloads_count,desc",
                            label: "Plus téléchargés",
                          },
                          { value: "title,asc", label: "Titre (A-Z)" },
                          { value: "title,desc", label: "Titre (Z-A)" },
                        ]}
                        value={sortBy}
                        onChange={setSortBy}
                        placeholder="Trier par"
                        width="w-56"
                      />
                    </div>
                    <div className="text-sm text-slate-600">
                      {totalItems} élément(s) au total
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {mediaItems.map((item, index) => {
                    const TypeIcon = getTypeIcon(item.type);
                    const isSelected = selectedItems.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl shadow-lg border overflow-hidden transition-all duration-300 ${
                          isSelected
                            ? "ring-2 ring-emerald-500 scale-105 shadow-xl"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="relative h-48 group">
                          <img
                            src={
                              item.thumbnail_url ||
                              generateThumbnail(
                                item.type,
                                item.youtube_id || undefined
                              )
                            }
                            alt={item.title}
                            className={`w-full h-full object-cover transition-transform duration-300 ${
                              !isSelected && "group-hover:scale-110"
                            }`}
                          />
                          <div
                            className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${
                              !isSelected && "opacity-0 group-hover:opacity-100"
                            }`}
                          ></div>

                          <div className="absolute top-3 left-3 z-10">
                            <input
                              type="checkbox"
                              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelectItem(item.id);
                              }}
                            />
                          </div>

                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                item.is_published
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.is_published ? "Publié" : "Brouillon"}
                            </span>
                          </div>
                          {(item.duration || item.pages) && (
                            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              {item.duration || `${item.pages} pages`}
                            </div>
                          )}
                          <div
                            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                              !isSelected && "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <a
                              href={`/mediatheque/${item.id}`}
                              className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 animate-bounce-in"
                            >
                              <Eye className="w-6 h-6 text-slate-800" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4 bg-white">
                          <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 hover:text-emerald-600 transition-colors duration-300">
                            {item.title}
                          </h3>
                          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          {item.category && (
                            <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs mb-3">
                              {item.category}
                            </span>
                          )}
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                            <span>
                              {new Date(item.created_at).toLocaleDateString(
                                "fr-FR"
                              )}
                            </span>
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
                              onClick={() =>
                                togglePublish(item.id, item.is_published)
                              }
                              className={`px-3 py-1 rounded text-xs font-medium transition-all duration-300 hover:scale-105 ${
                                item.is_published
                                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                                  : "bg-green-100 text-green-800 hover:bg-green-200"
                              }`}
                            >
                              {item.is_published ? "Dépublier" : "Publier"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-slate-700">
                    Page {currentPage} sur{" "}
                    {Math.ceil(totalItems / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage * itemsPerPage >= totalItems}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>

                {mediaItems.length === 0 && !isLoading && (
                  <div className="text-center py-16 animate-fade-in">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                      <Search className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                      Aucun média trouvé
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Essayez de modifier vos critères de recherche
                    </p>
                    <button
                      onClick={() => {
                        setFilterType("all");
                        setSearchTerm("");
                        setPublishStatus("all");
                        setSortBy("created_at,desc");
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover-glow"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "stats" && <StatisticsView />}
      </div>

      <BulkActionBar
        selectedCount={selectedItems.size}
        onClear={() => setSelectedItems(new Set())}
        onPublish={() => handleBulkUpdate({ is_published: true })}
        onUnpublish={() => handleBulkUpdate({ is_published: false })}
        onDelete={() => setIsBulkDeleteConfirmOpen(true)}
      />

      <MediaFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
          setDroppedFile(null); // Clear dropped file on close
        }}
        onSuccess={handleModalSuccess}
        editingItem={editingItem}
        initialFile={droppedFile}
        categories={categories}
      />

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce média ? Cette action est irréversible."
        confirmText="Supprimer"
      />

      <ConfirmationModal
        isOpen={isBulkDeleteConfirmOpen}
        onClose={() => setIsBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Confirmer la suppression en masse"
        message={`Êtes-vous sûr de vouloir supprimer les ${selectedItems.size} médias sélectionnés ? Cette action est irréversible.`}
        confirmText="Tout supprimer"
      />
    </>
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
