# Flexcoin packager (PowerShell)
Write-Host "Flexcoin packager started..." -ForegroundColor Yellow
$base = "$PSScriptRoot"
$src = Join-Path $base "flexcoin-site"
$dist = Join-Path $base "flexcoin_zips_out"
New-Item -ItemType Directory -Force -Path $dist | Out-Null
$targets = @("public/hero","public/action","public/nft-preview","src","config","index.html","favicon.ico")
foreach ($t in $targets) {
  $p = Join-Path $src $t
  if (Test-Path $p) {
    $zip = ($t -replace "[\\/]", "_") + ".zip"
    $zipPath = Join-Path $dist $zip
    Compress-Archive -Path $p -DestinationPath $zipPath -Force
  } else { Write-Host "Missing: $t" -ForegroundColor Red }
}
Write-Host "Done -> $dist" -ForegroundColor Green
