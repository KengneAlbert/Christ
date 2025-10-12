import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Eye,
  Calendar,
  Play,
  FileText,
  Volume2,
  Share2,
  Heart,
  Youtube,
  Clock,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { MediaItem } from "../types/media";
import SEOHead from "../components/SEOHead";
import { seoService } from "../services/seoService";

// Utilise l'interface partagée MediaItem

const MediaViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [similarItems, setSimilarItems] = useState<MediaItem[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [gallery, setGallery] = useState<
    Array<{
      id: string;
      image_url: string;
      thumbnail_url: string | null;
      is_cover: boolean;
    }>
  >([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const loadMedia = useCallback(async () => {
    if (!id) {
      setError("ID du média manquant");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Charger le média depuis la base de données
      const { data, error: fetchError } = await supabase
        .from("media_items")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setError("Média introuvable");
        } else {
          throw fetchError;
        }
        return;
      }

      setMedia(data);

      // Incrémenter les vues
      await supabase
        .from("media_items")
        .update({ views_count: data.views_count + 1 })
        .eq("id", id);

      // Charger des ressources similaires (basées sur la catégorie, puis fallback sur le type)
      try {
        setIsSimilarLoading(true);
        // 1) Par catégorie
        const { data: byCategory, error: catErr } = await supabase
          .from("media_items")
          .select(
            "id, type, title, description, thumbnail_url, file_url, youtube_id, created_at, views_count, downloads_count, category"
          )
          .eq("is_published", true)
          .eq("category", data.category)
          .neq("id", data.id)
          .order("views_count", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(6);

        if (catErr) throw catErr;

        if (byCategory && byCategory.length > 0) {
          setSimilarItems(byCategory as MediaItem[]);
        } else {
          // 2) Fallback: par type
          const { data: byType, error: typeErr } = await supabase
            .from("media_items")
            .select(
              "id, type, title, description, thumbnail_url, file_url, youtube_id, created_at, views_count, downloads_count, category"
            )
            .eq("is_published", true)
            .eq("type", data.type)
            .neq("id", data.id)
            .order("views_count", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(6);
          if (typeErr) throw typeErr;
          setSimilarItems((byType || []) as MediaItem[]);
        }
      } catch (e) {
        console.warn("Chargement ressources similaires:", e);
        setSimilarItems([]);
      } finally {
        setIsSimilarLoading(false);
      }

      // Charger la galerie si c'est un type image
      if (data.type === "image") {
        const { data: imgs } = await supabase
          .from("media_images")
          .select("id, image_url, thumbnail_url, is_cover")
          .eq("media_id", data.id)
          .order("is_cover", { ascending: false })
          .order("created_at", { ascending: true });
        const list = (imgs || []) as Array<{
          id: string;
          image_url: string;
          thumbnail_url: string | null;
          is_cover: boolean;
        }>;
        setGallery(list);
        const coverIdx = list.findIndex((im) => im.is_cover);
        setActiveImageIndex(coverIdx >= 0 ? coverIdx : 0);
      } else {
        setGallery([]);
        setActiveImageIndex(0);
      }
    } catch (err) {
      console.error("Erreur chargement média:", err);
      setError("Erreur lors du chargement du média");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleDownload = () => {
    if (media?.file_url) {
      const link = document.createElement("a");
      link.href = media.file_url;
      link.download =
        media.file_name ||
        `${media.title}.${
          media.type === "document"
            ? "pdf"
            : media.type === "audio"
            ? "mp3"
            : "jpg"
        }`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Incrémenter les téléchargements
      if (media.id) {
        supabase
          .from("media_items")
          .update({ downloads_count: media.downloads_count + 1 })
          .eq("id", media.id)
          .then(() => {
            setMedia((prev) =>
              prev
                ? { ...prev, downloads_count: prev.downloads_count + 1 }
                : null
            );
          });
      }
    }
  };

  const handleShare = async () => {
    if (!media) return;
    const nav = window.navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      clipboard?: Clipboard;
    };
    if (nav.share) {
      try {
        await nav.share({
          title: media.title,
          text: media.description,
          url: window.location.href,
        });
      } catch {
        console.log("Partage annulé");
      }
    } else if (nav.clipboard?.writeText) {
      await nav.clipboard.writeText(window.location.href);
      alert("Lien copié dans le presse-papiers !");
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Lien copié dans le presse-papiers !");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Play;
      case "document":
        return FileText;
      case "audio":
        return Volume2;
      case "image":
        return Eye;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "from-red-500 to-red-600";
      case "document":
        return "from-blue-500 to-blue-600";
      case "audio":
        return "from-purple-500 to-purple-600";
      case "image":
        return "from-green-500 to-green-600";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  const renderMediaContent = () => {
    if (!media) return null;

    switch (media.type) {
      case "video":
        return (
          <div className="w-full">
            {media.youtube_id ? (
              <div className="relative w-full h-0 pb-[56.25%] mb-8 rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${media.youtube_id}`}
                  title={media.title}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : media.file_url ? (
              <div className="mb-8">
                <video
                  src={media.file_url}
                  controls
                  autoPlay
                  className="w-full rounded-2xl shadow-2xl"
                  poster={media.thumbnail_url || undefined}
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <div className="text-center">
                  <Play className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">Vidéo non disponible</p>
                </div>
              </div>
            )}
          </div>
        );

      case "audio":
        return (
          <div className="w-full mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 shadow-xl">
              <div className="flex items-center space-x-6 mb-8">
                <img
                  src={
                    media.thumbnail_url ||
                    "https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=400"
                  }
                  alt={media.title}
                  className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {media.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{media.category}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Durée: {media.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{media.views_count} écoutes</span>
                    </div>
                  </div>
                </div>
              </div>

              {media.file_url ? (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <audio
                    src={media.file_url}
                    controls
                    className="w-full"
                    autoPlay
                  >
                    Votre navigateur ne supporte pas la lecture audio.
                  </audio>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center shadow-lg">
                  <Volume2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">Audio non disponible</p>
                </div>
              )}
            </div>
          </div>
        );

      case "document":
        return (
          <div className="w-full mb-8">
            {media.file_url ? (
              <div className="bg-slate-50 rounded-2xl p-6 shadow-xl">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    src={`/api/pdf-proxy?url=${encodeURIComponent(
                      media.file_url
                    )}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    title={media.title}
                    className="w-full h-[600px] border-0"
                    frameBorder="0"
                  />
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 hover-glow"
                  >
                    <Download className="w-6 h-6" />
                    <span>Télécharger le PDF</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-inner">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">
                    Document non disponible
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "image":
        return (
          <div className="w-full mb-8">
            <div className="relative bg-slate-50 rounded-2xl p-6 shadow-xl">
              <img
                src={
                  gallery[activeImageIndex]?.image_url ||
                  media.file_url ||
                  media.thumbnail_url ||
                  ""
                }
                alt={media.title}
                className="w-full max-h-[600px] object-contain rounded-xl shadow-lg bg-white"
              />
              <button
                onClick={handleDownload}
                className="absolute top-10 right-10 bg-black/70 hover:bg-black/90 text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg"
              >
                <Download className="w-6 h-6" />
              </button>
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {gallery.map((img, idx) => (
                  <button
                    type="button"
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative rounded-xl overflow-hidden border ${
                      idx === activeImageIndex
                        ? "border-emerald-500 ring-2 ring-emerald-300"
                        : "border-slate-200"
                    } hover:scale-105 transition-transform duration-200`}
                  >
                    <img
                      src={img.thumbnail_url || img.image_url}
                      alt="miniature"
                      className="w-full h-20 object-cover"
                    />
                    {img.is_cover && (
                      <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded">
                        Couverture
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement du média...</p>
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            {error || "Média introuvable"}
          </h1>
          <p className="text-slate-600 mb-8">
            {error ||
              "Le média que vous recherchez n'existe pas ou a été supprimé."}
          </p>
          <button
            onClick={() => navigate("/mediatheque")}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Retour à la médiathèque
          </button>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(media.type);

  // Générer le SEO pour ce média
  const mediaSEO = seoService.generateMediaSEO({
    id: media.id,
    type: media.type,
    title: media.title,
    description: media.description,
    category: media.category,
    created_at: media.created_at,
    updated_at: media.updated_at,
    views_count: media.views_count,
    file_url: media.file_url || undefined,
    thumbnail_url: media.thumbnail_url || undefined,
    duration: media.duration || undefined,
    pages: media.pages || undefined,
  });

  return (
    <div className="min-h-screen bg-white">
      <SEOHead seo={mediaSEO} />
      {/* Header avec navigation */}
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/mediatheque")}
              className="flex items-center space-x-3 text-slate-600 hover:text-slate-800 transition-all duration-300 transform hover:scale-105 hover-lift"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Retour à la médiathèque</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg ${
                  isBookmarked
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
                />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-800 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            {/* En-tête du média */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${getTypeColor(
                    media.type
                  )} rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle`}
                >
                  <TypeIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                      {media.category}
                    </span>
                    {media.youtube_id && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Youtube className="w-3 h-3" />
                        <span>YouTube</span>
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                    {media.title}
                  </h1>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-8">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Publié le{" "}
                    {new Date(media.created_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {media.views_count && (
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{media.views_count} vues</span>
                  </div>
                )}
                {media.downloads_count && (
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>{media.downloads_count} téléchargements</span>
                  </div>
                )}
                {media.duration && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{media.duration}</span>
                  </div>
                )}
                {media.pages && (
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>{media.pages} pages</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lecteur de média */}
            {renderMediaContent()}

            {/* Description */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-lg border border-slate-100 mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                À propos de ce contenu
              </h2>
              <p className="text-slate-700 leading-relaxed text-lg">
                {media.description}
              </p>
            </div>

            {/* Actions principales */}
            <div className="flex flex-wrap gap-4">
              {media.file_url &&
                (media.type === "document" ||
                  media.type === "image" ||
                  media.type === "audio") && (
                  <button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 hover-glow"
                  >
                    <Download className="w-6 h-6" />
                    <span>Télécharger</span>
                  </button>
                )}

              {media.youtube_id && (
                <a
                  href={`https://www.youtube.com/watch?v=${media.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 hover-glow"
                >
                  <ExternalLink className="w-6 h-6" />
                  <span>Voir sur YouTube</span>
                </a>
              )}

              <button
                onClick={handleShare}
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-700 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 hover-lift"
              >
                <Share2 className="w-6 h-6" />
                <span>Partager</span>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Informations du média */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  Informations
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Type</span>
                    <span className="font-medium text-slate-800 capitalize">
                      {media.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Catégorie</span>
                    <span className="font-medium text-slate-800">
                      {media.category}
                    </span>
                  </div>
                  {media.duration && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Durée</span>
                      <span className="font-medium text-slate-800">
                        {media.duration}
                      </span>
                    </div>
                  )}
                  {media.pages && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Pages</span>
                      <span className="font-medium text-slate-800">
                        {media.pages}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Date de publication</span>
                    <span className="font-medium text-slate-800">
                      {new Date(media.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ressources similaires */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  Ressources similaires
                </h3>
                <div className="space-y-4">
                  {isSimilarLoading && (
                    <div className="text-sm text-slate-500">Chargement…</div>
                  )}
                  {!isSimilarLoading && similarItems.length === 0 && (
                    <div className="text-sm text-slate-500">
                      Aucune ressource similaire.
                    </div>
                  )}
                  {!isSimilarLoading &&
                    similarItems.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => navigate(`/mediatheque/${item.id}`)}
                        className="w-full text-left flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-300 cursor-pointer group"
                      >
                        <div
                          className={`w-10 h-10 bg-gradient-to-r ${getTypeColor(
                            item.type
                          )} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          {React.createElement(getTypeIcon(item.type), {
                            className: "w-5 h-5 text-white",
                          })}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800 text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {item.category}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Contact d'aide */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-heartbeat">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3">
                    Besoin d'aide ?
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    Notre équipe est disponible pour vous accompagner
                  </p>
                  <a
                    href="/contact"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover-glow block text-center"
                  >
                    Nous contacter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewerPage;
