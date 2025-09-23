import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

interface AdminAuthProps {
  onSuccess: () => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
    details?: string;
  } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  const { signUp, signIn, resetPassword } = useAuth();

  const validatePassword = (
    password: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (password.length < 12) {
      errors.push("Le mot de passe doit contenir au moins 12 caractères");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une majuscule");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une minuscule");
    }
    if (!/\d/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push(
        "Le mot de passe doit contenir au moins un caractère spécial"
      );
    }
    return { isValid: errors.length === 0, errors };
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (mode === "register" && value) {
      const validation = validatePassword(value);
      const score = Math.max(0, Math.min(4, 5 - validation.errors.length));
      setPasswordStrength({
        score,
        feedback: validation.errors,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          setMessage({ type: "success", text: "Connexion réussie !" });
          setTimeout(() => onSuccess(), 1000);
        }
      } else if (mode === "register") {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.errors.join("\n"));
        }
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas");
        }
        const { data, error } = await signUp(email, password);
        if (error) {
          throw error;
        }
        setMessage({
          type: "success",
          text: "Compte créé ! Vérifiez votre email pour confirmer votre inscription.",
        });
      } else if (mode === "forgot") {
        const { data, error } = await resetPassword(email);
        if (error) {
          throw error;
        }
        setMessage({
          type: "success",
          text: "Email de réinitialisation envoyé ! Vérifiez votre boîte mail.",
        });
      }
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue.";
      let errorDetails = "";

      // Gestion spécifique des erreurs d'autorisation
      if (
        error.message === "Accès non autorisé" ||
        error.message === "Accès restreint"
      ) {
        errorMessage = "🚫 Accès non autorisé";
        errorDetails =
          "Cette adresse email n'est pas dans notre liste d'administrateurs autorisés. Seuls les membres de l'équipe Christ Le Bon Berger peuvent accéder à cette section.";
      } else if (error.message === "Invalid login credentials") {
        errorMessage = "🔑 Identifiants incorrects";
        errorDetails = "Vérifiez votre adresse email et votre mot de passe.";
      } else if (error.message === "Email not confirmed") {
        errorMessage = "📧 Email non confirmé";
        errorDetails =
          "Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.";
      } else if (error.message?.includes("autorisée")) {
        errorMessage = "🚫 Email non autorisé";
        errorDetails =
          "Cette adresse email n'est pas autorisée à créer un compte administrateur. Contactez l'équipe si vous pensez qu'il s'agit d'une erreur.";
      } else if (error.message) {
        errorMessage = `⚠️ ${error.message}`;
        if (error.details) {
          errorDetails = error.details;
        }
      }

      setMessage({
        type: "error",
        text: errorMessage,
        details: errorDetails,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-gentle">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {mode === "login"
                ? "Connexion Admin"
                : mode === "register"
                ? "Créer un compte"
                : "Mot de passe oublié"}
            </h1>
            <p className="text-slate-600">
              {mode === "login"
                ? "Accédez au tableau de bord"
                : mode === "register"
                ? "Créez votre compte administrateur"
                : "Réinitialisez votre mot de passe"}
            </p>
          </div>
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              } animate-slide-down`}
            >
              <div className="flex items-start space-x-2">
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <span className="font-medium block">{message.text}</span>
                  {message.details && (
                    <p className="text-sm mt-1 opacity-90 leading-5">
                      {message.details}
                    </p>
                  )}
                  {message.type === "error" && (
                    <p className="text-xs mt-2 opacity-75">
                      💬 Besoin d'aide ? Contactez-nous à{" "}
                      <a
                        href="mailto:contact@christ-le-bon-berger.com"
                        className="underline hover:no-underline"
                      >
                        contact@christ-le-bon-berger.com
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 focus-ring"
                  placeholder="admin@christlebonberger.fr"
                />
              </div>
            </div>
            {mode !== "forgot" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 focus-ring"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
            {mode === "register" && password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Force du mot de passe:</span>
                  <span
                    className={`font-medium ${
                      passwordStrength.score >= 4
                        ? "text-green-600"
                        : passwordStrength.score >= 3
                        ? "text-yellow-600"
                        : passwordStrength.score >= 2
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {passwordStrength.score >= 4
                      ? "Très fort"
                      : passwordStrength.score >= 3
                      ? "Fort"
                      : passwordStrength.score >= 2
                      ? "Moyen"
                      : "Faible"}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 4
                        ? "bg-green-500"
                        : passwordStrength.score >= 3
                        ? "bg-yellow-500"
                        : passwordStrength.score >= 2
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  ></div>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-xs text-red-600 space-y-1">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <li key={index}>• {feedback}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 focus-ring"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={
                isLoading || (mode === "register" && passwordStrength.score < 3)
              }
              className={`w-full focus-ring ${
                isLoading || (mode === "register" && passwordStrength.score < 3)
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 hover-glow"
              } text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-3`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {mode === "login"
                      ? "Connexion..."
                      : mode === "register"
                      ? "Création..."
                      : "Envoi..."}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {mode === "login"
                      ? "Se connecter"
                      : mode === "register"
                      ? "Créer le compte"
                      : "Envoyer le lien"}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
          <div className="mt-8 text-center space-y-3">
            {mode === "login" && (
              <>
                <button
                  onClick={() => setMode("forgot")}
                  className="text-emerald-600 hover:text-emerald-700 text-sm transition-colors duration-300 hover:scale-105 transform"
                >
                  Mot de passe oublié ?
                </button>
                <div className="text-slate-500 text-sm">
                  Pas encore de compte ?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-300"
                  >
                    S'inscrire
                  </button>
                </div>
              </>
            )}
            {mode === "register" && (
              <div className="text-slate-500 text-sm">
                Déjà un compte ?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-300"
                >
                  Se connecter
                </button>
              </div>
            )}
            {mode === "forgot" && (
              <button
                onClick={() => setMode("login")}
                className="text-emerald-600 hover:text-emerald-700 text-sm transition-colors duration-300"
              >
                Retour à la connexion
              </button>
            )}
          </div>
          <div className="mt-8 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-600 text-sm">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Accès sécurisé réservé aux administrateurs autorisés</span>
            </div>
            {mode === "register" && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-slate-600 font-medium">
                  📋 Conditions d'inscription :
                </div>
                <ul className="text-xs text-slate-500 space-y-1 ml-2">
                  <li>• Votre email doit être pré-autorisé par l'équipe</li>
                  <li>
                    • Seuls les membres de Christ Le Bon Berger peuvent
                    s'inscrire
                  </li>
                  <li>
                    • Contactez-nous si vous pensez avoir les droits d'accès
                  </li>
                </ul>
              </div>
            )}
            {mode === "login" && (
              <div className="mt-2 text-xs text-slate-500">
                Accès réservé aux membres autorisés de l'équipe administrative.
              </div>
            )}
          </div>
          <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-xs text-blue-800 space-y-1">
              <div>• La sécurité est désormais gérée côté serveur.</div>
              <div>• Session sécurisée avec timeout automatique</div>
              {mode === "register" && (
                <div>
                  • Mot de passe: min 12 caractères, majuscules, minuscules,
                  chiffres et caractères spéciaux
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
