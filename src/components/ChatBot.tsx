import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Phone, AlertTriangle, Heart, Shield } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  options?: string[];
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Message d'accueil initial
      setTimeout(() => {
        addBotMessage(
          "Bonjour, je suis votre assistant virtuel. Je suis là pour vous aider et vous orienter en toute confidentialité. Comment puis-je vous aider aujourd'hui ?",
          [
            "J'ai besoin d'aide urgente",
            "Je cherche des informations",
            "Je veux parler à quelqu'un",
            "Numéros d'urgence"
          ]
        );
      }, 500);
    }
  }, [isOpen]);

  const addBotMessage = (text: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now(),
        text,
        isBot: true,
        timestamp: new Date(),
        options
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    handleBotResponse(option);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addUserMessage(inputValue);
      handleBotResponse(inputValue);
      setInputValue('');
    }
  };

  const handleBotResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();

    if (message.includes('urgence') || message.includes('danger') || message.includes('aide urgente')) {
      addBotMessage(
        "🚨 Si vous êtes en danger immédiat, contactez les services d'urgence :\n\n• Police : 17\n• SAMU : 15\n• Violences Femmes Info : 3919 (gratuit 24h/24)\n• Notre association : 07 81 32 44 74\n\nVotre sécurité est notre priorité absolue.",
        ["Appeler maintenant", "Autres ressources", "Parler à un conseiller"]
      );
    } else if (message.includes('information') || message.includes('renseignement')) {
      addBotMessage(
        "Je peux vous renseigner sur :\n\n• Nos services d'accompagnement\n• Les groupes de parole\n• Vos droits légaux\n• Les démarches à entreprendre\n• Les ressources disponibles\n\nQue souhaitez-vous savoir ?",
        ["Nos services", "Groupes de parole", "Droits légaux", "Ressources utiles"]
      );
    } else if (message.includes('parler') || message.includes('conseiller') || message.includes('écoute')) {
      addBotMessage(
        "Nous proposons plusieurs moyens pour vous mettre en relation avec nos conseillers :\n\n• Téléphone : 07 81 32 44 74 (Lun-Ven 9h-18h)\n• Email : contact@christlebonberger.fr\n• Formulaire de contact sur le site\n• Rendez-vous sur demande\n\nTous nos échanges sont strictement confidentiels.",
        ["Appeler maintenant", "Envoyer un email", "Prendre rendez-vous"]
      );
    } else if (message.includes('numéro') || message.includes('urgence') || message.includes('contact')) {
      addBotMessage(
        "📞 Numéros importants :\n\n🆘 URGENCES :\n• Police : 17\n• SAMU : 15\n• Pompiers : 18\n\n💬 ÉCOUTE ET AIDE :\n• Violences Femmes Info : 3919\n• Notre association : 07 81 32 44 74\n• SOS Amitié : 09 72 39 40 50",
        ["Sauvegarder ces numéros", "Plus d'informations", "Parler à quelqu'un"]
      );
    } else if (message.includes('service') || message.includes('accompagnement')) {
      addBotMessage(
        "🤝 Nos services d'accompagnement :\n\n• Accueil personnalisé et écoute bienveillante\n• Groupes de parole et soutien mutuel\n• Orientation juridique et administrative\n• Accompagnement dans les démarches\n• Suivi personnalisé\n\nTous nos services sont gratuits et confidentiels.",
        ["En savoir plus", "Prendre rendez-vous", "Groupes de parole"]
      );
    } else if (message.includes('groupe') || message.includes('parole')) {
      addBotMessage(
        "👥 Nos groupes de parole :\n\n• Espaces d'écoute sécurisés\n• Animés par des professionnels\n• Confidentialité garantie\n• Soutien mutuel entre participants\n• Reconstruction progressive\n\nLes groupes se réunissent régulièrement. Contactez-nous pour plus d'informations.",
        ["Participer à un groupe", "Horaires et lieux", "Contactez-nous"]
      );
    } else if (message.includes('droit') || message.includes('légal') || message.includes('juridique')) {
      addBotMessage(
        "⚖️ Vos droits et recours légaux :\n\n• Droit à la protection et à la sécurité\n• Possibilité de porter plainte\n• Ordonnance de protection\n• Aide juridictionnelle gratuite\n• Accompagnement par notre avocate\n\nNotre équipe juridique peut vous conseiller gratuitement.",
        ["Consultation juridique", "Porter plainte", "Protection légale"]
      );
    } else if (message.includes('ressource') || message.includes('aide') || message.includes('soutien')) {
      addBotMessage(
        "📚 Ressources disponibles :\n\n• Centre d'hébergement d'urgence\n• Aide financière et sociale\n• Soutien psychologique\n• Accompagnement professionnel\n• Réinsertion sociale\n• Garde d'enfants\n\nNous travaillons avec de nombreux partenaires pour vous offrir un accompagnement complet.",
        ["Hébergement d'urgence", "Aide financière", "Soutien psychologique"]
      );
    } else {
      addBotMessage(
        "Je comprends votre préoccupation. Pour vous aider au mieux, je peux vous orienter vers :\n\n• Un conseiller de notre équipe\n• Des ressources spécialisées\n• Des services d'urgence si nécessaire\n\nN'hésitez pas à me poser des questions plus spécifiques ou à choisir une option ci-dessous.",
        ["Parler à un conseiller", "Ressources utiles", "Aide d'urgence", "Recommencer"]
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 animate-pulse'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </button>
        
        {!isOpen && (
          <div className="absolute -top-12 right-0 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 animate-fade-in delay-1000 pointer-events-none">
            Besoin d'aide ? Cliquez ici
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-t-2xl flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">Assistant Christ Le Bon Berger</h3>
              <p className="text-white/80 text-sm">En ligne • Confidentiel</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Shield className="w-5 h-5 text-white/80" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-2 ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isBot 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                        : 'bg-slate-600'
                    }`}>
                      {message.isBot ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.isBot 
                        ? 'bg-white border border-slate-200 text-slate-800' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-2 ${message.isBot ? 'text-slate-500' : 'text-white/70'}`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Options */}
                  {message.options && (
                    <div className="mt-3 space-y-2 ml-10">
                      {message.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className="block w-full text-left px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors duration-200"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all duration-200"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center justify-center space-x-4 mt-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleOptionClick("J'ai besoin d'aide urgente")}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-xs transition-colors duration-200"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Urgence</span>
              </button>
              <button
                onClick={() => handleOptionClick("Je veux parler à quelqu'un")}
                className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-xs transition-colors duration-200"
              >
                <Phone className="w-3 h-3" />
                <span>Appeler</span>
              </button>
              <button
                onClick={() => handleOptionClick("Numéros d'urgence")}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs transition-colors duration-200"
              >
                <Heart className="w-3 h-3" />
                <span>Aide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;