import React, { useState } from "react";
import { Mail, Check, AlertCircle, Shield, Heart, Bell } from "lucide-react";
import { supabase } from "../lib/supabase";
import { ValidationService } from "../services/validationService";

interface NewsletterSubscriptionProps {
  className?: string;
  variant?: "inline" | "modal" | "sidebar";
}

const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  className = "",
  variant = "inline",
}) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [preferences, setPreferences] = useState({
    actualites: true,
    temoignages: true,
    evenements: true,
    ressources: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValid = ValidationService.validateField(
      email,
      { required: true, type: "email", maxLength: 254 },
      "email"
    );
    if (!emailValid.isValid) {
      setStatus("error");
      setErrorMessage(emailValid.errors.join(" "));
      return;
    }
    const nameValid = firstName
      ? ValidationService.validateName(firstName, "prénom")
      : { isValid: true, errors: [] };
    if (!nameValid.isValid) {
      setStatus("error");
      setErrorMessage(nameValid.errors.join(" "));
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      // Vérifier si l'email existe déjà
      const { data: existingSubscriber, error: checkError } = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = pas de résultat trouvé, c'est normal
        console.error("Erreur vérification email:", checkError);
        throw new Error("Erreur lors de la vérification. Veuillez réessayer.");
      }

      if (existingSubscriber) {
        throw new Error(
          "Cette adresse email est déjà abonnée à notre newsletter"
        );
      }

      // Insérer le nouvel abonné
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: email.toLowerCase().trim(),
          first_name: firstName.trim() || null,
          preferences: preferences,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Erreur insertion abonné:", insertError);
        if (insertError.code === "23505") {
          throw new Error("Cette adresse email est déjà abonnée");
        }
        throw new Error("Erreur lors de l'abonnement. Veuillez réessayer.");
      }

      setStatus("success");
      setEmail("");
      setFirstName("");
      setPreferences({
        actualites: true,
        temoignages: true,
        evenements: true,
        ressources: true,
      });
    } catch (error) {
      console.error("Erreur abonnement:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (variant === "inline") {
    return (
      <div
        className={`bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100 ${className}`}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            Restez informé(e)
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Recevez nos dernières actualités, témoignages et ressources
            directement dans votre boîte mail.
          </p>
        </div>

        {status === "success" ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-green-800 mb-2">
              Merci pour votre abonnement !
            </h4>
            <p className="text-green-700">
              Vous recevrez bientôt nos actualités par email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">
                    Erreur lors de l'abonnement
                  </p>
                  <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prénom (optionnel)
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFirstName(value);
                  }}
                  maxLength={50}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                  }}
                  maxLength={254}
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Que souhaitez-vous recevoir ?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "actualites", label: "Actualités", icon: Bell },
                  { key: "temoignages", label: "Témoignages", icon: Heart },
                  { key: "evenements", label: "Événements", icon: Mail },
                  { key: "ressources", label: "Ressources", icon: Shield },
                ].map(({ key, label, icon: Icon }) => (
                  <label
                    key={key}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={preferences[key as keyof typeof preferences]}
                      onChange={() =>
                        handlePreferenceChange(key as keyof typeof preferences)
                      }
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>
                Vos données sont protégées. Désabonnement possible à tout
                moment.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className={`w-full ${
                isSubmitting || !email
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105"
              } text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-3`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Abonnement en cours...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 group-hover:animate-wiggle" />
                  <span>S'abonner à la newsletter</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  return null;
};

export default NewsletterSubscription;
