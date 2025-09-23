
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Définition des types pour la requête et la réponse
interface LoginRequest {
  email?: string;
  password?: string;
}

// Fonction pour envoyer une réponse JSON standardisée
const sendResponse = (data: object, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
};

serve(async (req) => {
  // 1. Gérer la requête CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' 
    } });
  }

  try {
    // 2. Valider la requête
    const { email, password }: LoginRequest = await req.json();
    if (!email || !password) {
      return sendResponse({ error: 'Email et mot de passe requis' }, 400);
    }

    // 3. Créer un client Supabase avec le rôle "service_role"
    // Ce client a des privilèges élevés et ne doit être utilisé que côté serveur.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 4. Vérifier si l'email est dans la table des administrateurs autorisés
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('authorized_admins')
      .select('email')
      .eq('email', email)
      .single();

    if (adminError || !admin) {
      console.warn(`Tentative de connexion échouée pour un email non autorisé: ${email}`);
      // Message plus informatif pour les tentatives de connexion non autorisées
      return sendResponse({ 
        error: 'Accès restreint',
        message: 'Cette adresse email n\'est pas autorisée à accéder à l\'administration. L\'accès est réservé aux membres de l\'équipe Christ Le Bon Berger.',
        details: 'Pour obtenir l\'accès, contactez l\'administrateur principal à contact@christ-le-bon-berger.com',
        errorCode: 'UNAUTHORIZED_ACCESS'
      }, 401);
    }

    // 5. Si l'email est autorisé, tenter de connecter l'utilisateur
    // On utilise un client Supabase anonyme pour cette opération
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error(`Erreur d'authentification pour ${email}:`, authError.message);
      return sendResponse({ error: 'Email ou mot de passe invalide' }, 401);
    }

    // 6. Connexion réussie
    console.log(`Connexion réussie pour: ${email}`);
    return sendResponse(authData, 200);

  } catch (e) {
    console.error('Erreur inattendue dans la fonction:', e.message);
    return sendResponse({ error: 'Erreur interne du serveur' }, 500);
  }
});
