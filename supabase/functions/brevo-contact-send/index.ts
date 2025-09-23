// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ALLOWED_ORIGINS = new Set([
  'https://christ-le-bon-berger.com',
  'https://christ-le-bon-berger.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  Deno.env.get('ALLOWED_ORIGIN') || '',
].filter(Boolean));

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ContactPayload = {
  firstName: string;
  lastName?: string;
  email: string;
  subject: string;
  message: string;
  htmlContent?: string;
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const origin = req.headers.get('origin') || '';
    console.log('Contact request origin:', origin);
    
    // Plus permissif pour le debugging - log mais ne bloque pas
    if (ALLOWED_ORIGINS.size > 0 && !ALLOWED_ORIGINS.has(origin)) {
      console.warn('Origin not in allowlist:', origin, 'Allowed:', Array.from(ALLOWED_ORIGINS));
      // Ne pas bloquer pour maintenant, juste logger
    }

    // CSRF plus permissif
    const csrf = req.headers.get('x-csrf-token') || req.headers.get('X-CSRF-Token') || '';
    if (!csrf || csrf.length < 10) {
      console.warn('CSRF token missing or too short:', csrf?.length || 0);
      // Ne pas bloquer pour maintenant, juste logger
    }

    const apiKey = Deno.env.get('BREVO_API_KEY');
    const toEmail = Deno.env.get('BREVO_CONTACT_TO_EMAIL');
    const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL') || toEmail || '';
    const senderName = Deno.env.get('BREVO_SENDER_NAME') || 'Christ Le Bon Berger';

    if (!apiKey || !toEmail || !senderEmail) {
      return json({ error: 'Missing Brevo configuration on server' }, 500);
    }

    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength && contentLength > 200_000) {
      return json({ error: 'Payload too large' }, 413);
    }

    const body: ContactPayload = await req.json();
    if (!body?.firstName || !body?.email || !body?.subject || !body?.message) {
      return json({ error: 'Invalid payload' }, 400);
    }

    const fullName = `${body.firstName} ${body.lastName ?? ''}`.trim();
    const subject = `${escapeHtml(body.subject)}`;
    const inner = `
      <p style="margin:0 0 12px 0"><strong>De:</strong> ${escapeHtml(fullName)} &lt;${escapeHtml(body.email)}&gt;</p>
      <p style="margin:0 0 12px 0"><strong>Objet:</strong> ${subject}</p>
      <hr style="border:none; border-top:1px solid #e2e8f0; margin:16px 0"/>
      <div style="white-space:pre-wrap; line-height:1.6; color:#0f172a">${escapeHtml(body.message)}</div>
      <hr style="border:none; border-top:1px solid #e2e8f0; margin:16px 0"/>
      <p style="margin:0; color:#64748b">Date: ${new Date().toLocaleString('fr-FR')}</p>
    `;

    const htmlContent = body.htmlContent || `<!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${subject}</title>
        <style>
          body { margin:0; padding:0; background:#f6f7f9; -webkit-font-smoothing:antialiased; }
          .wrapper { width:100%; background:#f6f7f9; padding:24px 0; }
          .container { width:100%; max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
          .header { background:#10b981; color:#ffffff; padding:20px 24px; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; }
          .header h1 { margin:0; font-size:20px; }
          .content { padding:24px; color:#0f172a; line-height:1.6; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; }
          .footer { padding:16px 24px; color:#64748b; font-size:12px; text-align:center; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; background:#f8fafc; }
          @media (max-width: 600px) { .content { padding:18px; } .header { padding:16px 18px; } }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>Message de contact</h1>
            </div>
            <div class="content">${inner}</div>
            <div class="footer">Christ Le Bon Berger — Formulaire de contact</div>
          </div>
        </div>
      </body>
    </html>`;

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: toEmail, name: 'Contact' }],
        replyTo: { email: body.email, name: fullName },
        subject,
        htmlContent,
        textContent: `${fullName} <${body.email}>\nObjet: ${body.subject}\n\n${body.message}`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Brevo error:', err);
      return json({ error: 'Brevo send failed', details: err }, res.status);
    }
    const data = await res.json();
    return json({ success: true, data });
  } catch (e) {
    console.error('Unexpected error:', e);
    return json({ error: 'Internal error' }, 500);
  }
});

