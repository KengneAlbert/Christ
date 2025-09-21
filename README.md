Christ

Pour configurer l'envoi d'emails via les formulaires de contact :

## Configuration EmailJS

### 1. Créer un compte EmailJS

1. Allez sur [EmailJS.com](https://www.emailjs.com/)
2. Créez un compte gratuit
3. Créez un nouveau service email (Gmail, Outlook, etc.)

### 2. Créer un template d'email

1. Dans votre dashboard EmailJS, créez un nouveau template
2. Utilisez ces variables dans votre template :
   - `{{from_name}}` - Nom de l'expéditeur
   - `{{from_email}}` - Email de l'expéditeur
   - `{{subject}}` - Sujet du message
   - `{{message}}` - Contenu du message
   - `{{to_name}}` - Nom du destinataire

### 3. Configuration des variables d'environnement

1. Copiez le fichier `.env.example` vers `.env`
2. Remplacez les valeurs par vos identifiants EmailJS :
   ```
   VITE_EMAILJS_SERVICE_ID=votre_service_id
   VITE_EMAILJS_TEMPLATE_ID=votre_template_id
   VITE_EMAILJS_PUBLIC_KEY=votre_cle_publique
   ```
3. Configurez l'URL publique du site (utilisée dans les emails pour les liens « Visiter le site » et « Se désabonner »)
   ```
   VITE_SITE_URL=https://votre-domaine.exemple
   ```
   Si non définie, l'URL Netlify par défaut sera utilisée.

### 4. Template d'email recommandé

```html
Nouveau message de {{from_name}} Email: {{from_email}} Sujet: {{subject}}
Message: {{message}} --- Envoyé depuis le site Christ Le Bon Berger
```

### 5. Sécurité

- Activez la protection contre le spam dans EmailJS
- Limitez le nombre d'emails par IP
- Configurez les domaines autorisés
