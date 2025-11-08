param([string]$Source='.\NewHero',[string]$Target='.\public\hero')
New-Item -ItemType Directory -Force -Path $Target | Out-Null
$i=1; Get-ChildItem $Source -Include *.jpg,*.png -File | Sort-Object Name | Select-Object -First 7 | ForEach-Object { Copy-Item $_.FullName (Join-Path $Target ("$i.jpg")); $i++ }
Copy-Item (Join-Path $Target '1.jpg') (Join-Path $Target 'main-hero.jpg') -Force
