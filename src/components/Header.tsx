import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, X, Shield, Phone } from "lucide-react";
import Logo from "../assets/LogoChrist.png";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActivePage = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center space-x-4 hover:opacity-80 transition-opacity duration-300"
          >
            <div>
              <img
                src={Logo}
                alt="Logo Christ Le Bon Berger"
                className="w-20 h-20 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Christ Le Bon Berger
              </h1>
              <p className="text-sm text-emerald-600 font-medium">
                Aide Écoute et Réconfort
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            <a
              href="/about"
              className={`transition-all duration-300 font-medium relative group hover:transform hover:scale-105 ${
                isActivePage("/about")
                  ? "text-emerald-600"
                  : "text-slate-700 hover:text-emerald-600"
              }`}
            >
              À propos
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ${
                  isActivePage("/about") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </a>
            <a
              href="/actions"
              className={`transition-all duration-300 font-medium relative group hover:transform hover:scale-105 ${
                isActivePage("/actions")
                  ? "text-emerald-600"
                  : "text-slate-700 hover:text-emerald-600"
              }`}
            >
              Nos Actions
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ${
                  isActivePage("/actions") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </a>
            <a
              href="/team"
              className={`transition-all duration-300 font-medium relative group hover:transform hover:scale-105 ${
                isActivePage("/team")
                  ? "text-emerald-600"
                  : "text-slate-700 hover:text-emerald-600"
              }`}
            >
              Notre Équipe
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ${
                  isActivePage("/team") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </a>
            <a
              href="/contact"
              className={`transition-all duration-300 font-medium relative group hover:transform hover:scale-105 ${
                isActivePage("/contact")
                  ? "text-emerald-600"
                  : "text-slate-700 hover:text-emerald-600"
              }`}
            >
              Contact
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ${
                  isActivePage("/contact") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </a>
            <a
              href="/mediatheque"
              className={`transition-all duration-300 font-medium relative group hover:transform hover:scale-105 ${
                isActivePage("/mediatheque")
                  ? "text-emerald-600"
                  : "text-slate-700 hover:text-emerald-600"
              }`}
            >
              Médiathèque
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ${
                  isActivePage("/mediatheque")
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              ></span>
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <a
              href="tel:17"
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg animate-heartbeat"
            >
              <Phone className="w-4 h-4" />
              <span>Urgence - 17</span>
            </a>
            <a
              href="https://www.helloasso.com/associations/christ-le-bon-berger-c-l-b-b/formulaires/1"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg hover-glow"
            >
              Faire un don
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:rotate-3"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 animate-rotate-in" />
            ) : (
              <Menu className="w-6 h-6 animate-scale-in" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100 mt-4 pt-4 animate-slide-up">
            <div className="flex flex-col space-y-4">
              <a
                href="/about"
                className={`transition-all duration-300 py-2 hover:transform hover:translateX-2 animate-slide-in-left delay-100 ${
                  isActivePage("/about")
                    ? "text-emerald-600 font-semibold"
                    : "text-slate-700 hover:text-emerald-600"
                }`}
              >
                À propos
              </a>
              <a
                href="/actions"
                className={`transition-all duration-300 py-2 hover:transform hover:translateX-2 animate-slide-in-left delay-200 ${
                  isActivePage("/actions")
                    ? "text-emerald-600 font-semibold"
                    : "text-slate-700 hover:text-emerald-600"
                }`}
              >
                Nos Actions
              </a>
              <a
                href="/team"
                className={`transition-all duration-300 py-2 hover:transform hover:translateX-2 animate-slide-in-left delay-300 ${
                  isActivePage("/team")
                    ? "text-emerald-600 font-semibold"
                    : "text-slate-700 hover:text-emerald-600"
                }`}
              >
                Notre Équipe
              </a>
              <a
                href="/contact"
                className={`transition-all duration-300 py-2 hover:transform hover:translateX-2 animate-slide-in-left delay-400 ${
                  isActivePage("/contact")
                    ? "text-emerald-600 font-semibold"
                    : "text-slate-700 hover:text-emerald-600"
                }`}
              >
                Contact
              </a>
              <a
                href="/mediatheque"
                className={`transition-all duration-300 py-2 hover:transform hover:translateX-2 animate-slide-in-left delay-500 ${
                  isActivePage("/mediatheque")
                    ? "text-emerald-600 font-semibold"
                    : "text-slate-700 hover:text-emerald-600"
                }`}
              >
                Médiathèque
              </a>
              <div className="flex flex-col space-y-3 pt-4 animate-slide-in-left delay-600">
                <a
                  href="tel:17"
                  className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-heartbeat"
                >
                  <Phone className="w-4 h-4" />
                  <span>Urgence - 17</span>
                </a>
                <a
                  href="https://www.helloasso.com/associations/christ-le-bon-berger-c-l-b-b/formulaires/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover-glow block text-center"
                >
                  Faire un don
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
