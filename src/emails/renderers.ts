export type BrandingOptions = {
  headerTitle?: string;
  brandColor?: string;
  footerText?: string;
  logoUrl?: string;
};

const baseStyles = {
  wrapper: 'width:100%; background:#f1f5f9; padding:32px 0;',
  container:
    'width:100%; max-width:640px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);',
  header: (gradient: string) => `background:${gradient}; color:#ffffff; padding:24px 32px;`,
  headerTitle: 'margin:0; font-size:22px; font-weight:600; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;',
  content:
    'padding:32px; color:#0f172a; line-height:1.7; font-size:16px; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;',
  footer:
    'padding:24px 32px; color:#64748b; font-size:13px; text-align:center; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; background:#f8fafc; border-top:1px solid #e2e8f0;',
  button: 'display:inline-block; background:linear-gradient(135deg, #10b981, #14b8a6); color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:500; font-size:14px;',
  unsubscribeLink: 'color:#64748b; text-decoration:underline; font-size:12px;',
};

export const buildNewsletterHtml = (
  subject: string,
  innerHtml: string,
  branding: BrandingOptions = {},
  subscriberEmail?: string
) => {
  const gradient = branding.brandColor || 'linear-gradient(135deg, #10b981, #14b8a6)';
  const headerTitle = branding.headerTitle || 'Christ Le Bon Berger';
  const footerText = branding.footerText || 'Vous recevez cet email car vous êtes abonné(e) à notre newsletter.';
  // Prefer VITE_SITE_URL when available; fallback to Netlify domain
  const siteUrl = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SITE_URL)
    || 'https://christ-le-bon-berger.netlify.app';
  const logo = branding.logoUrl
    ? `<img src="${branding.logoUrl}" alt="Logo" width="28" height="28" style="border-radius:8px; margin-right:12px; vertical-align:middle;" />`
    : '';

  const unsubscribeUrl = subscriberEmail 
    ? `${siteUrl}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`
    : `${siteUrl}/unsubscribe`;

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${subject}</title>
    <style>
      @media (max-width: 600px) { 
        .content { padding:20px !important; font-size:16px !important; } 
        .header { padding:16px 20px !important; } 
        .footer { padding:16px 20px !important; }
        .container { margin:0 12px !important; width:auto !important; }
        h1,h2,h3 { line-height:1.3 !important; }
        .btn { width:100% !important; text-align:center !important; }
      }
      .content img { max-width:100% !important; height:auto !important; border-radius:8px; }
      .content a { color:#10b981 !important; text-decoration:underline !important; word-break:break-word; }
      .content table { width:100% !important; border-collapse:collapse !important; }
      .content td, .content th { padding:8px; border:1px solid #e2e8f0; }
      .btn:hover { background: linear-gradient(135deg, #059669, #0d9488) !important; }
    </style>
  </head>
  <body style="margin:0; padding:0; background:#f1f5f9; -webkit-font-smoothing:antialiased;">
    <div class="wrapper" style="${baseStyles.wrapper}">
      <div class="container" style="${baseStyles.container}">
        <div class="header" style="${baseStyles.header(gradient)}">
          <div style="display:flex; align-items:center;">
            ${logo}
            <span style="${baseStyles.headerTitle}">${headerTitle}</span>
          </div>
        </div>
        <div class="content" style="${baseStyles.content}">
          ${innerHtml}
        </div>
        <div class="footer" style="${baseStyles.footer}">
          <p style="margin:0 0 8px 0; color:#64748b;">${footerText}</p>
          <p style="margin:0; font-size:12px;">
            <a href="${siteUrl}" style="color:#10b981; text-decoration:none;">Visiter notre site</a>
            <span style="color:#cbd5e1; margin:0 8px;">•</span>
            <a href="${unsubscribeUrl}" style="${baseStyles.unsubscribeLink}">Se désabonner</a>
          </p>
          <div style="margin-top:16px; padding-top:16px; border-top:1px solid #e2e8f0; color:#94a3b8; font-size:11px;">
            Christ Le Bon Berger - Association d'accompagnement et de soutien
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>`;
};

export const buildContactHtml = (
  subject: string,
  innerHtml: string,
  branding: BrandingOptions = {}
) => {
  const gradient = branding.brandColor || 'linear-gradient(135deg, #10b981, #14b8a6)';
  const headerTitle = branding.headerTitle || 'Message de contact';
  const footerText = branding.footerText || 'Christ Le Bon Berger — Formulaire de contact';
  const siteUrl = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SITE_URL)
    || 'https://christ-le-bon-berger.netlify.app';
  const logo = branding.logoUrl
    ? `<img src="${branding.logoUrl}" alt="Logo" width="28" height="28" style="border-radius:8px; margin-right:12px; vertical-align:middle;" />`
    : '';
    
  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${subject}</title>
    <style>
      @media (max-width: 600px) { 
        .content { padding:24px !important; } 
        .header { padding:20px 24px !important; } 
        .footer { padding:20px 24px !important; }
        .container { margin:0 16px !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background:#f1f5f9; -webkit-font-smoothing:antialiased;">
    <div style="${baseStyles.wrapper}">
      <div style="${baseStyles.container}">
        <div style="${baseStyles.header(gradient)}">
          <div style="display:flex; align-items:center;">
            ${logo}
            <span style="${baseStyles.headerTitle}">${headerTitle}</span>
          </div>
        </div>
        <div class="content" style="${baseStyles.content}">${innerHtml}</div>
        <div style="${baseStyles.footer}">
          <p style="margin:0 0 8px 0; color:#64748b;">${footerText}</p>
          <p style="margin:0; font-size:12px;">
            <a href="${siteUrl}" style="color:#10b981; text-decoration:none;">Visiter notre site</a>
          </p>
          <div style="margin-top:16px; padding-top:16px; border-top:1px solid #e2e8f0; color:#94a3b8; font-size:11px;">
            Christ Le Bon Berger - Association d'accompagnement et de soutien
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>`;
};
