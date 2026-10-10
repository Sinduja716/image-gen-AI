# One-time setup. Run from anywhere:  powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function Run($cmd) { Invoke-Expression $cmd; if ($LASTEXITCODE -ne 0) { throw "FAILED: $cmd" } }

if (-not (Test-Path .venv)) { Run "py -3.11 -m venv .venv" }
Run ".\.venv\Scripts\python.exe -m pip install -r backend\requirements.lock.txt"
Push-Location frontend
Run "npm ci"
Pop-Location
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
Run ".\.venv\Scripts\python.exe scripts\check_env.py"
Write-Host "Setup finished."
