import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Définition des types pour la requête
interface RegisterRequest {
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

// Fonction pour vérifier si un email est autorisé
const isAdminEmail = async (supabaseAdmin: any, email: string): Promise<boolean> => {
  const { data, error } = await supabaseAdmin
    .from('authorized_admins')
    .select('email')
    .ilike('email', email)
    .single();
  return !error && !!data;
};

serve(async (req) => {
  // Gérer la requête CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    const { email, password }: RegisterRequest = await req.json();
    if (!email || !password) {
      return sendResponse({ error: 'Email et mot de passe requis' }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Vérifier si l'email est autorisé
    const isAuthorized = await isAdminEmail(supabaseAdmin, email);
    if (!isAuthorized) {
      console.warn(`Tentative d'inscription non autorisée pour: ${email}`);
      return sendResponse({ 
        error: 'Accès non autorisé', 
        message: 'Cette adresse email n\'est pas dans notre liste d\'administrateurs autorisés. Seuls les membres de l\'équipe Christ Le Bon Berger peuvent créer un compte administrateur.',
        details: 'Si vous pensez qu\'il s\'agit d\'une erreur, contactez l\'administrateur principal à contact@christ-le-bon-berger.com',
        errorCode: 'UNAUTHORIZED_EMAIL'
      }, 403);
    }

    // 2. Si autorisé, créer l'utilisateur
    // Note: On utilise le client admin pour créer l'utilisateur directement
    // sans envoyer d'email de confirmation, car on a déjà validé l'email.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Marque l'email comme confirmé
    });

    if (authError) {
      console.error(`Erreur lors de la création de l'utilisateur ${email}:`, authError.message);
      return sendResponse({ error: authError.message }, 400);
    }

    console.log(`Utilisateur créé avec succès: ${email}`);
    return sendResponse(authData, 200);

  } catch (e) {
    console.error('Erreur inattendue dans la fonction register:', e.message);
    return sendResponse({ error: 'Erreur interne du serveur' }, 500);
  }
});
