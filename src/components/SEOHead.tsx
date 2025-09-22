import React from "react";
import { Helmet } from "react-helmet-async";
import { SEOData } from "../services/seoService";

interface SEOHeadProps {
  seo: SEOData;
}

const SEOHead: React.FC<SEOHeadProps> = ({ seo }) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(", ")} />

      {/* Canonical URL */}
      {seo.canonicalUrl && <link rel="canonical" href={seo.canonicalUrl} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={seo.ogTitle || seo.title} />
      <meta
        property="og:description"
        content={seo.ogDescription || seo.description}
      />
      <meta property="og:type" content={seo.ogType || "website"} />
      <meta property="og:url" content={seo.canonicalUrl} />
      {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
      <meta property="og:site_name" content="Christ Le Bon Berger" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.ogTitle || seo.title} />
      <meta
        name="twitter:description"
        content={seo.ogDescription || seo.description}
      />
      {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Christ Le Bon Berger" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="fr" />

      {/* Theme and App Meta */}
      <meta name="theme-color" content="#10b981" />
      <meta name="application-name" content="Christ Le Bon Berger" />

      {/* Structured Data */}
      {seo.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(seo.structuredData, null, 2)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
