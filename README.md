# EduCreate AI

Teachers tap a button (colouring page, worksheet, flashcards, poster), type a short prompt, and get a
print-ready PDF. The system picks the cheapest image setting that is good enough, reuses pictures it
already has, and shows what it saved. Full plan: the team guide document. This repo is the code.

## Setup (Windows, once)

Install Python 3.11 and Node 22 LTS, then from the repo folder:

    powershell -ExecutionPolicy Bypass -File scripts\setup.ps1

Setup installs only locked versions. Do not install anything else.

## Run

Two terminals, from the repo folder:

    cd backend
    ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000

    cd frontend
    npm run dev

Open http://localhost:5173 . The default image provider is `mock`, which costs nothing and needs no keys.
Add keys to `.env` (copy of `.env.example`) only when your track needs them. `.env` is never committed.

## The five rules that prevent version errors

1. Never run `pip install <name>` or `npm install <name>`. Only the setup script installs anything.
2. Never run `pip install --upgrade`, `npm update` or `npm audit fix`.
3. If `git status` shows `package-lock.json` or `requirements.lock.txt` changed, undo it: `git checkout -- <file>`.
4. Run `python scripts/check_env.py` before you start and `scripts\verify.ps1` before every push.
5. Need a new package? Stop and ask the integrator. They add it once for everyone.

## Troubleshooting

| Message | Fix |
|---|---|
| `ModuleNotFoundError` or `ENVIRONMENT PROBLEMS` | Run `scripts\setup.ps1` again |
| `py` is not recognised | Install Python 3.11 from python.org and tick "Add to PATH" and the launcher |
| Script blocked in PowerShell | Use `powershell -ExecutionPolicy Bypass -File ...` as shown. Do not change the machine-wide policy. |
| `Cannot find module @rollup/rollup-win32-x64-msvc` | Delete `frontend\node_modules`, then run `npm ci` (not `npm install`) |
| Port 8000 or 5173 already in use | Close the other terminal, or add `--port 8001` and tell the team |
| Tests fail on a file you did not touch | Run `git status`. You may have edited a frozen file. Undo it. |

## Layout

    backend/app/planner      Track 1     backend/app/providers   Track 2
    backend/app/metrics.py   Track 1     backend/app/pipeline    Track 2
    frontend/src             Track 3     docs/                   plan, contract, ownership
