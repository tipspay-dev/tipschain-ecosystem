$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$package = Get-Content (Join-Path $root "package.json") | ConvertFrom-Json
$version = $package.version
$releaseDir = Join-Path $root "dist"
$sourceDir = Join-Path $root "extension\tipswallet-extension"
$stageDir = Join-Path $releaseDir "tipswallet-extension"
$zipPath = Join-Path $releaseDir ("tipswallet-extension-v{0}.zip" -f $version)
$manifestScript = Join-Path $root "scripts\write-release-manifest.js"

New-Item -ItemType Directory -Force $releaseDir | Out-Null

if (Test-Path $stageDir) {
  Remove-Item -LiteralPath $stageDir -Recurse -Force
}

Copy-Item -Path $sourceDir -Destination $stageDir -Recurse

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $stageDir "*") -DestinationPath $zipPath -Force
Write-Host "Extension package ready:" $zipPath

& node $manifestScript
if ($LASTEXITCODE -ne 0) {
  throw "Release manifest refresh failed."
}
