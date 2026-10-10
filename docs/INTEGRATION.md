# Integration (for the integrator)

## Start of the event

1. Create the remote repository, push this folder to `main`.
2. Each developer clones, then runs `scripts\setup.ps1`, then creates their branch:
   `git checkout -b track1-planner` (or `track2-pipeline`, `track3-frontend`).
3. Everyone runs `scripts\verify.ps1` once. All three must see "ALL CHECKS PASSED" before anyone codes.

## Merging at the end (about 20 minutes)

    git checkout main
    git fetch --all
    git merge --no-ff origin/track2-pipeline
    powershell -ExecutionPolicy Bypass -File scripts\verify.ps1
    git merge --no-ff origin/track1-planner
    powershell -ExecutionPolicy Bypass -File scripts\verify.ps1
    git merge --no-ff origin/track3-frontend
    powershell -ExecutionPolicy Bypass -File scripts\verify.ps1

Run verify after every merge so a problem points at one branch. The three tracks edit different files, so
conflicts should not happen. If one does, a developer edited a file outside their track: run
`python scripts/check_ownership.py trackN` on that branch to see which.

## Then

1. Put real keys in `.env` and set `IMAGE_PROVIDER=cloudflare_flux`.
2. Start both servers and run the demo script from the guide.
3. Run one full A-Z request, then the same request again to confirm the second one is free.

## If someone truly needs a new package

1. Add its name to `backend/requirements.in` (or `frontend`: `npm install --save-exact <pkg>@<version>`).
2. Backend: in a fresh Python 3.11 environment run `pip install -r backend/requirements.in`, then
   `pip freeze` and replace `requirements.lock.txt` (keep the header line and the colorama line).
3. Run `scripts\verify.ps1`, commit, and tell the team to pull and run `scripts\setup.ps1` again.

## Changing the data contract

Edit `schemas.py` and `types.ts` together, run `python tests/make_snapshot.py` from `backend`, and tell every
developer before they next pull.
