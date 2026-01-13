import React from "react";
import SEOHead from "../components/SEOHead";
import { seoService } from "../services/seoService";
import { useState } from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  Shield,
  AlertTriangle,
  Heart,
  Send,
} from "lucide-react";
import { sendContactEmail, ContactFormData } from "../services/emailService";
import { useCSRF, CSRFService } from "../services/csrfService";
import {
  useValidation,
  ValidationService,
} from "../services/validationService";

const ContactPage: React.FC = () => {
  const seo = seoService.generatePageSEO("contact");
  const { token: csrfToken } = useCSRF();
  const { errors, validateField, hasErrors } = useValidation();
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    subject: "Demande d'aide",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Validation en temps réel
    switch (name) {
      case "firstName":
        validateField("firstName", value, { required: true, maxLength: 50 });
        break;
      case "lastName":
        if (value) validateField("lastName", value, { maxLength: 50 });
        break;
      case "email":
        validateField("email", value, { required: true, maxLength: 254 });
        break;
      case "subject":
        validateField("subject", value, {
          required: true,
          minLength: 3,
          maxLength: 200,
        });
        break;
      case "message":
        validateField("message", value, {
          required: true,
          minLength: 10,
          maxLength: 5000,
        });
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation complète du formulaire
    const validationResult = ValidationService.validateContactForm(formData);
    if (!validationResult.isValid) {
      alert("Erreurs de validation:\n" + validationResult.errors.join("\n"));
      return;
    }

    // Vérification CSRF
    if (!CSRFService.validateToken(csrfToken)) {
      alert("Token de sécurité invalide. Veuillez recharger la page.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const success = await sendContactEmail(formData);

      if (success) {
        setSubmitStatus("success");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "Demande d'aide",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const emergencyNumbers = [
    {
      number: "3919",
      description: "Violences Femmes Info - Gratuit 24h/24",
      type: "Ligne nationale d'information",
      color: "from-red-500 to-red-600",
    },
    {
      number: "15",
      description: "SAMU - Urgences médicales",
      type: "Urgence médicale",
      color: "from-red-600 to-red-700",
    },
    {
      number: "17",
      description: "Police Secours",
      type: "Urgence sécuritaire",
      color: "from-blue-600 to-blue-700",
    },
    {
      number: "07 81 32 44 74",
      description: "Christ Le Bon Berger",
      type: "Notre association",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Téléphone",
      info: "07 81 32 44 74",
      description: "Disponible du lundi au vendredi de 9h à 18h",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Mail,
      title: "Email",
      info: "lebonberger025@gmail.com",
      description: "Réponse garantie sous 24h",
      color: "from-blue-500 to-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead seo={seo} />
      {/* Hero Section */}
      <section
        className="relative min-h-[400px] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/80"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            CONTACT
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
            Nous sommes là pour vous écouter et vous accompagner
          </p>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-16 bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <AlertTriangle className="w-4 h-4" />
              <span>Urgences</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              En cas d'urgence
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Si vous êtes en danger immédiat, n'hésitez pas à contacter les
              services d'urgence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyNumbers.map((emergency, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-red-100"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${emergency.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-2">
                  {emergency.number}
                </div>
                <div className="text-sm font-medium text-slate-600 mb-2">
                  {emergency.type}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {emergency.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Nous contacter
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Plusieurs moyens pour nous joindre selon vos préférences et votre
              situation
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-slate-100"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${method.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  {method.title}
                </h3>
                <div className="text-lg font-semibold text-emerald-600 mb-3">
                  {method.info}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {method.description}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  Envoyez-nous un message
                </h3>
                <p className="text-slate-600">
                  Tous les échanges sont strictement confidentiels
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Token CSRF caché */}
                <input type="hidden" name="csrf_token" value={csrfToken} />

                {/* Messages de statut */}
                {submitStatus === "success" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">
                        Message envoyé avec succès !
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      Notre équipe vous contactera dans les plus brefs délais.
                    </p>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">
                        Erreur lors de l'envoi
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      Veuillez réessayer ou nous appeler au 07 81 32 44 74
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      maxLength={50}
                      required
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="Votre prénom"
                    />
                    {errors.firstName && (
                      <div className="mt-1 text-sm text-red-600">
                        {errors.firstName.map((error, i) => (
                          <div key={i}>{error}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nom (optionnel)
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      maxLength={50}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="Votre nom"
                    />
                    {errors.lastName && (
                      <div className="mt-1 text-sm text-red-600">
                        {errors.lastName.map((error, i) => (
                          <div key={i}>{error}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={254}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    placeholder="votre@email.com"
                  />
                  {errors.email && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.email.map((error, i) => (
                        <div key={i}>{error}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sujet
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  >
                    <option>Demande d'aide</option>
                    <option>Information générale</option>
                    <option>Bénévolat</option>
                    <option>Témoignage</option>
                    <option>Urgence</option>
                    <option>Autre</option>
                  </select>
                  {errors.subject && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.subject.map((error, i) => (
                        <div key={i}>{error}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={6}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    maxLength={5000}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Décrivez votre situation ou votre demande..."
                  ></textarea>
                  {errors.message && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.message.map((error, i) => (
                        <div key={i}>{error}</div>
                      ))}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-slate-500">
                    {formData.message.length}/5000 caractères
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm text-slate-600">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span>
                    Vos informations sont protégées et traitées de manière
                    confidentielle
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || hasErrors}
                  className={`w-full ${
                    isSubmitting || hasErrors
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105"
                  } text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-3`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              Ressources utiles
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              D'autres organisations qui peuvent vous aider
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Violences Femmes Info",
                description: "Plateforme nationale d'information",
                contact: "3919 - Gratuit 24h/24",
                website: "www.violences-femmes-info.gouv.fr",
              },
              {
                name: "Fédération Solidarité Femmes",
                description: "Réseau d'associations spécialisées",
                contact: "Centres d'hébergement",
                website: "www.solidaritefemmes.org",
              },
              {
                name: "Centre Hubertine Auclert",
                description: "Centre francilien pour l'égalité",
                contact: "Ressources et formations",
                website: "www.centre-hubertine-auclert.fr",
              },
            ].map((resource, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {resource.name}
                </h3>
                <p className="text-slate-600 mb-4">{resource.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span className="text-slate-700">{resource.contact}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-slate-700">{resource.website}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Heart className="w-8 h-8 text-white" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Vous n'êtes pas seul(e)
            </h2>
          </div>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Notre équipe est là pour vous écouter, vous soutenir et vous
            accompagner dans votre parcours de reconstruction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0781324474"
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Appelez maintenant
            </a>
            <button className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
              Envoyer un message
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
