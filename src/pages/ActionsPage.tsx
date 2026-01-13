import React from "react";
import SEOHead from "../components/SEOHead";
import { seoService } from "../services/seoService";
import {
  UserCheck,
  Compass,
  Users,
  ExternalLink,
  ArrowRight,
  Phone,
  Heart,
  BookOpen,
} from "lucide-react";

const ActionsPage: React.FC = () => {
  const seo = seoService.generatePageSEO("actions");
  const actions = [
    {
      icon: UserCheck,
      title: "Accueil personnalisé",
      description:
        "Notre centre de ressources est votre destination unique pour obtenir des informations précieuses et un soutien en matière de prévention de la violence et de rétablissement. Vous y trouverez une multitude de ressources, notamment des articles, des guides et les coordonnées des services locaux.",
      details: [
        "Centre de ressources complet",
        "Articles et guides spécialisés",
        "Coordonnées des services locaux",
        "Soutien personnalisé",
      ],
      color: "from-emerald-500 to-teal-600",
      bgColor: "from-emerald-50 to-teal-50",
      image:
        "https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      icon: Users,
      title: "Réunions",
      description:
        "Nos réunions sont des espaces d'échange et de réflexion pour renforcer les compétences nécessaires à une communauté plus sûre et respectueuse. Nous y abordons des thèmes essentiels comme la communication, la gestion des conflits et la résilience émotionnelle.",
      details: [
        "Espaces d'échange sécurisés",
        "Renforcement des compétences",
        "Thèmes essentiels abordés",
        "Animateurs qualifiés",
      ],
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
      image:
        "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      icon: Compass,
      title: "Guide d'orientation",
      description:
        "Le guide personnalisé est un accompagnement sur mesure pour vous aider à surmonter les conflits et à retrouver un équilibre. Nos spécialistes qualifiés vous guident à travers des échanges constructifs, en vous aidant à exprimer vos émotions, à écouter et à comprendre les autres.",
      details: [
        "Accompagnement sur mesure",
        "Spécialistes qualifiés",
        "Échanges constructifs",
        "Outils concrets et soutien adapté",
      ],
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50 to-pink-50",
      image:
        "https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
  ];

  const resources = [
    {
      name: "Arrêtons les violences",
      url: "https://arretonslesviolences.gouv.fr/",
      description: "Plateforme gouvernementale de lutte contre les violences",
    },
    {
      name: "Paris CIDFF",
      url: "https://paris.cidff.info/",
      description:
        "Centre d'Information sur les Droits des Femmes et des Familles",
    },
    {
      name: "Femmes Solidaires",
      url: "https://femmes-solidaires.org/",
      description:
        "Association féministe de solidarité et d'éducation populaire",
    },
    {
      name: "App-Elles",
      url: "https://www.app-elles.fr/",
      description: "Application mobile d'alerte pour les femmes en danger",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead seo={seo} />
      {/* Hero Section */}
      <section
        className="relative min-h-[500px] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/80"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            NOS ACTIONS
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
            Ensemble, agissons contre les violences, brisons le silence.
          </p>
        </div>
      </section>

      {/* Actions principales */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Nos services d'accompagnement
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Nous proposons un accompagnement complet et personnalisé pour vous
              aider à retrouver votre autonomie et votre sérénité.
            </p>
          </div>

          <div className="space-y-16">
            {actions.map((action, index) => (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                }`}
              >
                {/* Contenu textuel */}
                <div
                  className={`space-y-6 ${
                    index % 2 === 1 ? "lg:col-start-2" : ""
                  }`}
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">
                      {action.title}
                    </h3>
                  </div>

                  <p className="text-lg text-slate-600 leading-relaxed">
                    {action.description}
                  </p>

                  <div className="space-y-3">
                    {action.details.map((detail, detailIndex) => (
                      <div
                        key={detailIndex}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-slate-700">{detail}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href="/mediatheque"
                    className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3"
                  >
                    <span>En savoir plus</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </a>
                </div>

                {/* Illustration */}
                <div
                  className={`relative ${
                    index % 2 === 1 ? "lg:col-start-1" : ""
                  }`}
                >
                  <div
                    className={`bg-gradient-to-br ${action.bgColor} rounded-3xl p-8 shadow-xl`}
                  >
                    <div className="h-64 bg-white/50 rounded-2xl overflow-hidden">
                      <img
                        src={action.image}
                        alt={action.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-200/30 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-teal-200/30 rounded-full animate-pulse delay-1000"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Centre de ressources */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              Groupes de parole
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Un espace d'écoute, de partage et de soutien mutuel
            </p>
          </div>

          <div className="space-y-16">
            {/* Introduction aux groupes de parole */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-slate-600 leading-relaxed">
                  Les groupes de parole occupent une place essentielle au sein
                  de notre association dédiée à la lutte contre les violences
                  conjugales. Ils constituent un espace d'écoute, de partage et
                  de soutien, où chaque participant peut exprimer ses émotions,
                  son vécu et ses interrogations en toute sécurité et sans
                  jugement.
                </p>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-8 shadow-xl">
                  <img
                    src="https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Groupe de parole en cercle"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Un espace bienveillant et confidentiel */}
            <div className="bg-white rounded-3xl p-12 shadow-xl border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 italic">
                Un espace bienveillant et confidentiel
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Nos groupes de parole sont animés par des professionnels formés
                à l'écoute et à l'accompagnement des victimes de violence. La
                confidentialité est une priorité absolue, garantissant à chacune
                la possibilité de s'exprimer librement, sans crainte de
                répercussions. Cet environnement respectueux favorise la
                libération de la parole et contribue à la reconstruction des
                personnes touchées.
              </p>
            </div>

            {/* Rompre l'isolement */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative lg:order-2">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 shadow-xl">
                  <img
                    src="https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Soutien et réconfort"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                </div>
              </div>

              <div className="space-y-6 lg:order-1">
                <h3 className="text-2xl font-bold text-slate-800 italic">
                  Rompre l'isolement
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Les violences conjugales enferment souvent les victimes dans
                  un isolement profond, les privant de soutien et d'échanges
                  bienveillants. Les groupes de parole permettent de créer du
                  lien, d'échanger avec d'autres personnes ayant vécu des
                  expériences similaires, et ainsi de briser le silence imposé
                  par la violence.
                </p>
              </div>
            </div>

            {/* Un soutien mutuel */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-12 shadow-xl border border-emerald-100">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-800 italic">
                    Un soutien mutuel
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    L'écoute et le partage d'expériences favorisent une prise de
                    conscience collective et individuelle. Chacune peut
                    apprendre des autres, se reconnaître dans certains
                    témoignages et se sentir comprise. Ce soutien mutuel
                    renforce la confiance en soi et encourage à entreprendre les
                    démarches nécessaires pour se reconstruire.
                  </p>
                </div>

                <div className="relative">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <img
                      src="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Groupe de soutien"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Un accompagnement vers l'autonomie */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-800 italic">
                  Un accompagnement vers l'autonomie
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Les groupes de parole ne se limitent pas à l'expression des
                  souffrances ; ils visent aussi à proposer des pistes de
                  reconstruction et de réinsertion. Grâce aux échanges et aux
                  conseils prodigués, les participants peuvent accéder à des
                  ressources utiles, être orientés vers des professionnels
                  spécialisés et envisager un avenir libéré de la violence.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  En intégrant un groupe de parole, chaque personne retrouve une
                  voix, une écoute bienveillante et une force collective pour
                  avancer vers un avenir plus serein. Nous encourageons tous
                  ceux qui en ressentent le besoin à nous rejoindre et à faire
                  de cet espace un véritable tremplin vers la résilience et
                  l'émancipation.
                </p>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 shadow-xl">
                  <img
                    src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Accompagnement professionnel"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Citation inspirante */}
            <div className="text-center bg-white rounded-3xl p-12 shadow-xl border border-slate-100">
              <blockquote className="text-2xl md:text-3xl italic font-light leading-relaxed text-slate-700 mb-6">
                « Briser l'isolement, renforcer les liens et œuvrer ensemble à
                un avenir plus apaisé et respectueux. »
              </blockquote>
              <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Centre de ressources */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              Centre de ressources
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Accédez à nos ressources partenaires pour un accompagnement
              complet
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">
                  {resource.name}
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {resource.description}
                </p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-300"
                >
                  <span>Visiter le site</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Citation inspirante */}
      <section className="py-16 bg-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-2xl md:text-3xl italic font-light leading-relaxed mb-8">
            « Ensemble, construisons une culture de compréhension et d'entraide
            pour un avenir plus harmonieux et sans violence. »
          </blockquote>
          <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-12 shadow-xl border border-emerald-100">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-6">
              Besoin d'aide ? Rejoignez-nous dans ce combat.
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Vous n'êtes pas seul. Rejoignez nos groupes pour avancer ensemble
              vers un avenir plus serein et bienveillant. Ensemble, nous pouvons
              faire la différence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:0781324474"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
              >
                <Phone className="w-5 h-5" />
                <span>Contactez-nous</span>
              </a>
              <a
                href="/contact"
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                <BookOpen className="w-5 h-5" />
                <span>En savoir plus</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ActionsPage;
