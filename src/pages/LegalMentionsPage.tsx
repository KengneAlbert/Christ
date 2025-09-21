import React from "react";
import {
  Shield,
  Building2,
  Mail,
  Phone,
  Globe,
  Server,
  FileText,
} from "lucide-react";

const LegalMentionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Mentions légales
          </h1>
          <p className="text-lg text-slate-600">
            Informations relatives à l'éditeur, à l'hébergement et à
            l'utilisation du site
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-600" /> Éditeur du site
            </h2>
            <div className="text-slate-700 leading-relaxed">
              <p className="font-semibold">Association Christ Le Bon Berger</p>
              <p>
                Adresse: 29 rue du docteur Fleming, Aulnay-sous-bois, France
              </p>
              <p>SIREN / RNA (si applicable): N/A</p>
              <div className="mt-3 space-y-1">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" /> Email:
                  pokasuzy99@gmail.com
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" /> Téléphone: +33
                  07 81 32 44 74
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Server className="w-6 h-6 text-slate-700" /> Hébergement
            </h2>
            <div className="text-slate-700 leading-relaxed">
              <p>Ce site est hébergé par Vercel, Inc.</p>
              <p>Adresse: 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
              <p>
                Site web:{" "}
                <a
                  href="https://vercel.com"
                  className="text-emerald-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  vercel.com
                </a>
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-slate-700" /> Propriété
              intellectuelle
            </h2>
            <div className="text-slate-700 leading-relaxed space-y-3">
              <p>
                Le contenu de ce site (textes, images, graphismes, logos,
                vidéos, icônes, etc.) est protégé par le droit d'auteur. Toute
                reproduction, représentation, modification, publication,
                adaptation ou exploitation non autorisée est interdite.
              </p>
              <p>
                Les marques et logos de tiers sont la propriété de leurs
                détenteurs respectifs.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-slate-700" /> Données personnelles
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Le traitement des données personnelles est détaillé dans notre{" "}
              <a
                href="/confidentialite"
                className="text-emerald-600 hover:underline"
              >
                Politique de confidentialité
              </a>
              .
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Responsabilité
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Nous mettons tout en œuvre pour assurer l'exactitude des
              informations, mais ne pouvons être tenus responsables des erreurs
              ou omissions, ni de l'utilisation qui pourrait être faite des
              informations fournies.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalMentionsPage;
