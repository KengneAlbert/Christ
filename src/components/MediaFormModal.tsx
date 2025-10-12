import React, { useState, useEffect, useMemo } from "react";
import {
  Upload,
  Save,
  X,
  AlertCircle,
  FileText,
  Trash2,
  Eye,
  Plus,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { StorageService } from "../services/storageService";
import { useAuth } from "../hooks/useAuth";
import CustomDropdown from "./CustomDropdown";
import { ButtonLoader, ModalLoader } from "./Loader";

// Types partagés
import type { MediaItem, MediaImage } from "../types/media";

interface MediaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  editingItem: MediaItem | null;
  initialFile?: File | null; // Prop for dropped file
  categories: string[];
}

// MediaImage déjà défini dans ../types/media

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
            src={item.file_url || undefined}
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
            src={item.file_url || undefined}
            controls
            className="max-h-60 w-auto mx-auto rounded-lg shadow-md"
          />
        );
      case "audio":
        return (
          <audio src={item.file_url || undefined} controls className="w-full" />
        );
      case "document":
        return (
          <div className="text-center p-4 bg-slate-100 rounded-lg">
            <FileText className="w-16 h-16 mx-auto text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">
              Aperçu non disponible pour les documents.
            </p>
            <a
              href={item.file_url || undefined}
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
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // Gallery state for image type
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<MediaImage[]>([]);
  const [coverSelection, setCoverSelection] = useState<
    { kind: "existing"; id: string } | { kind: "new"; index: number } | null
  >(null);
  // Image viewing and management
  const [viewingImage, setViewingImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

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
      setGalleryFiles([]);
      setExistingImages([]);
      setCoverSelection(null);
      setViewingImage(null);
      setDeletingImageId(null);
      // If editing an image item, load its gallery
      if (editingItem && editingItem.type === "image") {
        supabase
          .from("media_images")
          .select(
            "id, media_id, image_url, thumbnail_url, is_cover, position, created_at"
          )
          .eq("media_id", editingItem.id)
          .order("is_cover", { ascending: false })
          .order("position", { ascending: true })
          .order("created_at", { ascending: true })
          .then(({ data, error }) => {
            if (!error && data) {
              setExistingImages(data as MediaImage[]);
              const cover = (data as MediaImage[]).find((im) => im.is_cover);
              if (cover) setCoverSelection({ kind: "existing", id: cover.id });
            }
          });
      }
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

  // Delete existing image
  const handleDeleteExistingImage = async (imageId: string) => {
    if (!editingItem) return;

    try {
      setDeletingImageId(imageId);

      // Delete from database
      const { error } = await supabase
        .from("media_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      // Remove from local state
      const newExistingImages = existingImages.filter(
        (img) => img.id !== imageId
      );
      setExistingImages(newExistingImages);

      // If this was the cover, select a new one
      let selectedNewCoverId: string | null = null;
      const deletedWasCover =
        coverSelection?.kind === "existing" && coverSelection.id === imageId;

      if (deletedWasCover) {
        if (newExistingImages.length > 0) {
          selectedNewCoverId = newExistingImages[0].id;
          setCoverSelection({ kind: "existing", id: selectedNewCoverId });
        } else if (galleryFiles.length > 0) {
          setCoverSelection({ kind: "new", index: 0 });
        } else {
          setCoverSelection(null);
        }
      }

      // Persist cover change if we have other existing images
      if (newExistingImages.length > 0) {
        const newCover = selectedNewCoverId
          ? newExistingImages.find((im) => im.id === selectedNewCoverId) ||
            newExistingImages[0]
          : newExistingImages[0];

        // Update is_cover flags in DB
        await supabase
          .from("media_images")
          .update({ is_cover: false })
          .eq("media_id", editingItem.id);
        await supabase
          .from("media_images")
          .update({ is_cover: true })
          .eq("id", newCover.id);

        // Sync media_items thumbnail/file to the new cover
        await supabase
          .from("media_items")
          .update({
            thumbnail_url: newCover.thumbnail_url || newCover.image_url,
            file_url: newCover.image_url,
          })
          .eq("id", editingItem.id);
      } else if (galleryFiles.length === 0) {
        // No images left (existing nor new), clear thumbnails
        await supabase
          .from("media_items")
          .update({ thumbnail_url: null, file_url: null })
          .eq("id", editingItem.id);
      }
    } catch (error) {
      console.error("Erreur suppression image:", error);
      setErrorMessage("Erreur lors de la suppression de l'image");
    } finally {
      setDeletingImageId(null);
    }
  };

  // Remove new image from gallery
  const handleRemoveGalleryFile = (index: number) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index);
    setGalleryFiles(newFiles);
    setFormData((prev) => ({ ...prev, file: newFiles[0] || null }));

    // Adjust cover selection
    if (coverSelection?.kind === "new") {
      if (coverSelection.index === index) {
        // Removed the selected cover
        if (newFiles.length > 0) {
          setCoverSelection({ kind: "new", index: 0 });
        } else if (existingImages.length > 0) {
          setCoverSelection({ kind: "existing", id: existingImages[0].id });
        } else {
          setCoverSelection(null);
        }
      } else if (coverSelection.index > index) {
        // Adjust index after removal
        setCoverSelection({ kind: "new", index: coverSelection.index - 1 });
      }
    }
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

    setIsSaving(true);
    setIsProcessing(true);
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
      let createdMediaId: string | null = editingItem ? editingItem.id : null;

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
      } else if (formData.type !== "image" && formData.file) {
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
      } else if (formData.type === "image") {
        // Images are handled as gallery. At least one image must be provided when creating.
        if (!editingItem && galleryFiles.length === 0 && !formData.file) {
          setErrorMessage("Veuillez ajouter au moins une image pour ce média.");
          setUploadProgress({ percentage: 0, isUploading: false });
          return;
        }
      }

      // First upsert media_items
      if (editingItem) {
        const { error } = await supabase
          .from("media_items")
          .update(mediaData)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const insertData = {
          ...mediaData,
          is_published: true,
          views_count: 0,
          downloads_count: 0,
        };
        const { data: created, error } = await supabase
          .from("media_items")
          .insert(insertData)
          .select("id")
          .single();
        if (error) throw error;
        createdMediaId = created.id as string;
      }

      // Handle gallery for image type
      if ((editingItem || createdMediaId) && formData.type === "image") {
        const mediaId = editingItem
          ? editingItem.id
          : (createdMediaId as string);

        // Upload new files (either via galleryFiles or single file field if used)
        const newFiles: File[] =
          galleryFiles.length > 0
            ? galleryFiles
            : formData.file
            ? [formData.file]
            : [];

        const uploadedImages: { url: string }[] = [];
        for (let i = 0; i < newFiles.length; i++) {
          const f = newFiles[i];
          const res = await StorageService.uploadFile(
            f,
            "image",
            (progress) => {
              setUploadProgress({
                percentage: progress.percentage,
                isUploading: true,
              });
            }
          );
          if (!res.success || !res.url) {
            throw new Error(res.error || "Échec de l'upload d'une image");
          }
          uploadedImages.push({ url: res.url });
        }

        // Insert media_images for new uploads
        if (uploadedImages.length > 0) {
          const rows = uploadedImages.map((u, idx) => ({
            media_id: mediaId,
            image_url: u.url,
            thumbnail_url: u.url, // Could be replaced by resized variant later
            is_cover: false,
            position: (existingImages?.length || 0) + idx,
          }));
          const { error } = await supabase.from("media_images").insert(rows);
          if (error) throw error;
        }

        // If no explicit cover selected yet, choose existing cover or the first image
        let selectedCover:
          | { kind: "existing"; id: string }
          | { kind: "new"; index: number }
          | null = coverSelection;
        if (!selectedCover) {
          if (existingImages.length > 0) {
            const cover =
              existingImages.find((im) => im.is_cover) || existingImages[0];
            selectedCover = cover ? { kind: "existing", id: cover.id } : null;
          } else if (uploadedImages.length > 0) {
            selectedCover = { kind: "new", index: 0 };
          }
        }

        // Fetch updated images list to know IDs of newly inserted rows
        const { data: allImages } = await supabase
          .from("media_images")
          .select(
            "id, media_id, image_url, thumbnail_url, is_cover, position, created_at"
          )
          .eq("media_id", mediaId)
          .order("created_at", { ascending: true });

        let coverUrlToUse: string | null = null;
        if (allImages && allImages.length > 0) {
          // Determine cover image id
          let coverId: string | null = null;
          if (selectedCover?.kind === "existing") {
            coverId = selectedCover.id;
          } else if (selectedCover?.kind === "new") {
            const chosen =
              allImages[(existingImages?.length || 0) + selectedCover.index];
            coverId = chosen?.id || null;
          }

          // Update is_cover flags
          if (coverId) {
            // Supabase doesn't support bulk patch with different values; run two operations
            const { error: clearErr } = await supabase
              .from("media_images")
              .update({ is_cover: false })
              .eq("media_id", mediaId);
            if (clearErr) throw clearErr;
            const { error: setErr } = await supabase
              .from("media_images")
              .update({ is_cover: true })
              .eq("id", coverId);
            if (setErr) throw setErr;
          }

          const coverImg = coverId
            ? allImages.find((im) => im.id === coverId)
            : allImages[0];
          coverUrlToUse =
            coverImg?.thumbnail_url || coverImg?.image_url || null;
        }

        // Update media_items thumbnail_url and file_url with cover
        if (coverUrlToUse) {
          const { error: updErr } = await supabase
            .from("media_items")
            .update({ thumbnail_url: coverUrlToUse, file_url: coverUrlToUse })
            .eq("id", mediaId);
          if (updErr) throw updErr;
        }
      }

      onSuccess(
        editingItem
          ? "Média mis à jour avec succès."
          : "Média ajouté avec succès."
      );

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
      setIsSaving(false);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {isProcessing && (
        <ModalLoader
          text={
            uploadProgress.isUploading ? "Upload en cours..." : "Traitement..."
          }
          type={uploadProgress.isUploading ? "upload" : "save"}
        />
      )}
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
                {formData.type === "image" ? (
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      // Append new files to existing selection and de-duplicate by name/size/lastModified
                      setGalleryFiles((prev) => {
                        const merged = [...prev, ...files];
                        const seen = new Set<string>();
                        const deduped = merged.filter((f) => {
                          const key = `${f.name}-${f.size}-${
                            (f as File).lastModified
                          }`;
                          if (seen.has(key)) return false;
                          seen.add(key);
                          return true;
                        });
                        return deduped;
                      });
                      // If no primary file selected yet, set the first newly added file
                      setFormData((prev) => ({
                        ...prev,
                        file: prev.file || files[0] || null,
                      }));
                      // Reset the input so selecting the same files again is detectable
                      (e.target as HTMLInputElement).value = "";
                    }}
                    className="hidden"
                    id="file-upload"
                    disabled={uploadProgress.isUploading}
                    accept="image/*"
                  />
                ) : (
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
                        : ".pdf,.doc,.docx,.txt"
                    }
                  />
                )}
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
                    {formData.type === "image"
                      ? galleryFiles.length > 0
                        ? `${galleryFiles.length} image(s) sélectionnée(s)`
                        : "Cliquez pour sélectionner une ou plusieurs images"
                      : formData.file
                      ? formData.file.name
                      : "Cliquez pour sélectionner un fichier"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.type === "video"
                      ? "Formats: MP4, AVI, MOV"
                      : formData.type === "audio"
                      ? "Formats: MP3, WAV, OGG"
                      : formData.type === "image"
                      ? "Formats: JPG, PNG, GIF, WEBP (multi-sélection)"
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
                      Upload en cours... {Math.round(uploadProgress.percentage)}
                      %
                    </p>
                  </div>
                )}
              </div>

              {formData.type === "image" && (
                <div className="mt-4">
                  {existingImages.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-slate-700">
                          Images existantes ({existingImages.length})
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(
                              "file-upload"
                            ) as HTMLInputElement;
                            input?.click();
                          }}
                          className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Ajouter</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {existingImages.map((img) => (
                          <div
                            key={img.id}
                            className="relative border rounded-xl overflow-hidden group"
                          >
                            <img
                              src={img.thumbnail_url || img.image_url}
                              alt=""
                              className="w-full h-24 object-cover"
                            />

                            {/* Cover selection */}
                            <div className="absolute top-1 left-1 bg-white/90 rounded px-1 text-xs">
                              <label className="inline-flex items-center space-x-1">
                                <input
                                  type="radio"
                                  name="cover"
                                  checked={
                                    coverSelection?.kind === "existing" &&
                                    coverSelection.id === img.id
                                  }
                                  onChange={() =>
                                    setCoverSelection({
                                      kind: "existing",
                                      id: img.id,
                                    })
                                  }
                                />
                                <span>Couverture</span>
                              </label>
                            </div>

                            {/* Action buttons */}
                            <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() =>
                                  setViewingImage({
                                    url: img.image_url,
                                    title: `Image ${img.id.slice(0, 8)}`,
                                  })
                                }
                                className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center"
                                title="Voir l'image"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteExistingImage(img.id)
                                }
                                disabled={deletingImageId === img.id}
                                className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center disabled:opacity-50"
                                title="Supprimer l'image"
                              >
                                {deletingImageId === img.id ? (
                                  <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {/* Cover indicator */}
                            {img.is_cover && (
                              <div className="absolute bottom-1 left-1 bg-emerald-500 text-white text-[10px] px-1 rounded">
                                Couverture
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {galleryFiles.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-slate-700">
                          Nouvelles images ({galleryFiles.length})
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(
                              "file-upload"
                            ) as HTMLInputElement;
                            input?.click();
                          }}
                          className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Ajouter</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {galleryFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="relative border rounded-xl overflow-hidden group"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt=""
                              className="w-full h-24 object-cover"
                            />

                            {/* Cover selection */}
                            <div className="absolute top-1 left-1 bg-white/90 rounded px-1 text-xs">
                              <label className="inline-flex items-center space-x-1">
                                <input
                                  type="radio"
                                  name="cover"
                                  checked={
                                    coverSelection?.kind === "new" &&
                                    coverSelection.index === idx
                                  }
                                  onChange={() =>
                                    setCoverSelection({
                                      kind: "new",
                                      index: idx,
                                    })
                                  }
                                />
                                <span>Couverture</span>
                              </label>
                            </div>

                            {/* Remove button */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryFile(idx)}
                                className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center"
                                title="Retirer cette image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            {/* File name */}
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded max-w-[80%] truncate">
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                {uploadProgress.isUploading || isSaving ? (
                  <ButtonLoader
                    type={uploadProgress.isUploading ? "upload" : "save"}
                    text={
                      uploadProgress.isUploading ? "Upload..." : "Sauvegarde..."
                    }
                    size="sm"
                  />
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

      {/* Image Viewing Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setViewingImage(null)}
                className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <img
              src={viewingImage.url}
              alt={viewingImage.title}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MediaFormModal;
