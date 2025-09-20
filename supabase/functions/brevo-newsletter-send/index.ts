// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });

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
    const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL');
    const defaultSenderName = Deno.env.get('BREVO_SENDER_NAME') || 'Christ Le Bon Berger';
    if (!apiKey || !senderEmail) {
      return json({ error: 'Missing Brevo configuration on server' }, 500);
    }

    const body = (await req.json()) as Payload;
    if (!body?.subject || !body?.htmlContent || !Array.isArray(body.recipients) || body.recipients.length === 0) {
      return json({ error: 'Invalid payload' }, 400);
    }

    // Brevo supports multiple recipients in a single call
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
        htmlContent: body.htmlContent,
        textContent: body.textContent,
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
