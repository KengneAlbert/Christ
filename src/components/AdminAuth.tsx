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
  Smartphone,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { ButtonLoader } from "./Loader";

interface AdminAuthProps {
  onSuccess: () => void;
}

type AuthMode = "login" | "register" | "forgot" | "mfa-verify" | "mfa-setup";

const AdminAuth: React.FC<AdminAuthProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
    details?: string;
  } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  // MFA state
  const [otpCode, setOtpCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");

  const { signUp, resetPassword, enrollMFA, verifyMFA, listMFAFactors } = useAuth();

  const validatePassword = (pwd: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (pwd.length < 12) errors.push("Minimum 12 caractères");
    if (!/[A-Z]/.test(pwd)) errors.push("Au moins une majuscule");
    if (!/[a-z]/.test(pwd)) errors.push("Au moins une minuscule");
    if (!/\d/.test(pwd)) errors.push("Au moins un chiffre");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push("Au moins un caractère spécial");
    return { isValid: errors.length === 0, errors };
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (mode === "register" && value) {
      const validation = validatePassword(value);
      const score = Math.max(0, Math.min(4, 5 - validation.errors.length));
      setPasswordStrength({ score, feedback: validation.errors });
    }
  };

  const handleLoginSubmit = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const msg = error.message;
      if (msg.includes("Invalid login credentials")) throw new Error("Email ou mot de passe incorrect");
      if (msg.includes("Email not confirmed")) throw new Error("Veuillez confirmer votre email");
      throw new Error("Erreur de connexion. Vérifiez votre configuration Supabase");
    }

    if (!data.user) throw new Error("Connexion échouée");

    // Vérifier si MFA est déjà configuré
    const { data: factors } = await listMFAFactors();
    const totpFactor = factors?.totp?.[0];

    if (totpFactor) {
      setMfaFactorId(totpFactor.id);
      setMode("mfa-verify");
      setMessage({ type: "info", text: "Vérification en deux étapes", details: "Entrez le code de votre application d'authentification." });
    } else {
      // Pas de MFA configuré → forcer l'inscription
      const { data: enrollData, error: enrollErr } = await enrollMFA();
      if (enrollErr || !enrollData) throw new Error("Impossible de démarrer la configuration MFA");
      setMfaFactorId(enrollData.id);
      setMfaQrCode(enrollData.totp.qr_code);
      setMfaSecret(enrollData.totp.secret);
      setMode("mfa-setup");
      setMessage({
        type: "info",
        text: "Configuration MFA obligatoire",
        details: "Scannez le QR code avec Google Authenticator ou Authy, puis entrez le code généré.",
      });
    }
  };

  const handleMfaSubmit = async () => {
    if (otpCode.length !== 6) throw new Error("Le code doit contenir 6 chiffres");

    const { error } = await verifyMFA(mfaFactorId, otpCode);
    if (error) throw new Error("Code incorrect. Réessayez.");

    setMessage({ type: "success", text: "Authentification réussie !" });
    setTimeout(() => onSuccess(), 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === "login") {
        await handleLoginSubmit();
      } else if (mode === "mfa-verify" || mode === "mfa-setup") {
        await handleMfaSubmit();
      } else if (mode === "register") {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) throw new Error(passwordValidation.errors.join("\n"));
        if (password !== confirmPassword) throw new Error("Les mots de passe ne correspondent pas");
        const { error } = await signUp(email, password);
        if (error) throw error;
        setMessage({ type: "success", text: "Compte créé ! Vérifiez votre email pour confirmer." });
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setMessage({ type: "success", text: "Email de réinitialisation envoyé !" });
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? "Une erreur est survenue.";
      let text = `⚠️ ${msg}`;
      let details = "";

      if (msg === "Invalid login credentials") {
        text = "🔑 Identifiants incorrects";
        details = "Vérifiez votre adresse email et votre mot de passe.";
      } else if (msg.includes("autorisée") || msg === "Accès non autorisé") {
        text = "🚫 Email non autorisé";
        details = "Cette adresse n'est pas dans la liste des administrateurs autorisés.";
      }

      setMessage({ type: "error", text, details });
    } finally {
      setIsLoading(false);
    }
  };

  const strengthColor = (score: number) =>
    score >= 4 ? "bg-green-500" : score >= 3 ? "bg-yellow-500" : score >= 2 ? "bg-orange-500" : "bg-red-500";

  const strengthLabel = (score: number) =>
    score >= 4 ? "Très fort" : score >= 3 ? "Fort" : score >= 2 ? "Moyen" : "Faible";

  const isMfaMode = mode === "mfa-verify" || mode === "mfa-setup";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-gentle">
              {isMfaMode ? <Smartphone className="w-10 h-10 text-white" /> : <Shield className="w-10 h-10 text-white" />}
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {mode === "login" ? "Connexion Admin"
                : mode === "register" ? "Créer un compte"
                : mode === "forgot" ? "Mot de passe oublié"
                : mode === "mfa-setup" ? "Configurer le 2FA"
                : "Vérification 2FA"}
            </h1>
            <p className="text-slate-600">
              {mode === "login" ? "Accédez au tableau de bord"
                : mode === "register" ? "Créez votre compte administrateur"
                : mode === "forgot" ? "Réinitialisez votre mot de passe"
                : mode === "mfa-setup" ? "Sécurisez votre compte (obligatoire)"
                : "Entrez le code de votre application"}
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border ${
              message.type === "success" ? "bg-green-50 border-green-200 text-green-800"
              : message.type === "info" ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-red-50 border-red-200 text-red-800"
            } animate-slide-down`}>
              <div className="flex items-start space-x-2">
                {message.type === "success"
                  ? <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  : <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                <div className="flex-1">
                  <span className="font-medium block">{message.text}</span>
                  {message.details && <p className="text-sm mt-1 opacity-90 leading-5">{message.details}</p>}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── MFA SETUP : QR code ── */}
            {mode === "mfa-setup" && mfaQrCode && (
              <div className="text-center space-y-4">
                <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 inline-block">
                  <img src={mfaQrCode} alt="QR Code MFA" className="w-48 h-48 mx-auto" />
                </div>
                {mfaSecret && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Code manuel (si scan impossible)</p>
                    <p className="font-mono text-sm text-slate-800 break-all select-all">{mfaSecret}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── MFA : code OTP ── */}
            {isMfaMode && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Code à 6 chiffres
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                  className="w-full text-center text-2xl tracking-[0.5em] py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="000000"
                />
              </div>
            )}

            {/* ── LOGIN ── */}
            {(mode === "login" || mode === "register" || mode === "forgot") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    placeholder="admin@christlebonberger.fr"
                  />
                </div>
              </div>
            )}

            {mode !== "forgot" && !isMfaMode && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Indicateur force mdp */}
            {mode === "register" && password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Force du mot de passe :</span>
                  <span className={`font-medium ${passwordStrength.score >= 4 ? "text-green-600" : passwordStrength.score >= 3 ? "text-yellow-600" : "text-red-600"}`}>
                    {strengthLabel(passwordStrength.score)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-300 ${strengthColor(passwordStrength.score)}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}></div>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-xs text-red-600 space-y-1">
                    {passwordStrength.feedback.map((fb, i) => <li key={i}>• {fb}</li>)}
                  </ul>
                )}
              </div>
            )}

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (mode === "register" && passwordStrength.score < 3) || (isMfaMode && otpCode.length !== 6)}
              className={`w-full ${
                isLoading || (mode === "register" && passwordStrength.score < 3) || (isMfaMode && otpCode.length !== 6)
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105"
              } text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-3`}
            >
              {isLoading ? (
                <ButtonLoader
                  type={mode === "register" ? "save" : mode === "forgot" ? "send" : "default"}
                  text={mode === "register" ? "Création..." : mode === "forgot" ? "Envoi..." : isMfaMode ? "Vérification..." : "Connexion..."}
                  size="md"
                />
              ) : (
                <>
                  <span>
                    {mode === "login" ? "Se connecter"
                      : mode === "register" ? "Créer le compte"
                      : mode === "forgot" ? "Envoyer le lien"
                      : mode === "mfa-setup" ? "Activer le 2FA"
                      : "Vérifier le code"}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Navigation entre modes */}
          <div className="mt-8 text-center space-y-3">
            {mode === "login" && (
              <>
                <button onClick={() => setMode("forgot")} className="text-emerald-600 hover:text-emerald-700 text-sm transition-colors duration-300">
                  Mot de passe oublié ?
                </button>
                <div className="text-slate-500 text-sm">
                  Pas encore de compte ?{" "}
                  <button onClick={() => setMode("register")} className="text-emerald-600 hover:text-emerald-700 font-medium">
                    S'inscrire
                  </button>
                </div>
              </>
            )}
            {mode === "register" && (
              <div className="text-slate-500 text-sm">
                Déjà un compte ?{" "}
                <button onClick={() => setMode("login")} className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Se connecter
                </button>
              </div>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("login")} className="text-emerald-600 hover:text-emerald-700 text-sm">
                Retour à la connexion
              </button>
            )}
            {isMfaMode && (
              <button
                onClick={() => { supabase.auth.signOut(); setMode("login"); setOtpCode(""); setMessage(null); }}
                className="text-slate-500 hover:text-slate-700 text-sm transition-colors duration-300"
              >
                ← Recommencer la connexion
              </button>
            )}
          </div>

          {/* Badge sécurité */}
          <div className="mt-8 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-600 text-sm">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>
                {isMfaMode
                  ? "Authentification à deux facteurs (TOTP)"
                  : "Accès sécurisé réservé aux administrateurs autorisés"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
