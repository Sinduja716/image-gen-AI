import sys, time; sys.path.insert(0, "backend")
from app.providers.cloudflare_flux import CloudflareFluxProvider
from app.providers.base import ProviderError
p = CloudflareFluxProvider()
for s in (2, 4, 8):
    for attempt in range(1, 5):
        try:
            r = p.generate("a simple black outline drawing of a cat, white background, no text", s)
            open(f"test_steps{s}.jpg", "wb").write(r.image_bytes)
            print("steps", s, r.mime, r.latency_ms, "ms", len(r.image_bytes), "bytes")
            break
        except ProviderError as e:
            print(f"steps {s} attempt {attempt}: {e.code}")
            time.sleep(3)
