param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRef,

    [Parameter(Mandatory = $false)]
    [switch]$DeployFunctions = $false,

    [Parameter(Mandatory = $false)]
    [string]$FunctionsPath = "supabase/functions"
)

# Helper: Write info line
function Write-Info($msg) {
    Write-Host "[INFO] $msg" -ForegroundColor Cyan
}

function Write-ErrorLine($msg) {
    Write-Host "[ERROR] $msg" -ForegroundColor Red
}

# Check Supabase CLI availability
Write-Info "Vérification du Supabase CLI..."
$supabaseVersion = & supabase --version 2>$null
if (-not $?) {
    Write-ErrorLine "Supabase CLI introuvable. Installez-le et réessayez: https://supabase.com/docs/guides/cli"
    exit 1
}
Write-Info "Supabase CLI: $supabaseVersion"

# Ensure we're at repository root (this script is inside scripts/) and then go up one level
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
Set-Location $repoRoot

# Link the project (idempotent)
Write-Info "Lien vers le projet Supabase ($ProjectRef)"
& supabase link --project-ref $ProjectRef
if (-not $?) {
    Write-ErrorLine "Échec du lien avec le projet Supabase. Vérifiez que vous êtes authentifié (supabase login) et que le ProjectRef est correct."
    exit 1
}

# Push migrations
Write-Info "Application des migrations (supabase db push)..."
& supabase db push
if (-not $?) {
    Write-ErrorLine "Échec lors de l'application des migrations. Vérifiez les fichiers dans supabase/migrations."
    exit 1
}
Write-Info "Migrations appliquées avec succès."

# Optionally deploy all functions in supabase/functions
if ($DeployFunctions) {
    $functionsFullPath = Join-Path $repoRoot $FunctionsPath
    if (-not (Test-Path $functionsFullPath)) {
        Write-ErrorLine "Dossier des fonctions introuvable: $functionsFullPath"
        exit 1
    }

    Write-Info "Déploiement des Edge Functions..."
    $functionDirs = Get-ChildItem -Path $functionsFullPath -Directory | Select-Object -ExpandProperty Name
    foreach ($fn in $functionDirs) {
        Write-Info "Déploiement de la fonction: $fn"
        & supabase functions deploy $fn
        if (-not $?) {
            Write-ErrorLine "Échec du déploiement de la fonction $fn"
            exit 1
        }
    }
    Write-Info "Toutes les fonctions ont été déployées."
}

Write-Host "Déploiement Supabase terminé avec succès." -ForegroundColor Green
