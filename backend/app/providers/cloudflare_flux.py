"""TRACK 2: implement this with httpx (already installed). Endpoint and fields: see the model page
https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/ . Normalise errors into
ProviderError and read the real neuron cost from your test run. Settings come from app.config.settings.
"""
from __future__ import annotations

from app.providers.base import ProviderError, ProviderResult


class CloudflareFluxProvider:
    name = "cloudflare_flux"

    def generate(self, prompt: str, steps: int) -> ProviderResult:
        raise ProviderError("not_implemented", "TRACK 2: implement the Cloudflare call")
