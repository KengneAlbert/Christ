#!/bin/bash
# Script de déploiement des fonctions Edge

echo "🚀 Déploiement des fonctions Edge Functions..."

# Vérifier que Docker est lancé
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker n'est pas lancé. Veuillez démarrer Docker Desktop."
    exit 1
fi

# Vérifier que le token Supabase est défini
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "⚠️  Variable SUPABASE_ACCESS_TOKEN non définie."
    echo "Définissez-la avec: export SUPABASE_ACCESS_TOKEN=<votre-token>"
    exit 1
fi

PROJECT_REF="bcfrhbcxtbybvsoebfjt"

echo "📧 Déploiement brevo-contact-send..."
supabase functions deploy brevo-contact-send --project-ref $PROJECT_REF

echo "📨 Déploiement brevo-newsletter-send..."
supabase functions deploy brevo-newsletter-send --project-ref $PROJECT_REF

echo "✅ Déploiement terminé!"