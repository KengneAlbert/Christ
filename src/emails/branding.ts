export const BRAND = {
  name: 'Christ Le Bon Berger',
  // Couleurs du site (emerald/teal gradient)
  primaryColor: '#10b981', // emerald-500
  secondaryColor: '#14b8a6', // teal-500
  gradientFrom: '#059669', // emerald-600
  gradientTo: '#0d9488', // teal-600
  // Couleur pour contact/confirmation
  contactColor: '#10b981',
  // Logo (URL absolue recommandée pour emails)
  logoUrl: '',
  // Site URL pour les liens
  siteUrl: (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SITE_URL) || 'https://christ-le-bon-berger.com',
  // Footer avec désabonnement
  footerText:
    "Vous recevez cet email car vous êtes abonné(e) à notre newsletter.",
};
