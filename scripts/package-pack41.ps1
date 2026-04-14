$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$package = Get-Content (Join-Path $root "package.json") | ConvertFrom-Json
$version = $package.version
$releaseDir = Join-Path $root "dist"
$sourceDir = Join-Path $root "rail1-pack41"
$zipPath = Join-Path $releaseDir ("tipswallet-rail1-pack41-v{0}.zip" -f $version)
$manifestScript = Join-Path $root "scripts\write-release-manifest.js"

New-Item -ItemType Directory -Force $releaseDir | Out-Null

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $sourceDir "*") -DestinationPath $zipPath -Force
Write-Host "Pack 4.1 archive ready:" $zipPath

& node $manifestScript
if ($LASTEXITCODE -ne 0) {
  throw "Release manifest refresh failed."
}
