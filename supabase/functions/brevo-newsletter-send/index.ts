// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ALLOWED_ORIGINS = new Set([
  'https://christ-le-bon-berger.com',
  'http://localhost:5173',
  Deno.env.get('ALLOWED_ORIGIN') || '',
].filter(Boolean));

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Recipient = { email: string; name?: string };
type Payload = {
  subject: string;
  htmlContent: string;
  textContent?: string;
  recipients: Recipient[];
  senderName?: string;
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const origin = req.headers.get('origin') || '';
    if (ALLOWED_ORIGINS.size > 0 && !ALLOWED_ORIGINS.has(origin)) {
      return json({ error: 'Origin not allowed' }, 403);
    }

    const csrf = req.headers.get('x-csrf-token') || req.headers.get('X-CSRF-Token') || '';
    if (!csrf || csrf.length < 32) {
      return json({ error: 'Missing or invalid CSRF token' }, 400);
    }

    const apiKey = Deno.env.get('BREVO_API_KEY');
    const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL');
    const defaultSenderName = Deno.env.get('BREVO_SENDER_NAME') || 'Christ Le Bon Berger';
    if (!apiKey || !senderEmail) {
      return json({ error: 'Missing Brevo configuration on server' }, 500);
    }

    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength && contentLength > 500_000) {
      return json({ error: 'Payload too large' }, 413);
    }

    const body = (await req.json()) as Payload;
    if (!body?.subject || !body?.htmlContent || !Array.isArray(body.recipients) || body.recipients.length === 0) {
      return json({ error: 'Invalid payload' }, 400);
    }

    const toPlainText = (html: string) =>
      html
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|h\d|li|tr)>/gi, '\n')
        .replace(/<li>/gi, '• ')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

  const buildTemplate = (subject: string, innerHtml: string, senderName: string) => `<!DOCTYPE html>
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
      .header { background:#0ea5e9; color:#ffffff; padding:20px 24px; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; }
      .header h1 { margin:0; font-size:20px; }
      .content { padding:24px; color:#0f172a; line-height:1.6; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; }
      .content h1, .content h2, .content h3 { color:#0f172a; }
      .footer { padding:16px 24px; color:#64748b; font-size:12px; text-align:center; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; background:#f8fafc; }
      .btn { display:inline-block; background:#0ea5e9; color:#fff !important; text-decoration:none; padding:10px 16px; border-radius:10px; }
      @media (max-width: 600px) { .content { padding:18px; } .header { padding:16px 18px; } }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <h1>${senderName}</h1>
        </div>
        <div class="content">${innerHtml}</div>
        <div class="footer">
          Vous recevez cet email de ${senderName}. Si vous ne souhaitez plus recevoir nos messages, vous pouvez vous désabonner depuis votre profil.
        </div>
      </div>
    </div>
  </body>
  </html>`;

    // Brevo supports multiple recipients in a single call
    const isFullHtml = /<html[\s\S]*<\/html>/i.test(body.htmlContent);
    const finalHtml = isFullHtml
      ? body.htmlContent
      : buildTemplate(body.subject, body.htmlContent, body.senderName || defaultSenderName);

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: body.senderName || defaultSenderName },
        to: body.recipients,
        subject: body.subject,
        htmlContent: finalHtml,
        textContent: body.textContent || toPlainText(body.htmlContent),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Brevo newsletter error:', errText);
      return json({ error: 'Brevo send failed', details: errText }, res.status);
    }
    const data = await res.json();
    return json({ success: true, data });
  } catch (e) {
    console.error('Unexpected error:', e);
    return json({ error: 'Internal error' }, 500);
  }
});
