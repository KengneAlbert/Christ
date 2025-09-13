import React from 'react';
import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Shield, Send, Heart } from 'lucide-react';
import { sendContactEmail, ContactFormData } from '../services/emailService';
import { useCSRF, CSRFService } from '../services/csrfService';
import { useValidation, ValidationService } from '../services/validationService';

const Contact: React.FC = () => {
  const { token: csrfToken } = useCSRF();
  const { errors, validateField, clearErrors, hasErrors } = useValidation();
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'Demande d\'aide',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validation en temps réel
    switch (name) {
      case 'firstName':
        validateField('firstName', value, { required: true, maxLength: 50 });
        break;
      case 'lastName':
        if (value) validateField('lastName', value, { maxLength: 50 });
        break;
      case 'email':
        validateField('email', value, { required: true, maxLength: 254 });
        break;
      case 'subject':
        validateField('subject', value, { required: true, minLength: 3, maxLength: 200 });
        break;
      case 'message':
        validateField('message', value, { required: true, minLength: 10, maxLength: 5000 });
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation complète du formulaire
    const validationResult = ValidationService.validateContactForm(formData);
    if (!validationResult.isValid) {
      alert('Erreurs de validation:\n' + validationResult.errors.join('\n'));
      return;
    }

    // Vérification CSRF
    if (!CSRFService.validateToken(csrfToken)) {
      alert('Token de sécurité invalide. Veuillez recharger la page.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const success = await sendContactEmail(formData);
      
      if (success) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: 'Demande d\'aide',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Téléphone',
      info: '07 81 32 44 74',
      description: 'Disponible du lundi au vendredi de 9h à 18h',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: MessageCircle,
      title: 'Chat en ligne',
      info: 'Disponible 24h/24',
      description: 'Discussion confidentielle avec nos conseillers',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Mail,
      title: 'Email',
      info: 'contact@christlebonberger.fr',
      description: 'Réponse garantie sous 24h',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const emergencyNumbers = [
    { number: '3919', description: 'Violences Femmes Info - Gratuit 24h/24' },
    { number: '15', description: 'SAMU - Urgences médicales' },
    { number: '17', description: 'Police Secours' }
  ];

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Phone className="w-4 h-4" />
            <span>Nous contacter</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            Besoin d'aide ?
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mt-8 leading-relaxed">
            Nous sommes là pour vous écouter et vous accompagner. N'hésitez pas à nous contacter, votre sécurité et votre bien-être sont notre priorité.
          </p>
        </div>

        {/* Emergency Banner */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-3xl p-8 mb-16 border border-red-200">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-red-800 mb-4">En cas d'urgence</h3>
            <p className="text-red-700">Si vous êtes en danger immédiat, contactez les services d'urgence</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {emergencyNumbers.map((emergency, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-red-600 mb-2">{emergency.number}</div>
                <p className="text-sm text-slate-600">{emergency.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Methods */}
          <div>
            <h3 className="text-3xl font-bold text-slate-800 mb-8">Moyens de contact</h3>
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <div 
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-slate-100"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${method.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <method.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-800 mb-2">{method.title}</h4>
                      <p className="text-emerald-600 font-semibold mb-2">{method.info}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{method.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h4 className="font-semibold text-slate-800">Informations pratiques</h4>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Adresse :</strong> Paris, France</p>
                <p><strong>Horaires :</strong> Lun-Ven: 9h-18h, Sam: 9h-12h</p>
                <p><strong>Rendez-vous :</strong> Sur demande uniquement</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-3xl font-bold text-slate-800 mb-8">Envoyez-nous un message</h3>
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <div className="text-center mb-6">
                <p className="text-slate-600">Tous les échanges sont strictement confidentiels</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Token CSRF caché */}
                <input type="hidden" name="csrf_token" value={csrfToken} />

                {/* Message de statut */}
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Message envoyé avec succès !</span>
                    </div>
                    <p className="text-sm mt-1">Nous vous répondrons dans les plus brefs délais.</p>
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">Erreur lors de l'envoi</span>
                    </div>
                    <p className="text-sm mt-1">Veuillez réessayer ou nous appeler directement.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Prénom *</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      maxLength={50}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="Votre prénom"
                    />
                    {errors.firstName && (
                      <div className="mt-1 text-sm text-red-600">
                        {errors.firstName.map((error, i) => <div key={i}>{error}</div>)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nom (optionnel)</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      maxLength={50}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="Votre nom"
                    />
                    {errors.lastName && (
                      <div className="mt-1 text-sm text-red-600">
                        {errors.lastName.map((error, i) => <div key={i}>{error}</div>)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={254}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    placeholder="votre@email.com"
                  />
                  {errors.email && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.email.map((error, i) => <div key={i}>{error}</div>)}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sujet</label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
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
                      {errors.subject.map((error, i) => <div key={i}>{error}</div>)}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message *</label>
                  <textarea 
                    rows={6}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    maxLength={5000}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Décrivez votre situation ou votre demande..."
                  ></textarea>
                  {errors.message && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.message.map((error, i) => <div key={i}>{error}</div>)}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-slate-500">
                    {formData.message.length}/5000 caractères
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-slate-600">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span>Vos informations sont protégées et traitées de manière confidentielle</span>
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting || hasErrors}
                  className={`w-full focus-ring ${
                    isSubmitting || hasErrors
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 hover-glow'
                  } text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-3`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-12 shadow-xl text-white hover-lift animate-slide-up delay-600">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Heart className="w-8 h-8 animate-heartbeat" />
              <h3 className="text-3xl md:text-4xl font-bold">
                Vous n'êtes pas seul(e)
              </h3>
            </div>
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Notre équipe est là pour vous écouter, vous soutenir et vous accompagner dans votre parcours de reconstruction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:0781324474"
                className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover-lift animate-slide-in-left delay-800"
              >
                Appelez maintenant
              </a>
              <a 
                href="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover-lift animate-slide-in-right delay-900"
              >
                Plus d'informations
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;