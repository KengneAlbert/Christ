export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const incomingUrl = new URL(req.url);
    const target = incomingUrl.searchParams.get('url');
    if (!target) {
      return new Response('Missing url parameter', { status: 400 });
    }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    // Normalize to hostname for validation
    const allowedHost = supabaseUrl ? new URL(supabaseUrl).hostname : '';

    const targetUrl = new URL(target);

    // Basic allowlist: same Supabase project storage public bucket
    const isAllowedHost = allowedHost
      ? targetUrl.hostname === allowedHost
      : targetUrl.hostname.endsWith('.supabase.co');

    const isPublicStoragePath = targetUrl.pathname.startsWith('/storage/v1/object/public/');

    if (!isAllowedHost || !isPublicStoragePath) {
      return new Response('Forbidden target', { status: 403 });
    }

    const res = await fetch(targetUrl.toString(), { method: 'GET' });
    if (!res.ok || !res.body) {
      return new Response('Failed to fetch PDF', { status: 502 });
    }

    // Try to respect upstream content-type if it's a PDF, else force
    const upstreamCT = res.headers.get('content-type') || 'application/pdf';
    const contentType = upstreamCT.includes('pdf') ? upstreamCT : 'application/pdf';

    // Stream the response to client (same-origin)
    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': 'inline' // prefer inline rendering
      }
    });
  } catch (err) {
    console.error('pdf-proxy error:', err);
    return new Response('Server error', { status: 500 });
  }
}
