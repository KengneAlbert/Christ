import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import AdminDashboard from "./AdminDashboard";
import {
  UserPlus,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle,
  Search,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import ConfirmationModal from "../components/ConfirmationModal";
import { ButtonLoader } from "../components/Loader";

interface AuthorizedAdmin {
  id: string;
  email: string;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

interface AuthorizedWhitelistEntry {
  id: string;
  email: string;
  created_at: string;
  notes?: string | null;
}

const AdminUsersContent: React.FC = () => {
  useAuth();
  const [admins, setAdmins] = useState<AuthorizedAdmin[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [authorizedList, setAuthorizedList] = useState<
    AuthorizedWhitelistEntry[]
  >([]);
  const [authDeleteModalOpen, setAuthDeleteModalOpen] = useState(false);
  const [authorizedToDelete, setAuthorizedToDelete] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [editingAuthorizedId, setEditingAuthorizedId] = useState<string | null>(
    null
  );
  const [editedAuthorizedEmail, setEditedAuthorizedEmail] =
    useState<string>("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, email, created_at, last_login, is_active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAdmins((data || []) as AuthorizedAdmin[]);
    } catch (err) {
      console.error("Error loading admins:", err);
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des administrateurs.",
      });
    }
  }, []);

  const loadAuthorizedList = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("authorized_admins")
        .select("id, email, created_at, notes")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAuthorizedList((data || []) as AuthorizedWhitelistEntry[]);
    } catch (err) {
      console.error("Error loading authorized admins:", err);
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des emails autorisés.",
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        await Promise.all([loadAdmins(), loadAuthorizedList()]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadAdmins, loadAuthorizedList]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      setMessage({ type: "error", text: "Veuillez saisir une adresse email." });
      return;
    }

    setAddingAdmin(true);
    try {
      const { error } = await supabase
        .from("authorized_admins")
        .insert({ email: newEmail.toLowerCase() });

      if (error) {
        if ((error as { code?: string }).code === "23505") {
          throw new Error("Cet email est déjà autorisé.");
        }
        throw error;
      }

      setMessage({
        type: "success",
        text: `L'email ${newEmail} a été autorisé avec succès.`,
      });
      setNewEmail("");
      await loadAuthorizedList();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Une erreur est survenue.";
      setMessage({ type: "error", text: msg });
    } finally {
      setAddingAdmin(false);
    }
  };

  const startEditAuthorized = (entry: { id: string; email: string }) => {
    setEditingAuthorizedId(entry.id);
    setEditedAuthorizedEmail(entry.email);
  };

  const cancelEditAuthorized = () => {
    setEditingAuthorizedId(null);
    setEditedAuthorizedEmail("");
  };

  const saveEditAuthorized = async (id: string) => {
    if (!editedAuthorizedEmail) {
      setMessage({ type: "error", text: "L'email ne peut pas être vide." });
      return;
    }
    try {
      const { error } = await supabase
        .from("authorized_admins")
        .update({ email: editedAuthorizedEmail.toLowerCase() })
        .eq("id", id);
      if (error) {
        if ((error as { code?: string }).code === "23505") {
          throw new Error("Cet email est déjà autorisé.");
        }
        throw error;
      }
      setMessage({ type: "success", text: "Email mis à jour avec succès." });
      setEditingAuthorizedId(null);
      setEditedAuthorizedEmail("");
      await loadAuthorizedList();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erreur lors de la mise à jour.";
      setMessage({ type: "error", text: msg });
    }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    setDeletingAdminId(id);
    if (!window.confirm(`Désactiver l'accès pour ${email} ?`)) {
      setDeletingAdminId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("admin_users")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;

      setMessage({
        type: "success",
        text: `L'accès ${email} a été désactivé.`,
      });
      await loadAdmins();
    } catch (error: unknown) {
      console.error("Erreur lors de la suppression:", error);
      setMessage({ type: "error", text: "Erreur lors de la désactivation." });
    } finally {
      setDeletingAdminId(null);
    }
  };

  const openAuthorizedDeleteModal = (entry: { id: string; email: string }) => {
    setAuthorizedToDelete(entry);
    setAuthDeleteModalOpen(true);
  };

  const confirmDeleteAuthorized = async () => {
    if (!authorizedToDelete) return;
    try {
      const { error } = await supabase
        .from("authorized_admins")
        .delete()
        .eq("id", authorizedToDelete.id);
      if (error) throw error;
      setMessage({
        type: "success",
        text: `Autorisation supprimée pour ${authorizedToDelete.email}.`,
      });
      await loadAuthorizedList();
    } catch (error) {
      console.error("Erreur suppression autorisation:", error);
      setMessage({ type: "error", text: "Erreur lors de la suppression." });
    } finally {
      setAuthDeleteModalOpen(false);
      setAuthorizedToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Gestion des accès administrateur
        </h1>
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
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de la liste */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-700">Admins</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section: Administrateurs actuels (admin_users) */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-3">
              Administrateurs actuels
            </h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-slate-500">Chargement...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <ul>
                  {admins
                    .filter((a) =>
                      a.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((admin) => (
                      <li
                        key={admin.id}
                        className="flex justify-between items-center mb-2 p-2 border rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <span>{admin.email}</span>
                          {admin.is_active ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              actif
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              inactif
                            </span>
                          )}
                          {admin.last_login && (
                            <span className="text-xs text-slate-400">
                              Dernière connexion:{" "}
                              {new Date(admin.last_login).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteAdmin(admin.id, admin.email)
                          }
                          disabled={deletingAdminId === admin.id}
                          className={`px-3 py-1 rounded-md transition-colors duration-300 ${
                            deletingAdminId === admin.id
                              ? "bg-slate-400 cursor-not-allowed"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                        >
                          {deletingAdminId === admin.id ? (
                            <ButtonLoader type="delete" text="" size="sm" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </li>
                    ))}
                </ul>
                {admins.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    Aucun administrateur trouvé.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Emails autorisés (authorized_admins) */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">
              Emails autorisés
            </h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-slate-500">Chargement...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <ul>
                  {authorizedList
                    .filter((e) =>
                      e.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((entry) => (
                      <li
                        key={entry.id}
                        className="flex justify-between items-center mb-2 p-2 border rounded-md"
                      >
                        {editingAuthorizedId === entry.id ? (
                          <div className="flex items-center w-full gap-2">
                            <input
                              type="email"
                              value={editedAuthorizedEmail}
                              onChange={(e) =>
                                setEditedAuthorizedEmail(e.target.value)
                              }
                              className="border p-1 rounded-md flex-grow"
                            />
                            <button
                              onClick={() => saveEditAuthorized(entry.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={cancelEditAuthorized}
                              className="px-3 py-1 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <>
                            <span>{entry.email}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEditAuthorized(entry)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() =>
                                  openAuthorizedDeleteModal({
                                    id: entry.id,
                                    email: entry.email,
                                  })
                                }
                                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                </ul>
                {authorizedList.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    Aucun email autorisé.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colonne d'ajout */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 h-fit">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">
            Autoriser un email
          </h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label
                htmlFor="new-email"
                className="block text-sm font-medium text-slate-600 mb-1"
              >
                Nouvel email
              </label>
              <input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="utilisateur@exemple.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={addingAdmin}
              className={`w-full flex items-center justify-center space-x-2 font-semibold px-4 py-3 rounded-lg transition-all duration-300 transform shadow-lg ${
                addingAdmin
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:scale-105"
              }`}
            >
              {addingAdmin ? (
                <ButtonLoader type="save" text="Ajout..." size="sm" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Autoriser cet email</span>
                </>
              )}
            </button>
          </form>
          <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-800 text-sm p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>
                Les emails autorisés peuvent créer un compte administrateur. Les
                comptes créés apparaissent dans la liste des administrateurs.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation modal for deleting authorized emails */}
      <ConfirmationModal
        isOpen={authDeleteModalOpen}
        onClose={() => {
          setAuthDeleteModalOpen(false);
          setAuthorizedToDelete(null);
        }}
        onConfirm={confirmDeleteAuthorized}
        title="Confirmer la suppression"
        message={`Supprimer l'autorisation pour l'email "${
          authorizedToDelete?.email ?? ""
        }" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
};

const AdminUsersPage: React.FC = () => {
  return (
    <AdminDashboard>
      <AdminUsersContent />
    </AdminDashboard>
  );
};

export default AdminUsersPage;
