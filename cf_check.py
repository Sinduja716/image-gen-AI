import sys; sys.path.insert(0, "backend")
import httpx
from app.config import settings
acc, tok = settings.cloudflare_account_id, settings.cloudflare_api_token
print("account id length:", len(acc), "| token length:", len(tok), "| token starts:", tok[:4])
h = {"Authorization": f"Bearer {tok}"}
for name, url in [
    ("account token verify", f"https://api.cloudflare.com/client/v4/accounts/{acc}/tokens/verify"),
    ("user token verify", "https://api.cloudflare.com/client/v4/user/tokens/verify"),
]:
    r = httpx.get(url, headers=h, timeout=20)
    print(name, r.status_code, r.text[:300].replace(tok, "***"))
r = httpx.post(
    f"https://api.cloudflare.com/client/v4/accounts/{acc}/ai/run/@cf/black-forest-labs/flux-1-schnell",
    headers=h, json={"prompt": "a cat", "steps": 1}, timeout=60)
print("flux", r.status_code, r.text[:300].replace(tok, "***"))
