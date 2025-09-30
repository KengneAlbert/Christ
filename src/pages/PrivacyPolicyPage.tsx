import React from "react";
import {
  Lock,
  User,
  Mail,
  Calendar,
  Database,
  Shield,
  Trash2,
  Globe,
} from "lucide-react";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Politique de confidentialité
          </h1>
          <p className="text-lg text-slate-600">
            Transparence sur la collecte et l'utilisation de vos données
            personnelles
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              1. Responsable du traitement
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Association Christ Le Bon Berger. Contact:{" "}
              <a
                className="text-emerald-600 hover:underline"
                href="mailto:lebonberger025@gmail.com"
              >
                lebonberger025@gmail.com
              </a>
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-6 h-6" /> 2. Données collectées
            </h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Formulaire de contact: nom, prénom, email, message</li>
              <li>Abonnement newsletter: email, préférences d'abonnement</li>
              <li>Données techniques: logs d'accès, adresses IP (sécurité)</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6" /> 3. Finalités
            </h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Répondre à vos demandes et messages</li>
              <li>Gérer l'envoi de newsletters et communications</li>
              <li>Assurer la sécurité et le bon fonctionnement du site</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" /> 4. Base légale
            </h2>
            <p className="text-slate-700">
              Consentement (newsletter), intérêt légitime (réponse aux
              messages), et obligation légale (sécurité).
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6" /> 5. Destinataires et transferts
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Les données sont hébergées dans Supabase (UE/EEA) et peuvent être
              transmises à nos prestataires (ex: Brevo pour l'envoi d'emails).
              Aucun transfert hors UE sans garanties adéquates.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" /> 6. Durées de conservation
            </h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Newsletter: jusqu'au désabonnement</li>
              <li>Messages de contact: 24 mois</li>
              <li>Logs techniques: 12 mois</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6" /> 7. Vos droits
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Vous disposez des droits d'accès, de rectification, d'effacement,
              de limitation, d'opposition et de portabilité. Pour exercer vos
              droits:{" "}
              <a
                className="text-emerald-600 hover:underline"
                href="mailto:lebonberger025@gmail.com"
              >
                nous contacter
              </a>
              . Vous pouvez également introduire une réclamation auprès de la
              CNIL.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              8. Cookies
            </h2>
            <p className="text-slate-700">
              Pour en savoir plus et gérer vos préférences, consultez notre{" "}
              <a href="/cookies" className="text-emerald-600 hover:underline">
                Politique des cookies
              </a>
              .
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Trash2 className="w-6 h-6" /> 9. Sécurité
            </h2>
            <p className="text-slate-700">
              Nous mettons en œuvre des mesures techniques et organisationnelles
              adaptées pour protéger vos données.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
