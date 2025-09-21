// Utilitaires pour traiter le HTML généré par l'éditeur riche

/**
 * Nettoie le HTML généré par ReactQuill
 * Supprime les balises vides et normalise le formatage
 */
export const cleanHtml = (html: string): string => {
  if (!html || html.trim() === '<p><br></p>') {
    return '';
  }

  // Préserver les sauts de ligne et la structure HTML telle que l'utilisateur l'a saisie.
  // Ne faire qu'un trim global pour éviter d'être trop agressif.
  return html.trim();
};

/**
 * Convertit le HTML en texte brut pour le champ content
 */
export const htmlToText = (html: string): string => {
  if (!html) return '';
  
  return html
    // Remplacer les paragraphes par des sauts de ligne
    .replace(/<\/p><p>/g, '\n')
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n')
    // Remplacer les <br> par des sauts de ligne
    .replace(/<br\s*\/?>/g, '\n')
    // Supprimer toutes les autres balises HTML
    .replace(/<[^>]*>/g, '')
    // Décoder les entités HTML communes
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Nettoyer les espaces multiples et les sauts de ligne multiples
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Convertit du texte brut en HTML simple pour l'éditeur
 */
export const textToHtml = (text: string): string => {
  if (!text) return '<p><br></p>';
  
  return text
    .split('\n')
    .map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>')
    .join('');
};

/**
 * Transforme automatiquement les URLs et emails en liens cliquables
 */
export const linkifyHtml = (html: string): string => {
  if (!html) return '';
  // Ne pas doubler si déjà dans un lien
  const URL_REGEX = /(^|\s)(https?:\/\/[^\s<]+[^<.,:;!?)\]\s])/gi;
  const WWW_REGEX = /(^|\s)(www\.[^\s<]+[^<.,:;!?)\]\s])/gi;
  const EMAIL_REGEX = /(^|\s)([\w.+-]+@[\w.-]+\.[a-zA-Z]{2,})/gi;

  let output = html;
  // URLs complètes
  output = output.replace(URL_REGEX, (_m, pre, url) => `${pre}<a href="${url}" style="color:#10b981; text-decoration:underline;" target="_blank" rel="noopener noreferrer">${url}</a>`);
  // URLs commençant par www.
  output = output.replace(WWW_REGEX, (_m, pre, url) => {
    const href = `https://${url}`;
    return `${pre}<a href="${href}" style="color:#10b981; text-decoration:underline;" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
  // Emails
  output = output.replace(EMAIL_REGEX, (_m, pre, email) => `${pre}<a href="mailto:${email}" style="color:#10b981; text-decoration:underline;">${email}</a>`);
  return output;
};

/**
 * Préfixe le contenu avec un sous-titre stylé (facultatif)
 */
export const applySubtitleToHtml = (html: string, subtitle?: string): string => {
  if (!subtitle || !subtitle.trim()) return html;
  const cleanSubtitle = subtitle.trim();
  const blockPrefix = `<div style="margin:0 0 16px 0; font-size:16px; color:#334155; line-height:1.5;"><em>`;
  const blockSuffix = `</em></div>`;
  const block = `${blockPrefix}${cleanSubtitle}${blockSuffix}`;

  // Si le même bloc est déjà présent au début
  if (html.startsWith(block)) return html;

  // Si un ancien sous-titre existe déjà avec le même style, le remplacer
  const subtitleRegex = new RegExp(
    `^<div style=\\"margin:0 0 16px 0; font-size:16px; color:#334155; line-height:1.5;\\"><em>[\\s\\S]*?<\\/em><\\/div>`,
    'i'
  );
  if (subtitleRegex.test(html)) {
    html = html.replace(subtitleRegex, '');
  }

  return `${block}${html}`;
};