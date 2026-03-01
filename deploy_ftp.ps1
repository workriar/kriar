
# ============================================================
# deploy_ftp.ps1 - Kriar FTP Deploy via CURL
# ============================================================

$FTP_HOST = "177.153.209.189"
$FTP_USER = "kriar3"
$FTP_PASS = "yHt8wi5AS6biRB2@"
$REMOTE_DIR = "/public_html"
$LOCAL_DIR = $PSScriptRoot
$CURL = "C:\Windows\System32\curl.exe"

$global:ok = 0
$global:fail = 0

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  KRIAR - Deploy FTP (CURL Mode)     " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Host: $FTP_HOST" -ForegroundColor Gray
Write-Host "  Destino: $REMOTE_DIR" -ForegroundColor Gray
Write-Host ""

function Upload([string]$local, [string]$remote) {
    try {
        $remotePath = "ftp://$($FTP_HOST)$($remote)"
        # --ftp-create-dirs handles directory creation
        # -u user:pass handles auth
        # -T localfile uploads it
        # --silent and --show-error for clean output
        & $CURL --silent --show-error --ftp-create-dirs -u "$($FTP_USER):$($FTP_PASS)" -T "$local" "$remotePath"
        
        if ($LASTEXITCODE -eq 0) {
            $rel = $remote.Replace($REMOTE_DIR, "")
            Write-Host "  [OK] $rel" -ForegroundColor Green
            $global:ok++
        }
        else {
            Write-Host "  [ERRO] $remote (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
            $global:fail++
        }
    }
    catch {
        Write-Host "  [ERRO] $remote - $_" -ForegroundColor Red
        $global:fail++
    }
}

# Arquivos a excluir
$excluir = @("package-lock.json", "server.js", "inject_seo.ps1", "inject_btt.ps1", "deploy_ftp.ps1", "iniciar-servidor.bat", "GUIA_FTP.md", "README.md", "CHANGELOG.md", ".gitignore")

# Raiz
Write-Host "Enviando arquivos da raiz..." -ForegroundColor Yellow
$extsRaiz = @(".html", ".xml", ".txt", ".json", ".webmanifest")
Get-ChildItem -Path $LOCAL_DIR -File | ForEach-Object {
    if ($extsRaiz -contains $_.Extension.ToLower() -and $excluir -notcontains $_.Name) {
        Upload $_.FullName "$REMOTE_DIR/$($_.Name)"
    }
}

# CSS
Write-Host ""
Write-Host "Enviando css/..." -ForegroundColor Yellow
if (Test-Path "$LOCAL_DIR\css") {
    Get-ChildItem -Path "$LOCAL_DIR\css" -File | ForEach-Object {
        Upload $_.FullName "$REMOTE_DIR/css/$($_.Name)"
    }
}

# JS
Write-Host ""
Write-Host "Enviando js/..." -ForegroundColor Yellow
if (Test-Path "$LOCAL_DIR\js") {
    Get-ChildItem -Path "$LOCAL_DIR\js" -File | ForEach-Object {
        Upload $_.FullName "$REMOTE_DIR/js/$($_.Name)"
    }
}

# Assets/images
Write-Host ""
Write-Host "Enviando assets/images/..." -ForegroundColor Yellow
$imgExts = @(".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif")
if (Test-Path "$LOCAL_DIR\assets\images") {
    Get-ChildItem -Path "$LOCAL_DIR\assets\images" -File | ForEach-Object {
        if ($imgExts -contains $_.Extension.ToLower()) {
            Upload $_.FullName "$REMOTE_DIR/assets/images/$($_.Name)"
        }
    }
}

# Assets/icons
Write-Host ""
Write-Host "Enviando assets/icons/..." -ForegroundColor Yellow
if (Test-Path "$LOCAL_DIR\assets\icons") {
    Get-ChildItem -Path "$LOCAL_DIR\assets\icons" -File | ForEach-Object {
        Upload $_.FullName "$REMOTE_DIR/assets/icons/$($_.Name)"
    }
}

# Resultado
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Resultado" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Enviados: $($global:ok)" -ForegroundColor Green
if ($global:fail -gt 0) {
    Write-Host "  Falhas:   $($global:fail)" -ForegroundColor Red
}
else {
    Write-Host "  Falhas:   0" -ForegroundColor Green
}
Write-Host ""
Write-Host "  Site: https://kriar.digital" -ForegroundColor Cyan
Write-Host ""
