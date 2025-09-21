import React from "react";
import { Tailwind } from "@react-email/tailwind";

type EmailLayoutProps = {
  title: string;
  headerTitle?: string;
  brandColor?: string;
  children: React.ReactNode;
  footerText?: string;
  logoUrl?: string;
};

export const EmailLayout: React.FC<EmailLayoutProps> = ({
  title,
  headerTitle = "Christ Le Bon Berger",
  brandColor = "#0ea5e9",
  children,
  footerText = "Vous recevez cet email de Christ Le Bon Berger.",
  logoUrl,
}) => {
  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
      </head>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: { brand: { DEFAULT: brandColor } },
              borderRadius: { xl: "12px" },
            },
          },
        }}
      >
        <body className="m-0 p-0 bg-slate-100 antialiased">
          <div className="w-full py-6">
            <div className="w-full max-w-[640px] mx-auto bg-white rounded-xl overflow-hidden shadow">
              <div className="flex items-center gap-3 bg-brand text-white px-6 py-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    width="28"
                    height="28"
                    style={{ borderRadius: 6 }}
                  />
                ) : null}
                <h1 className="m-0 text-base font-semibold">{headerTitle}</h1>
              </div>
              <div className="px-6 py-5 text-slate-900 leading-7">
                {children}
              </div>
              <div className="px-6 py-4 text-center text-xs text-slate-500 bg-slate-50">
                {footerText}
              </div>
            </div>
          </div>
        </body>
      </Tailwind>
    </html>
  );
};

export default EmailLayout;
