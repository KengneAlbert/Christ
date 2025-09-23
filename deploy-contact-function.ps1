# Script PowerShell pour déployer la fonction de contact

Write-Host "Déploiement de la fonction brevo-contact-send..." -ForegroundColor Green

# Vérifier si le token est défini
if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Host "SUPABASE_ACCESS_TOKEN n'est pas défini. Veuillez le définir avec:" -ForegroundColor Red
    Write-Host '$env:SUPABASE_ACCESS_TOKEN = "votre_token_ici"' -ForegroundColor Yellow
    exit 1
}

# Déployer la fonction
try {
    Write-Host "Déploiement en cours..." -ForegroundColor Yellow
    supabase functions deploy brevo-contact-send --project-ref bcfrhbcxtbybvsoebfjt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Fonction déployée avec succès!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du déploiement: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Déploiement terminé." -ForegroundColor Green