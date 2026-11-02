# ========================================================
# ChurnGuard AI - Frontend Startup Script
# ========================================================

Set-Location (Join-Path $PSScriptRoot "frontend")
Write-Host "Starting ChurnGuard AI Frontend on http://localhost:5173..." -ForegroundColor Cyan
npm run dev
