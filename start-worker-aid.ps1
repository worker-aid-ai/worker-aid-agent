$ErrorActionPreference = "Stop"

Write-Host "Starting Worker Aid Agent local app..." -ForegroundColor Green

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js was not found. Install Node.js 18+ first: https://nodejs.org/" -ForegroundColor Yellow
  exit 1
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "pnpm was not found. Enable it with: corepack enable" -ForegroundColor Yellow
  exit 1
}

$port = 5173
$existing = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Port $port is already in use. Open http://localhost:$port/ or stop the existing process before restarting." -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path "node_modules")) {
  pnpm install
}

pnpm run start:app
