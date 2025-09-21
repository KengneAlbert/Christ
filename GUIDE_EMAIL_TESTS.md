6# Guide de test - Nouveaux emails et éditeur

## 🎨 Nouvelles fonctionnalités implémentées

### 1. **Éditeur riche avec aperçu en temps réel**

- **Localisation** : Admin > Newsletters > Modifier une newsletter
- **Fonctionnalités** :
  - Éditeur WYSIWYG avec toolbar complète (gras, italique, listes, images, liens)
  - Aperçu en temps réel côte à côte
  - Basculement entre éditeur riche et texte simple
  - Rendu fidèle du design email final

### 2. **Design professionnel des emails**

- **Couleurs du site** : Utilise les couleurs emerald/teal du site
- **Header avec dégradé** : Design moderne avec logo optionnel
- **Footer avec désabonnement** : Lien vers `/unsubscribe?email={email}`
- **Responsive** : Optimisé pour tous les clients email

### 3. **Templates différenciés**

- **Newsletter** : Couleur emerald avec header "Christ Le Bon Berger"
- **Contact** : Couleur teal avec header "Message de contact"
- **Urgence** : Couleur rouge avec header "Urgence — Christ Le Bon Berger"

## 🧪 Tests à effectuer

### Test 1 : Éditeur riche

1. Aller dans Admin > Newsletters
2. Modifier une newsletter existante ou en créer une nouvelle
3. **Vérifier** :
   - L'éditeur riche s'affiche correctement
   - Les boutons de formatage fonctionnent (gras, italique, listes)
   - L'aperçu se met à jour en temps réel
   - Possibilité d'insérer des images et liens
   - Basculement entre éditeur riche et texte simple

### Test 2 : Design des newsletters

1. Dans l'éditeur, créer du contenu formaté :
   ```html
   <h2>Titre de section</h2>
   <p>Paragraphe avec <strong>gras</strong> et <em>italique</em></p>
   <ul>
     <li>Point 1</li>
     <li>Point 2</li>
   </ul>
   <p>Lien vers <a href="https://example.com">notre site</a></p>
   ```
2. **Vérifier dans l'aperçu** :
   - Header avec dégradé emerald
   - Contenu bien formaté
   - Footer avec lien de désabonnement
   - Design responsive

### Test 3 : Envoi d'emails

1. **Newsletter** :

   - Envoyer une newsletter de test
   - Vérifier la réception avec le nouveau design
   - Tester le lien de désabonnement

2. **Contact** :
   - Remplir le formulaire de contact
   - Vérifier la réception avec design teal
   - Tester avec caractères accentués : "Été — Cœur ❤️"

### Test 4 : Encodage UTF-8

1. **Dans l'éditeur**, saisir :
   - Caractères accentués : àéèùç
   - Emojis : 🎉 ❤️ 🙏 ⭐
   - Caractères spéciaux : €, ©, ®
2. **Vérifier** :
   - Aperçu affiche correctement
   - Email reçu affiche correctement
   - Pas de caractères corrompus

## 🚀 Déploiement effectué

- ✅ **Edge Functions** redéployées avec nouveaux designs
- ✅ **Secrets Brevo** configurés
- ✅ **Dépendances** installées (react-quill)
- ✅ **CSS** responsive intégré

## 📋 Checklist finale

- [ ] L'éditeur riche s'affiche sans erreurs
- [ ] L'aperçu en temps réel fonctionne
- [ ] Le design des emails est professionnel
- [ ] Les couleurs correspondent au site
- [ ] Le lien de désabonnement est présent
- [ ] L'encodage UTF-8 fonctionne correctement
- [ ] Les emails sont bien reçus
- [ ] Le design est responsive sur mobile

## 🔧 Configuration optionnelle

### Ajouter un logo aux emails

1. Uploader le logo sur un CDN/serveur accessible
2. Dans `src/services/emailService.ts` et `newsletterService.ts`, remplacer :
   ```typescript
   logoUrl: '', // Par l'URL complète du logo
   ```

### Personnaliser les couleurs

1. Modifier dans `src/emails/renderers.ts` :
   ```typescript
   brandColor: '#VOTRE_COULEUR', // Couleur principale
   ```

Tous les composants sont maintenant configurés pour un email professionnel avec éditeur riche et aperçu en temps réel ! 🎉
