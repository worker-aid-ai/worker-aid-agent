$ErrorActionPreference = "Stop"

Write-Host "Starting Worker Aid Agent local app..." -ForegroundColor Green

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "pnpm was not found. Enable it with: corepack enable" -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path "node_modules")) {
  pnpm install
}

pnpm run start:app
