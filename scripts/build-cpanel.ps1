# Build dhunni + admin into backend/public and zip for HostingRam cPanel
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Public = Join-Path $Backend "public"
$ZipOut = Join-Path $Root "highflyerpigeons-cpanel.zip"

Write-Host "==> Building dhunni (website)..."
Push-Location (Join-Path $Root "dhunni")
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Write-Host "==> Building admin (/admin)..."
Push-Location (Join-Path $Root "admin")
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Write-Host "==> Assembling backend/public..."
if (Test-Path $Public) { Remove-Item $Public -Recurse -Force }
New-Item -ItemType Directory -Path $Public | Out-Null
Copy-Item -Path (Join-Path $Root "dhunni\dist\*") -Destination $Public -Recurse -Force
New-Item -ItemType Directory -Path (Join-Path $Public "admin") | Out-Null
Copy-Item -Path (Join-Path $Root "admin\dist\*") -Destination (Join-Path $Public "admin") -Recurse -Force

Write-Host "==> Creating zip (backend without node_modules)..."
if (Test-Path $ZipOut) { Remove-Item $ZipOut -Force }

$Staging = Join-Path $Root "_cpanel_staging"
if (Test-Path $Staging) { Remove-Item $Staging -Recurse -Force }
New-Item -ItemType Directory -Path $Staging | Out-Null

$Exclude = @("node_modules", ".git")
Get-ChildItem $Backend -Force | Where-Object { $Exclude -notcontains $_.Name } | ForEach-Object {
  Copy-Item $_.FullName -Destination (Join-Path $Staging $_.Name) -Recurse -Force
}

# Production NODE_ENV only in the zip copy (leave local .env unchanged)
$StagedEnv = Join-Path $Staging ".env"
if (Test-Path $StagedEnv) {
  $envContent = Get-Content $StagedEnv -Raw
  if ($envContent -match "NODE_ENV=") {
    $envContent = $envContent -replace "NODE_ENV=\w+", "NODE_ENV=production"
  } else {
    $envContent = $envContent.TrimEnd() + "`nNODE_ENV=production`n"
  }
  Set-Content -Path $StagedEnv -Value $envContent -NoNewline
}

Compress-Archive -Path (Join-Path $Staging "*") -DestinationPath $ZipOut -Force
Remove-Item $Staging -Recurse -Force

Write-Host ""
Write-Host "Done."
Write-Host "  Public site:  backend/public/"
Write-Host "  Admin:        backend/public/admin/"
Write-Host "  Zip:          $ZipOut"
Write-Host ""
Write-Host "cPanel Node.js settings:"
Write-Host "  Domain:        highflyerpigeons.com"
Write-Host "  Startup file:  app.js"
Write-Host "  App URL:       /  (or leave blank for root)"
Write-Host "  After upload:  npm install  then Restart"
