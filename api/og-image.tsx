import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler() {
  const baseUrl = process.env.VITE_SITE_URL || 'https://www.christ-le-bon-berger.com';
  const logoUrl = `${baseUrl}/logo.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #10b981, #14b8a6)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            padding: 40,
            borderRadius: 24,
            backgroundColor: 'rgba(255,255,255,0.92)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}
        >
          <img
            src={logoUrl}
            width={200}
            height={200}
            style={{ borderRadius: 20, objectFit: 'contain', background: '#fff' }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 760,
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.15,
              }}
            >
              L'association lutte contre les violences conjugales
            </span>
            <span
              style={{
                marginTop: 16,
                fontSize: 28,
                fontWeight: 600,
                color: '#334155',
              }}
            >
              Christ Le Bon Berger — Aide, Écoute et Réconfort
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
