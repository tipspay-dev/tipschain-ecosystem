$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$package = Get-Content (Join-Path $root "package.json") | ConvertFrom-Json
$version = $package.version
$sourceDir = Join-Path $root "apps\wallet-web\dist"
$releaseDir = Join-Path $root "dist"
$publishDir = Join-Path $releaseDir "wallet.tipspay.org"
$zipPath = Join-Path $releaseDir ("wallet.tipspay.org-v{0}.zip" -f $version)
$manifestScript = Join-Path $root "scripts\write-release-manifest.js"

if (-not (Test-Path $sourceDir)) {
  throw "Wallet web build output not found at $sourceDir. Run npm run wallet:build first."
}

New-Item -ItemType Directory -Force $releaseDir | Out-Null
if (Test-Path $publishDir) {
  Remove-Item -LiteralPath $publishDir -Recurse -Force
}

Copy-Item -Path $sourceDir -Destination $publishDir -Recurse

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $publishDir "*") -DestinationPath $zipPath -Force
Write-Host "Wallet web package ready:" $zipPath

& node $manifestScript
if ($LASTEXITCODE -ne 0) {
  throw "Release manifest refresh failed."
}
