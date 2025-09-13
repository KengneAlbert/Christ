import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthSecurityService } from '../services/authSecurityService';

interface AdminAuthProps {
  onSuccess: () => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[] }>({ score: 0, feedback: [] });
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  const { signIn, signUp, resetPassword } = useAuth();

  // Vérifier le verrouillage au chargement
  React.useEffect(() => {
    if (email) {
      const locked = AuthSecurityService.isEmailLocked(email);
      setIsLocked(locked);
      if (locked) {
        setLockoutTime(AuthSecurityService.getLockoutTimeRemaining(email));
      }
    }
  }, [email]);

  // Décompte du verrouillage
  React.useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        const remaining = AuthSecurityService.getLockoutTimeRemaining(email);
        setLockoutTime(remaining);
        if (remaining === 0) {
          setIsLocked(false);
        }
      }, 60000); // Vérifier chaque minute
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime, email]);

  // Validation du mot de passe en temps réel
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (mode === 'register' && value) {
      const validation = AuthSecurityService.validatePassword(value);
      const score = Math.max(0, Math.min(4, 5 - validation.errors.length));
      setPasswordStrength({
        score,
        feedback: validation.errors
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier le verrouillage
    if (AuthSecurityService.isEmailLocked(email)) {
      const remaining = AuthSecurityService.getLockoutTimeRemaining(email);
      setMessage({ 
        type: 'error', 
        text: `Compte temporairement verrouillé. Réessayez dans ${remaining} minutes.` 
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        try {
          await signIn(email, password);
          AuthSecurityService.recordLoginAttempt(email, true);
          AuthSecurityService.createSecureSession('temp-id', email);
          setMessage({ type: 'success', text: 'Connexion réussie !' });
        } catch (authError) {
          AuthSecurityService.recordLoginAttempt(email, false);
          throw authError;
        }
      } else if (mode === 'register') {
        // Vérifier l'autorisation d'inscription
        if (!AuthSecurityService.isEmailAuthorizedForAdmin(email)) {
          throw new Error('Cette adresse email n\'est pas autorisée pour l\'inscription admin');
        }
        
        // Valider le mot de passe
        const passwordValidation = AuthSecurityService.validatePassword(password);
        if (!passwordValidation.isValid) {
          throw new Error('Mot de passe non conforme:\n' + passwordValidation.errors.join('\n'));
        }
        
        if (password !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        
        await signUp(email, password);
        setMessage({ 
          type: 'success', 
          text: 'Compte créé ! Vérifiez votre email pour confirmer votre inscription.' 
        });
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setMessage({ 
          type: 'success', 
          text: 'Email de réinitialisation envoyé ! Vérifiez votre boîte mail.' 
        });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Une erreur est survenue' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-gentle">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {mode === 'login' ? 'Connexion Admin' : 
               mode === 'register' ? 'Créer un compte' : 
               'Mot de passe oublié'}
            </h1>
            <p className="text-slate-600">
              {mode === 'login' ? 'Accédez au tableau de bord' : 
               mode === 'register' ? 'Créez votre compte administrateur' : 
               'Réinitialisez votre mot de passe'}
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            } animate-slide-down`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    // Vérifier le verrouillage
                    if (value) {
                      const locked = AuthSecurityService.isEmailLocked(value);
                      setIsLocked(locked);
                      if (locked) {
                        setLockoutTime(AuthSecurityService.getLockoutTimeRemaining(value));
                      }
                    }
                  }}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 focus-ring"
                  placeholder="admin@christlebonberger.fr"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 focus-ring"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
            
            {/* Indicateur de force du mot de passe pour l'inscription */}
            {mode === 'register' && password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Force du mot de passe:</span>
                  <span className={`font-medium ${
                    passwordStrength.score >= 4 ? 'text-green-600' :
                    passwordStrength.score >= 3 ? 'text-yellow-600' :
                    passwordStrength.score >= 2 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {passwordStrength.score >= 4 ? 'Très fort' :
                     passwordStrength.score >= 3 ? 'Fort' :
                     passwordStrength.score >= 2 ? 'Moyen' : 'Faible'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 4 ? 'bg-green-500' :
                      passwordStrength.score >= 3 ? 'bg-yellow-500' :
                      passwordStrength.score >= 2 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  ></div>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-xs text-red-600 space-y-1">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <li key={index}>• {feedback}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 focus-ring"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isLocked || (mode === 'register' && passwordStrength.score < 3)}
              className={`w-full focus-ring ${
                isLoading || isLocked || (mode === 'register' && passwordStrength.score < 3)
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 hover-glow'
              } text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-3`}
            >
              {isLocked ? (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Compte verrouillé ({lockoutTime} min)</span>
                </>
              ) : isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {mode === 'login' ? 'Connexion...' : 
                     mode === 'register' ? 'Création...' : 
                     'Envoi...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' ? 'Se connecter' : 
                     mode === 'register' ? 'Créer le compte' : 
                     'Envoyer le lien'}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Navigation */}
          <div className="mt-8 text-center space-y-3">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-emerald-600 hover:text-emerald-700 text-sm transition-colors duration-300 hover:scale-105 transform"
                >
                  Mot de passe oublié ?
                </button>
                <div className="text-slate-500 text-sm">
                  Pas encore de compte ?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-300"
                  >
                    S'inscrire
                  </button>
                </div>
              </>
            )}
            
            {mode === 'register' && (
              <div className="text-slate-500 text-sm">
                Déjà un compte ?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-300"
                >
                  Se connecter
                </button>
              </div>
            )}
            
            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="text-emerald-600 hover:text-emerald-700 text-sm transition-colors duration-300"
              >
                Retour à la connexion
              </button>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-600 text-sm">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Accès sécurisé réservé aux administrateurs autorisés</span>
            </div>
            {mode === 'register' && (
              <div className="mt-2 text-xs text-slate-500">
                L'inscription est limitée aux adresses email autorisées de l'association.
              </div>
            )}
          </div>
          
          {/* Informations de sécurité */}
          <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-xs text-blue-800 space-y-1">
              <div>• Maximum 5 tentatives de connexion par heure</div>
              <div>• Verrouillage automatique de 15 minutes après échecs répétés</div>
              <div>• Session sécurisée avec timeout automatique</div>
              {mode === 'register' && (
                <div>• Mot de passe: min 12 caractères, majuscules, minuscules, chiffres et caractères spéciaux</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;