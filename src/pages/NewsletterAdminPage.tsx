import React, { useState, useEffect } from "react";
import {
  Mail,
  Users,
  Send,
  Edit,
  Eye,
  Calendar,
  BarChart3,
  Download,
  Plus,
  Search,
  AlertCircle,
  CheckCircle,
  Save,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import AdminDashboard from "./AdminDashboard";
import {
  sendNewsletter,
  NewsletterSubscriber,
} from "../services/newsletterService";
import NewsletterPreviewModal from "../components/NewsletterPreviewModal";
import ConfirmationModal from "../components/ConfirmationModal";
import RichTextEditor from "../components/RichTextEditor";
import { buildNewsletterHtml } from "../emails/renderers";
import {
  cleanHtml,
  htmlToText,
  textToHtml,
  linkifyHtml,
  applySubtitleToHtml,
} from "../utils/htmlUtils";

interface Subscriber {
  id: number;
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
  category: "actualites" | "temoignages" | "evenements" | "ressources";
  status: "draft" | "scheduled" | "sent";
  scheduled_date?: string;
  sent_date?: string;
  recipients_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const NewsletterAdminContent: React.FC = () => {
  const { user, initialized } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "subscribers" | "newsletters" | "create" | "stats"
  >("subscribers");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    type: "delete" | "duplicate";
    newsletter: Newsletter | null;
    open: boolean;
  }>({ type: "delete", newsletter: null, open: false });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  // State for newsletters pagination
  const [newsletterCurrentPage, setNewsletterCurrentPage] = useState(1);
  const [totalNewsletters, setTotalNewsletters] = useState(0);
  const [newsletterItemsPerPage, setNewsletterItemsPerPage] = useState(10);

  // Create tab preview device state
  const [createPreviewDevice, setCreatePreviewDevice] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");
  const getDeviceWidth = (device: "mobile" | "tablet" | "desktop") => {
    switch (device) {
      case "mobile":
        return 390; // iPhone 12-ish width
      case "tablet":
        return 768; // iPad portrait
      default:
        return 900; // desktop preview width
    }
  };

  // State for newsletter preview modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] =
    useState<Newsletter | null>(null);

  // Newsletter creation form
  const [newNewsletter, setNewNewsletter] = useState({
    title: "",
    subtitle: "",
    content: "",
    html_content: "<p><br></p>",
    category: "actualites" as Newsletter["category"],
  });
  // Simple editor removed: always use rich editor

  const handlePreview = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setIsPreviewModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadNewsletters();
    setMessage({ type: "success", text: "Newsletter mise à jour avec succès" });
  };

  const loadSubscribers = React.useCallback(async () => {
    try {
      // Ne pas charger si l'utilisateur n'est pas initialisé
      if (!initialized || !user) {
        console.log("Attente de l'initialisation de l'utilisateur...");
        return;
      }

      setIsLoading(true);
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Vérifier la session avant la requête
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("Session invalide:", sessionError);
        setMessage({
          type: "error",
          text: "Session expirée. Veuillez vous reconnecter.",
        });
        return;
      }
      let query = supabase
        .from("newsletter_subscribers")
        .select(
          [
            "id",
            "email",
            "first_name",
            "last_name",
            "subscription_date",
            "is_active",
            "preferences",
          ].join(","),
          { count: "planned" }
        );

      if (searchTerm) {
        query = query.ilike("email", `%${searchTerm}%`);
      }
      if (filterStatus !== "all") {
        query = query.eq("is_active", filterStatus === "active");
      }

      const { data, error, count } = await query
        .order("subscription_date", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setSubscribers((data as unknown as Subscriber[]) || []);
      setTotalSubscribers(count || 0);
    } catch (error) {
      console.error("Erreur chargement abonnés:", error);
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des abonnés.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filterStatus, initialized, user]);

  const loadNewsletters = React.useCallback(async () => {
    try {
      // Ne pas charger si l'utilisateur n'est pas initialisé
      if (!initialized || !user) {
        console.log("Attente de l'initialisation de l'utilisateur...");
        return;
      }

      setIsLoading(true);
      const from = (newsletterCurrentPage - 1) * newsletterItemsPerPage;
      const to = from + newsletterItemsPerPage - 1;

      // Vérifier la session avant la requête
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("Session invalide:", sessionError);
        setMessage({
          type: "error",
          text: "Session expirée. Veuillez vous reconnecter.",
        });
        return;
      }
      const { data, error, count } = await supabase
        .from("newsletters")
        .select(
          [
            "id",
            "title",
            "content",
            "html_content",
            "category",
            "status",
            "scheduled_date",
            "sent_date",
            "recipients_count",
            "created_at",
            "updated_at",
            "created_by",
          ].join(","),
          { count: "planned" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setNewsletters((data as unknown as Newsletter[]) || []);
      setTotalNewsletters(count || 0);
    } catch (error) {
      console.error("Erreur chargement newsletters:", error);
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des newsletters.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [newsletterCurrentPage, newsletterItemsPerPage, initialized, user]);

  useEffect(() => {
    if (activeTab === "subscribers" && initialized && user) {
      loadSubscribers();
    }
  }, [activeTab, initialized, user, loadSubscribers]);

  useEffect(() => {
    if (activeTab === "newsletters" && initialized && user) {
      loadNewsletters();
    }
  }, [activeTab, initialized, user, loadNewsletters]);

  const handleCreateNewsletter = async () => {
    if (!user) {
      setMessage({ type: "error", text: "Vous devez être connecté." });
      return;
    }

    const hasNonEmptyHtml = newNewsletter.html_content
      ? htmlToText(newNewsletter.html_content).trim().length > 0
      : false;
    if (!newNewsletter.title || (!hasNonEmptyHtml && !newNewsletter.content)) {
      setMessage({
        type: "error",
        text: "Veuillez remplir tous les champs obligatoires (*).",
      });
      return;
    }

    try {
      setIsCreating(true);
      // Appliquer le sous-titre au HTML final avant enregistrement
      const rawHtml =
        newNewsletter.html_content || textToHtml(newNewsletter.content || "");
      const finalHtml = applySubtitleToHtml(rawHtml, newNewsletter.subtitle);
      const finalText = htmlToText(finalHtml);

      const { data, error } = await supabase
        .from("newsletters")
        .insert({
          title: newNewsletter.title,
          content: finalText,
          html_content: finalHtml,
          category: newNewsletter.category,
          status: "draft",
          recipients_count: 0,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur création newsletter:", error);
        setMessage({
          type: "error",
          text: `Erreur lors de la création: ${error.message}`,
        });
        return;
      }

      setMessage({ type: "success", text: "Newsletter créée avec succès" });

      // Réinitialiser le formulaire
      setNewNewsletter({
        title: "",
        subtitle: "",
        content: "",
        html_content: "<p><br></p>",
        category: "actualites" as Newsletter["category"],
      });

      // Mettre à jour la liste et changer d'onglet
      if (data) {
        setNewsletters((prev) => [data as Newsletter, ...prev]);
      } else {
        loadNewsletters();
      }
      setActiveTab("newsletters");
    } catch (error) {
      console.error("Erreur handleCreateNewsletter:", error);
      const msg =
        error instanceof Error ? error.message : "Erreur lors de la création";
      setMessage({ type: "error", text: `Erreur lors de la création: ${msg}` });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendNewsletter = async (newsletter: Newsletter) => {
    try {
      setSendingId(newsletter.id);
      const { data: activeSubscribers, error: subsError } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .eq("is_active", true);

      if (subsError) throw subsError;

      const newsletterSubscribers: NewsletterSubscriber[] =
        activeSubscribers.map((sub) => ({
          id: sub.id.toString(),
          email: sub.email,
          firstName: sub.first_name,
          lastName: sub.last_name,
          subscriptionDate: new Date(sub.subscription_date),
          isActive: sub.is_active,
          preferences: sub.preferences,
        }));
      const success = await sendNewsletter(newsletter, newsletterSubscribers);

      if (!success) {
        throw new Error("L'envoi d'e-mails a échoué.");
      }

      // Mettre à jour le statut de la newsletter
      const { error } = await supabase
        .from("newsletters")
        .update({
          status: "sent",
          sent_date: new Date().toISOString(),
          recipients_count: activeSubscribers.length,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newsletter.id);

      if (error) throw error;

      setMessage({
        type: "success",
        text: `Newsletter envoyée à ${activeSubscribers.length} abonnés !`,
      });
      loadNewsletters();
    } catch (error) {
      console.error("Erreur envoi newsletter:", error);
      setMessage({ type: "error", text: "Erreur lors de l'envoi" });
    } finally {
      setSendingId(null);
    }
  };

  const handleDeleteNewsletter = async (newsletter: Newsletter) => {
    try {
      setConfirm({ type: "delete", newsletter, open: true });
      return;
    } catch (error) {
      console.error("Erreur ouverture confirmation suppression:", error);
    }
  };

  const performDelete = async () => {
    if (!confirm.newsletter) return;
    const newsletter = confirm.newsletter;
    try {
      setDeletingId(newsletter.id);
      const { error } = await supabase
        .from("newsletters")
        .delete()
        .eq("id", newsletter.id);
      if (error) throw error;
      setNewsletters((prev) => prev.filter((n) => n.id !== newsletter.id));
      setMessage({ type: "success", text: "Newsletter supprimée." });
    } catch (error) {
      console.error("Erreur suppression newsletter:", error);
      setMessage({ type: "error", text: "Erreur lors de la suppression." });
    } finally {
      setDeletingId(null);
      setConfirm({ type: "delete", newsletter: null, open: false });
    }
  };

  const handleDuplicateNewsletter = async (newsletter: Newsletter) => {
    setConfirm({ type: "duplicate", newsletter, open: true });
  };

  const performDuplicate = async () => {
    if (!confirm.newsletter) return;
    const newsletter = confirm.newsletter;
    try {
      setDuplicatingId(newsletter.id);
      const newTitle = `Copie - ${newsletter.title}`;
      const { data, error } = await supabase
        .from("newsletters")
        .insert({
          title: newTitle,
          content: newsletter.content,
          html_content: newsletter.html_content,
          category: newsletter.category,
          status: "draft",
          recipients_count: 0,
          created_by: user?.id || null,
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setNewsletters((prev) => [data as Newsletter, ...prev]);
      }
      setMessage({
        type: "success",
        text: "Newsletter dupliquée en brouillon.",
      });
    } catch (error) {
      console.error("Erreur duplication newsletter:", error);
      setMessage({ type: "error", text: "Erreur lors de la duplication." });
    } finally {
      setDuplicatingId(null);
      setConfirm({ type: "duplicate", newsletter: null, open: false });
    }
  };

  const exportSubscribers = () => {
    const csvContent = [
      [
        "Email",
        "Prénom",
        "Nom",
        "Date d'abonnement",
        "Statut",
        "Actualités",
        "Témoignages",
        "Événements",
        "Ressources",
      ],
      ...subscribers.map((sub) => [
        sub.email,
        sub.first_name || "",
        sub.last_name || "",
        new Date(sub.subscription_date).toLocaleDateString("fr-FR"),
        sub.is_active ? "Actif" : "Inactif",
        sub.preferences.actualites ? "Oui" : "Non",
        sub.preferences.temoignages ? "Oui" : "Non",
        sub.preferences.evenements ? "Oui" : "Non",
        sub.preferences.ressources ? "Oui" : "Non",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abonnes_newsletter_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    // Note: This stats will only reflect the current page of subscribers.
    // For accurate global stats, new queries would be needed.
    const totalSubscribers = subscribers.length;
    const activeSubscribers = subscribers.filter((sub) => sub.is_active).length;
    const totalNewsletters = newsletters.filter(
      (n) => n.status === "sent"
    ).length;
    const lastNewsletter = newsletters
      .filter((n) => n.sent_date)
      .sort(
        (a, b) =>
          new Date(b.sent_date!).getTime() - new Date(a.sent_date!).getTime()
      )[0];

    return {
      totalSubscribers,
      activeSubscribers,
      inactiveSubscribers: totalSubscribers - activeSubscribers,
      totalNewsletters,
      lastNewsletterDate: lastNewsletter?.sent_date,
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
          <h1 className="text-3xl font-bold text-slate-800">
            Gestion des Newsletters
          </h1>
          <p className="text-slate-600 mt-2">
            Administration des abonnés et envoi des newsletters
          </p>
        </div>
      </div>

      {/* Messages */}
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

      {/* Navigation */}
      <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200 mb-8">
        {[
          { id: "subscribers", label: "Abonnés", icon: Users },
          { id: "newsletters", label: "Newsletters", icon: Mail },
          { id: "create", label: "Créer", icon: Plus },
          { id: "stats", label: "Statistiques", icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() =>
              setActiveTab(
                id as "subscribers" | "newsletters" | "create" | "stats"
              )
            }
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

      {/* Subscribers Tab */}
      {activeTab === "subscribers" && (
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
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as "all" | "active" | "inactive"
                    )
                  }
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-ring"
                >
                  <option value="all">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
                <div className="text-sm text-slate-600">
                  {totalSubscribers} abonné(s) au total
                </div>
              </div>
              <button
                onClick={exportSubscribers}
                className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover-glow"
              >
                <Download className="w-4 h-4" />
                <span>Exporter la page</span>
              </button>
            </div>
          </div>

          {/* Subscribers List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-slate-700">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-700">
                      Nom
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-700">
                      Date d'abonnement
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-700">
                      Statut
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-700">
                      Préférences
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber.id}
                      className={`hover:bg-slate-50 transition-colors duration-200 animate-slide-up delay-${
                        index * 50
                      }`}
                    >
                      <td className="px-6 py-4 text-slate-800 font-medium">
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {subscriber.first_name || subscriber.last_name
                          ? `${subscriber.first_name || ""} ${
                              subscriber.last_name || ""
                            }`.trim()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(
                          subscriber.subscription_date
                        ).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subscriber.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {subscriber.is_active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(subscriber.preferences).map(
                            ([key, value]) =>
                              value && (
                                <span
                                  key={key}
                                  className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs"
                                >
                                  {key}
                                </span>
                              )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination Controls */}
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
              {Math.ceil(totalSubscribers / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage * itemsPerPage >= totalSubscribers}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Newsletters Tab */}
      {activeTab === "newsletters" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-sm text-slate-600">
              {totalNewsletters} newsletter(s) au total
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-600">Par page</label>
              <select
                value={newsletterItemsPerPage}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setNewsletterItemsPerPage(v);
                  setNewsletterCurrentPage(1);
                  if (activeTab === "newsletters") {
                    loadNewsletters();
                  }
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          {newsletters.map((newsletter, index) => (
            <div
              key={newsletter.id}
              className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 animate-slide-up delay-${
                index * 100
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-800 hover:text-emerald-600 transition-colors duration-300">
                      {newsletter.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        newsletter.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : newsletter.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {newsletter.status === "sent"
                        ? "Envoyée"
                        : newsletter.status === "scheduled"
                        ? "Programmée"
                        : "Brouillon"}
                    </span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs">
                      {newsletter.category}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {newsletter.content}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Créée le{" "}
                        {new Date(newsletter.created_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </span>
                    {newsletter.sent_date && (
                      <span className="flex items-center space-x-1">
                        <Send className="w-4 h-4" />
                        <span>
                          Envoyée le{" "}
                          {new Date(newsletter.sent_date).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
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
                  <button
                    onClick={() => handlePreview(newsletter)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors duration-300 hover:scale-110 transform"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePreview(newsletter)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors duration-300 hover:scale-110 transform"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateNewsletter(newsletter)}
                    disabled={duplicatingId === newsletter.id}
                    className={`p-2 rounded text-slate-400 hover:text-slate-600 transition-colors ${
                      duplicatingId === newsletter.id
                        ? "opacity-60 cursor-wait"
                        : ""
                    }`}
                    title="Dupliquer"
                  >
                    {duplicatingId === newsletter.id ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteNewsletter(newsletter)}
                    disabled={deletingId === newsletter.id}
                    className={`p-2 rounded text-red-400 hover:text-red-600 transition-colors ${
                      deletingId === newsletter.id
                        ? "opacity-60 cursor-wait"
                        : ""
                    }`}
                    title="Supprimer"
                  >
                    {deletingId === newsletter.id ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"></path>
                        <path d="M10 11v6"></path>
                        <path d="M14 11v6"></path>
                        <path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2"></path>
                      </svg>
                    )}
                  </button>
                  {newsletter.status === "draft" && (
                    <button
                      onClick={() => handleSendNewsletter(newsletter)}
                      disabled={sendingId === newsletter.id}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-all duration-300 shadow-lg hover-glow ${
                        sendingId === newsletter.id
                          ? "bg-emerald-400 cursor-wait opacity-80"
                          : "bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105"
                      }`}
                    >
                      {sendingId === newsletter.id ? (
                        <>
                          <svg
                            className="animate-spin h-3 w-3 text-white"
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
                          <span>Envoi...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Envoyer</span>
                        </>
                      )}
                    </button>
                  )}
                  {newsletter.status === "sent" && (
                    <button
                      onClick={() => handleSendNewsletter(newsletter)}
                      disabled={sendingId === newsletter.id}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-all duration-300 shadow-lg hover-glow ${
                        sendingId === newsletter.id
                          ? "bg-emerald-400 cursor-wait opacity-80"
                          : "bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105"
                      }`}
                    >
                      {sendingId === newsletter.id ? (
                        <>
                          <svg
                            className="animate-spin h-3 w-3 text-white"
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
                          <span>Réenvoi...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Réenvoyer</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() =>
                setNewsletterCurrentPage((p) => Math.max(1, p - 1))
              }
              disabled={newsletterCurrentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="text-sm text-slate-700">
              Page {newsletterCurrentPage} sur{" "}
              {Math.ceil(totalNewsletters / newsletterItemsPerPage)}
            </span>
            <button
              onClick={() => setNewsletterCurrentPage((p) => p + 1)}
              disabled={
                newsletterCurrentPage * newsletterItemsPerPage >=
                totalNewsletters
              }
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Create Newsletter Tab */}
      {activeTab === "create" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Créer une nouvelle newsletter
            </h2>
            <p className="text-slate-600">
              Utilisez l'éditeur riche pour créer du contenu formaté avec aperçu
              en temps réel.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[700px]">
            {/* Panneau d'édition */}
            <div className="p-6 border-r border-slate-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={newNewsletter.title}
                  onChange={(e) =>
                    setNewNewsletter((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Titre de la newsletter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sous-titre (facultatif)
                </label>
                <input
                  type="text"
                  value={newNewsletter.subtitle}
                  onChange={(e) =>
                    setNewNewsletter((prev) => ({
                      ...prev,
                      subtitle: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Sous-titre de la newsletter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={newNewsletter.category}
                  onChange={(e) =>
                    setNewNewsletter((prev) => ({
                      ...prev,
                      category: e.target.value as Newsletter["category"],
                    }))
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="actualites">Actualités</option>
                  <option value="temoignages">Témoignages</option>
                  <option value="evenements">Événements</option>
                  <option value="ressources">Ressources</option>
                </select>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contenu *
                </label>
                <RichTextEditor
                  value={newNewsletter.html_content || "<p><br></p>"}
                  onChange={(value) => {
                    const cleanedHtml = cleanHtml(value);
                    const linkified = linkifyHtml(cleanedHtml);
                    setNewNewsletter((prev) => ({
                      ...prev,
                      html_content: linkified,
                      content: htmlToText(linkified),
                    }));
                  }}
                  placeholder="Écrivez le contenu de votre newsletter..."
                  className="flex-1"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={async () => {
                    if (isCreating) return;
                    // set flag and call
                    // we'll set/reset inside handler too for safety if needed
                    // but keep UI responsive immediately
                    // Call the existing handler
                    handleCreateNewsletter();
                  }}
                  disabled={
                    isCreating ||
                    !newNewsletter.title ||
                    !newNewsletter.html_content
                  }
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    isCreating
                      ? "bg-emerald-400 cursor-wait"
                      : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:scale-105"
                  }`}
                >
                  {isCreating ? (
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
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Créer la newsletter</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Panneau d'aperçu en temps réel */}
            <div className="p-6 bg-slate-50">
              {/* Device preview controls */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCreatePreviewDevice("mobile")}
                    className={`px-3 py-1 rounded-lg text-sm border ${
                      createPreviewDevice === "mobile"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Mobile
                  </button>
                  <button
                    onClick={() => setCreatePreviewDevice("tablet")}
                    className={`px-3 py-1 rounded-lg text-sm border ${
                      createPreviewDevice === "tablet"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Tablette
                  </button>
                  <button
                    onClick={() => setCreatePreviewDevice("desktop")}
                    className={`px-3 py-1 rounded-lg text-sm border ${
                      createPreviewDevice === "desktop"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Desktop
                  </button>
                </div>
                <div className="text-sm text-slate-600">
                  Largeur: {getDeviceWidth(createPreviewDevice)}px
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
                  style={{ width: getDeviceWidth(createPreviewDevice) }}
                >
                  <iframe
                    srcDoc={buildNewsletterHtml(
                      newNewsletter.title || "Titre de la newsletter",
                      applySubtitleToHtml(
                        newNewsletter.html_content ||
                          textToHtml(newNewsletter.content) ||
                          "<p>Contenu de la newsletter...</p>",
                        newNewsletter.subtitle
                      ),
                      {
                        headerTitle: "Christ Le Bon Berger",
                        brandColor: "linear-gradient(135deg, #10b981, #14b8a6)",
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
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirm.open && confirm.type === "delete"}
        onClose={() =>
          setConfirm({ type: "delete", newsletter: null, open: false })
        }
        onConfirm={performDelete}
        title="Confirmer la suppression"
        message={`Voulez-vous vraiment supprimer « ${
          confirm.newsletter?.title || ""
        } » ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      <ConfirmationModal
        isOpen={confirm.open && confirm.type === "duplicate"}
        onClose={() =>
          setConfirm({ type: "duplicate", newsletter: null, open: false })
        }
        onConfirm={performDuplicate}
        title="Confirmer la duplication"
        message={`Créer une copie de « ${
          confirm.newsletter?.title || ""
        } » en tant que brouillon ?`}
        confirmText="Dupliquer"
        cancelText="Annuler"
      />

      {/* Statistics Tab */}
      {activeTab === "stats" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center animate-bounce-gentle">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total abonnés</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.totalSubscribers}
                </p>
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
                <p className="text-2xl font-bold text-slate-800">
                  {stats.activeSubscribers}
                </p>
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
                <p className="text-2xl font-bold text-slate-800">
                  {stats.totalNewsletters}
                </p>
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
                    ? new Date(stats.lastNewsletterDate).toLocaleDateString(
                        "fr-FR"
                      )
                    : "Aucune"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <NewsletterPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        newsletter={selectedNewsletter}
        onSuccess={handleModalSuccess}
      />
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
