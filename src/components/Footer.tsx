import React from "react";
import {
  Phone,
  Mail,
  Facebook,
  Instagram,
  Heart,
  ExternalLink,
  Linkedin,
  Youtube,
} from "lucide-react";
import Logo from "../assets/LogoChrist.png";

const Footer: React.FC = () => {
  const quickLinks = [
    { name: "À propos", href: "#about" },
    { name: "Nos Actions", href: "#actions" },
    { name: "Notre Équipe", href: "#team" },
    { name: "Actualités", href: "#news" },
    { name: "Contact", href: "#contact" },
  ];

  const resources = [
    { name: "Numéro national: 3919", href: "tel:3919" },
    {
      name: "Violences Femmes Info",
      href: "https://www.violences-femmes-info.gouv.fr/",
    },
    {
      name: "Centre Hubertine Auclert",
      href: "https://www.centre-hubertine-auclert.fr/",
    },
    {
      name: "Fédération Solidarité Femmes",
      href: "https://www.solidaritefemmes.org/",
    },
  ];

  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <div>
                  <img
                    src={Logo}
                    alt="Logo Christ Le Bon Berger"
                    className="w-20 h-20 object-contain"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Christ Le Bon Berger</h3>
                <p className="text-emerald-300 font-medium">
                  Aide Écoute et Réconfort
                </p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed mb-8 max-w-md">
              Association dédiée à la lutte contre les violences conjugales,
              offrant soutien, écoute et accompagnement aux victimes dans leur
              parcours de reconstruction.
            </p>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30 mb-8">
              <div className="flex items-center space-x-3 mb-3">
                <Phone className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-white">Urgence 24h/24</span>
              </div>
              <p className="text-red-200 text-sm mb-2">
                En cas de danger immédiat:
              </p>
              <div className="flex space-x-4">
                <a
                  href="tel:15"
                  className="text-red-300 hover:text-red-200 font-bold"
                >
                  15 (SAMU)
                </a>
                <a
                  href="tel:17"
                  className="text-red-300 hover:text-red-200 font-bold"
                >
                  17 (Police)
                </a>
                <a
                  href="tel:3919"
                  className="text-red-300 hover:text-red-200 font-bold"
                >
                  3919 (Info)
                </a>
              </div>
            </div>

            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/permalink.php?story_fbid=pfbid025go4Kiaq1MYgqX8omSdCtNBcgy54NgdjefomAkfP4bpfGXdS4uJwh5AVRD8MjorWl&id=61573609049917"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors duration-300 shadow-lg"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/christ-le-bon-berger"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-blue-500 transition-colors duration-300 shadow-lg"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/clbb.association/?igsh=bWx5dnBzazBqdWdu#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-pink-600 transition-colors duration-300 shadow-lg"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@clbb-association-l-amour-gagne"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors duration-300 shadow-lg"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-lg font-semibold mb-8 text-emerald-300">
              Navigation
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-emerald-300 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-8 text-emerald-300">
              Ressources utiles
            </h4>
            <ul className="space-y-4">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.href}
                    target={
                      resource.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      resource.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-slate-300 hover:text-emerald-300 transition-colors duration-300 flex items-center group text-sm"
                  >
                    <span className="flex-1">{resource.name}</span>
                    {resource.href.startsWith("http") && (
                      <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-4">
              <h5 className="font-semibold text-white">Contact direct</h5>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>+33 07 81 32 44 74</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>lebonberger025@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-16 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>
                © {new Date().getFullYear()} Christ Le Bon Berger. Tous droits
                réservés.
              </span>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-end space-x-6 text-sm">
              <a
                href="/mentions-legales"
                className="text-slate-400 hover:text-emerald-300 transition-colors duration-300"
              >
                Mentions légales
              </a>
              <a
                href="/confidentialite"
                className="text-slate-400 hover:text-emerald-300 transition-colors duration-300"
              >
                Politique de confidentialité
              </a>
              <a
                href="/cookies"
                className="text-slate-400 hover:text-emerald-300 transition-colors duration-300"
              >
                Cookies
              </a>
            </div>
          </div>

          {/* Developer Credit - Section dédiée */}
          <div className="mt-8 pt-6 border-t border-slate-800/50">
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl px-6 py-3 border border-slate-700/50">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">K</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-400 text-xs">
                    Développé avec passion par
                  </p>
                  <p className="text-slate-200 font-semibold text-sm tracking-wide">
                    KENGNE GUEMNE ALBERT
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs leading-relaxed max-w-2xl mx-auto">
              Ce site respecte votre vie privée. Toutes les communications sont
              confidentielles. Si vous êtes en danger, quittez immédiatement ce
              site et contactez les services d'urgence.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
