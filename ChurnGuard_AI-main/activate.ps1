# ========================================================
# ChurnGuard AI - PowerShell Virtual Environment Activator
# ========================================================

$VenvActivate = Join-Path $PSScriptRoot "backend\.venv\Scripts\Activate.ps1"

if (Test-Path $VenvActivate) {
    & $VenvActivate
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  ChurnGuard AI Virtual Environment Successfully Activated!  " -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "Python location: " -NoNewline
    Write-Host (Get-Command python).Source -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "Error: Virtual environment not found at backend\.venv" -ForegroundColor Red
}
