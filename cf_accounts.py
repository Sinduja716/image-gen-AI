import sys; sys.path.insert(0, "backend")
import httpx
from app.config import settings
tok, acc = settings.cloudflare_api_token, settings.cloudflare_account_id
r = httpx.get("https://api.cloudflare.com/client/v4/accounts", headers={"Authorization": f"Bearer {tok}"}, timeout=20)
print("status", r.status_code)
for a in r.json().get("result") or []:
    print("account:", a["id"], "|", a.get("name"))
print("your .env account id:", acc)
print("MATCH" if any(a["id"] == acc for a in (r.json().get("result") or [])) else "NO MATCH")
