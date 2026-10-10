import sys, time, hashlib; sys.path.insert(0, "backend")
import httpx
from app.config import settings
acc, tok = settings.cloudflare_account_id, settings.cloudflare_api_token
print("token fingerprint:", hashlib.sha256(tok.encode()).hexdigest()[:6], "| account:", acc[:6] + "...")
h = {"Authorization": f"Bearer {tok}"}
url = f"https://api.cloudflare.com/client/v4/accounts/{acc}/ai/run/@cf/black-forest-labs/flux-1-schnell"
for attempt in range(1, 6):
    try:
        r = httpx.post(url, headers=h, json={"prompt": "a cat", "steps": 1}, timeout=60)
        print("flux", r.status_code, r.text[:200].replace(tok, "***"))
        break
    except httpx.HTTPError as e:
        print(f"attempt {attempt}: {type(e).__name__}, retrying")
        time.sleep(3)
