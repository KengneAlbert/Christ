import React, { useState, useEffect } from "react";
import { X, Edit, Save, Eye, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { buildNewsletterHtml } from "../emails/renderers";
import RichTextEditor from "./RichTextEditor";
import {
  cleanHtml,
  htmlToText,
  linkifyHtml,
  applySubtitleToHtml,
} from "../utils/htmlUtils";

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

const NewsletterPreviewModal: React.FC<NewsletterPreviewModalProps> = ({
  isOpen,
  onClose,
  newsletter,
  onSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNewsletter, setEditedNewsletter] = useState(newsletter);
  const [previewMode, setPreviewMode] = useState<"simple" | "email">("simple");
  // Simple editor removed: always use rich editor
  const [htmlContent, setHtmlContent] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );
  const getDeviceWidth = (d: "mobile" | "tablet" | "desktop") =>
    d === "mobile" ? 390 : d === "tablet" ? 768 : 900;

  useEffect(() => {
    setEditedNewsletter(newsletter);
    setIsEditing(false);
    if (newsletter?.html_content) {
      setHtmlContent(newsletter.html_content);
      // Extraire un éventuel sous-titre existant au début du HTML
      try {
        const match = newsletter.html_content.match(
          /^<div style="margin:0 0 16px 0; font-size:16px; color:#334155; line-height:1.5;"><em>([\s\S]*?)<\/em><\/div>/i
        );
        if (match && match[1]) {
          setSubtitle(match[1]);
        } else {
          setSubtitle("");
        }
      } catch {
        setSubtitle("");
      }
    } else if (newsletter?.content) {
      setHtmlContent(`<p>${newsletter.content.replace(/\n/g, "</p><p>")}</p>`);
      setSubtitle("");
    }
  }, [newsletter]);

  const handleSave = async () => {
    if (!editedNewsletter) return;

    try {
      setIsSaving(true);
      const finalHtml = applySubtitleToHtml(htmlContent, subtitle);
      const finalText = htmlToText(finalHtml);
      const { error } = await supabase
        .from("newsletters")
        .update({
          title: editedNewsletter.title,
          content: finalText,
          html_content: finalHtml,
          category: editedNewsletter.category,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editedNewsletter.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur mise à jour newsletter:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !newsletter) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">
              {isEditing ? "Modifier la newsletter" : "Aperçu de la newsletter"}
            </h2>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() =>
                      setPreviewMode(
                        previewMode === "simple" ? "email" : "simple"
                      )
                    }
                    className="p-2 text-slate-400 hover:text-slate-600"
                    title={
                      previewMode === "simple"
                        ? "Voir comme un email"
                        : "Vue simple"
                    }
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-slate-400 hover:text-slate-600"
                title={isEditing ? "Voir l'aperçu" : "Modifier"}
              >
                {isEditing ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <Edit className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-0">
          {isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[600px]">
              {/* Panneau d'édition */}
              <div className="p-6 border-r border-slate-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={editedNewsletter?.title || ""}
                    onChange={(e) =>
                      setEditedNewsletter((prev) =>
                        prev ? { ...prev, title: e.target.value } : null
                      )
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={editedNewsletter?.category || ""}
                    onChange={(e) =>
                      setEditedNewsletter((prev) =>
                        prev
                          ? {
                              ...prev,
                              category: e.target
                                .value as Newsletter["category"],
                            }
                          : null
                      )
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="actualites">Actualités</option>
                    <option value="temoignages">Témoignages</option>
                    <option value="evenements">Événements</option>
                    <option value="ressources">Ressources</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sous-titre (facultatif)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Sous-titre de la newsletter"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contenu
                  </label>
                  <RichTextEditor
                    value={htmlContent}
                    onChange={(value) => {
                      const cleaned = cleanHtml(value);
                      const linkified = linkifyHtml(cleaned);
                      setHtmlContent(linkified);
                      const textContent = htmlToText(linkified);
                      setEditedNewsletter((prev) =>
                        prev
                          ? {
                              ...prev,
                              content: textContent,
                              html_content: linkified,
                            }
                          : null
                      );
                    }}
                    placeholder="Écrivez le contenu de votre newsletter..."
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-colors ${
                      isSaving
                        ? "bg-emerald-400 cursor-wait text-white"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Enregistrer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Panneau d'aperçu en temps réel */}
              <div className="p-6 bg-slate-50">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDevice("mobile")}
                      className={`px-3 py-1 rounded-lg text-sm border ${
                        device === "mobile"
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Mobile
                    </button>
                    <button
                      onClick={() => setDevice("tablet")}
                      className={`px-3 py-1 rounded-lg text-sm border ${
                        device === "tablet"
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Tablette
                    </button>
                    <button
                      onClick={() => setDevice("desktop")}
                      className={`px-3 py-1 rounded-lg text-sm border ${
                        device === "desktop"
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Desktop
                    </button>
                  </div>
                  <div className="text-sm text-slate-600">
                    Largeur: {getDeviceWidth(device)}px
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Aperçu en temps réel
                  </h3>
                  <div className="text-sm text-slate-600">
                    Voici comment votre newsletter apparaîtra dans les emails.
                  </div>
                </div>
                <div className="flex justify-center">
                  <div
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
                    style={{ width: getDeviceWidth(device) }}
                  >
                    <iframe
                      srcDoc={buildNewsletterHtml(
                        editedNewsletter?.title || "Titre de la newsletter",
                        applySubtitleToHtml(
                          htmlContent || "<p>Contenu de la newsletter...</p>",
                          subtitle
                        ),
                        {
                          headerTitle: "Christ Le Bon Berger",
                          brandColor:
                            "linear-gradient(135deg, #10b981, #14b8a6)",
                          logoUrl: "",
                        }
                      )}
                      className="w-full h-96 border-0"
                      sandbox="allow-same-origin allow-scripts"
                      title="Aperçu de la newsletter"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {previewMode === "email" ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-sm text-slate-600 font-medium">
                    <div className="flex items-center justify-between">
                      <span>Aperçu email (rendu fidèle)</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDevice("mobile")}
                          className={`px-3 py-1 rounded-lg text-sm border ${
                            device === "mobile"
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-white text-slate-700 border-slate-200"
                          }`}
                        >
                          Mobile
                        </button>
                        <button
                          onClick={() => setDevice("tablet")}
                          className={`px-3 py-1 rounded-lg text-sm border ${
                            device === "tablet"
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-white text-slate-700 border-slate-200"
                          }`}
                        >
                          Tablette
                        </button>
                        <button
                          onClick={() => setDevice("desktop")}
                          className={`px-3 py-1 rounded-lg text-sm border ${
                            device === "desktop"
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-white text-slate-700 border-slate-200"
                          }`}
                        >
                          Desktop
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div
                      className="border-0"
                      style={{ width: getDeviceWidth(device) }}
                    >
                      <iframe
                        srcDoc={buildNewsletterHtml(
                          newsletter.title,
                          newsletter.html_content ||
                            newsletter.content
                              .split("\n")
                              .map((line) =>
                                line.trim()
                                  ? `<p style="margin:0 0 16px 0;">${line.trim()}</p>`
                                  : "<br>"
                              )
                              .join(""),
                          {
                            headerTitle: "Christ Le Bon Berger",
                            brandColor:
                              "linear-gradient(135deg, #10b981, #14b8a6)",
                            logoUrl: "",
                          }
                        )}
                        className="w-full h-96 border-0"
                        sandbox="allow-same-origin allow-scripts"
                        title="Aperçu email de la newsletter"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                    <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        {newsletter.category === "actualites" && "Actualités"}
                        {newsletter.category === "temoignages" && "Témoignages"}
                        {newsletter.category === "evenements" && "Événements"}
                        {newsletter.category === "ressources" && "Ressources"}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 m-0">
                      {newsletter.title}
                    </h1>
                  </div>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {newsletter.content}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterPreviewModal;
