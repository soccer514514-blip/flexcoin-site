
param(
  [string]$ProjectRoot = "$(Get-Location)"
)

Write-Host "Project: $ProjectRoot"

Set-Location $ProjectRoot

# 1) Ensure public/hero
New-Item -ItemType Directory -Force -Path ".\public\hero" | Out-Null

# 2) Copy images from patch into project
$patchHero = ".\patch\public\hero"
if (Test-Path $patchHero) {
  Get-ChildItem $patchHero -File | ForEach-Object {
    Copy-Item $_.FullName ".\public\hero\$($_.Name)" -Force
  }
}

# 3) Ensure CNAME
Copy-Item ".\patch\public\CNAME" ".\public\CNAME" -Force

# 4) Ensure vite base:'/'
$vitePath = ".\vite.config.ts"
if (Test-Path $vitePath) {
  $vite = Get-Content $vitePath -Raw
  if ($vite -notmatch 'defineConfig') {
    $vite = "import { defineConfig } from 'vite';`r`nexport default defineConfig({ base: '/' });`r`n"
  } else {
    if ($vite -match 'base\s*:\s*[''"].*?[''"]') {
      $vite = $vite -replace 'base\s*:\s*[''"].*?[''"]', "base: '/'"
    } else {
      $vite = $vite -replace 'defineConfig\(\s*\{', "defineConfig({`r`n  base: '/',"
    }
  }
  Set-Content $vitePath $vite -Encoding UTF8
} else {
  "import { defineConfig } from 'vite';
export default defineConfig({
  base: '/',
});
" | Set-Content $vitePath -Encoding UTF8
}

# 5) Update src/main.ts (HERO_IMAGES and function)
$mainPath = ".\src\main.ts"
Copy-Item $mainPath "$mainPath.bak" -Force
$main = Get-Content $mainPath -Raw

$heroBlock = @"
const HERO_IMAGES = [
  "/hero/1.jpg",
  "/hero/2.jpg",
  "/hero/3.jpg",
  "/hero/4.jpg",
  "/hero/5.jpg",
  "/hero/6.jpg",
  "/hero/7.jpg",
];
"@

if ($main -match 'const\s+HERO_IMAGES\s*=\s*\[') {
  $main = $main -replace 'const\s+HERO_IMAGES\s*=\s*\[[\s\S]*?\];', $heroBlock.Trim()
} else {
  if ($main -match 'import\s+.*?;') {
    $main = $main -replace '(import\s+.*?;\s*)', "`$1`r`n$($heroBlock.Trim())`r`n"
  } else {
    $main = "$($heroBlock.Trim())`r`n$main"
  }
}

$fnBlock = @"
function applyHeroBackground(idx = 0) {
  const el = document.body;
  if (HERO_IMAGES.length === 0) return;
  el.style.backgroundImage = `url(\${HERO_IMAGES[idx % HERO_IMAGES.length]})`;
}
"@

if ($main -match 'function\s+applyHeroBackground\s*\(') {
  $main = $main -replace 'function\s+applyHeroBackground\s*\([\s\S]*?\}\s*', $fnBlock.Trim() + "`r`n"
} else {
  $main = $main + "`r`n" + $fnBlock.Trim() + "`r`n"
}

Set-Content $mainPath $main -Encoding UTF8

# 6) Build
npm run build

Write-Host "Patch complete."
