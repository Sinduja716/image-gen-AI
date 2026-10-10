import sys, time; sys.path.insert(0, "backend")
from app.providers.cloudflare_flux import CloudflareFluxProvider
from app.providers.base import ProviderError
p = CloudflareFluxProvider()
for i in range(8):
    try:
        r = p.generate("a simple black outline drawing of a cat, white background, no text", 2)
        print(i, "ok", r.latency_ms, "ms")
    except ProviderError as e:
        print(i, e.code, "|", str(e)[:300])
