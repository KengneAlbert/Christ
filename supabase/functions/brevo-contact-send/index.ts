// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

type ContactPayload = {
  firstName: string;
  lastName?: string;
  email: string;
  subject: string;
  message: string;
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const apiKey = Deno.env.get('BREVO_API_KEY');
    const toEmail = Deno.env.get('BREVO_CONTACT_TO_EMAIL');
    const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL') || toEmail || '';
    const senderName = Deno.env.get('BREVO_SENDER_NAME') || 'Christ Le Bon Berger';

    if (!apiKey || !toEmail || !senderEmail) {
      return json({ error: 'Missing Brevo configuration on server' }, 500);
    }

    const body: ContactPayload = await req.json();
    if (!body?.firstName || !body?.email || !body?.subject || !body?.message) {
      return json({ error: 'Invalid payload' }, 400);
    }

    const fullName = `${body.firstName} ${body.lastName ?? ''}`.trim();
    const subject = `[Contact] ${escapeHtml(body.subject)}`;
    const htmlContent = `
      <div>
        <p><strong>De:</strong> ${escapeHtml(fullName)} &lt;${escapeHtml(body.email)}&gt;</p>
        <p><strong>Objet:</strong> ${subject}</p>
        <hr/>
        <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(body.message)}</pre>
        <hr/>
        <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
      </div>
    `;

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
