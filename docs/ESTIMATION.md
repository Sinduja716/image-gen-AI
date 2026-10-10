# How the estimate is calculated (submission text)

OWNER: gg (Track 1). Fill every [FILL] with a MEASURED value or delete the sentence. Never invent a number.
This page is what the judges read for the constraint "teams must explain how the estimate is calculated".

## 1. What we measure
Our generator is Cloudflare Workers AI FLUX.1 schnell. Its only effort control is `steps` (1-8). We use three
quality tiers: draft = 2 steps, standard = 4 steps, high = 8 steps (the maximum the model allows).
For every image we show two cost measures and one saving figure:

| Shown | What it is | Where the number comes from |
|---|---|---|
| Compute (neurons) | Cloudflare's own billing unit for Workers AI | Measured by us (section 3) |
| Time (seconds) | End-to-end duration of one generation | Measured by us (section 3), actual value for finished images |
| Cost ($) | neurons / 1000 x $0.011 | Cloudflare's published paid rate; free-tier use costs $0, so this is an estimate |
| Saving (%) | Compared with the same image at 8 steps | formulas in section 2 |

## 2. Formulas
- cost_usd = neurons / 1000 x 0.011
- saving_percent = (1 - neurons / neurons at 8 steps) x 100
- time_saving_percent = (1 - seconds / seconds at 8 steps) x 100
- A reused page (found in our library) generates nothing: neurons = 0, seconds = 0, saving = 100%.
- Request total: baseline = pages x neurons at 8 steps with no reuse. Saved = 1 - (neurons actually used / baseline).
  We split the saving into "from choosing a lower tier" and "from reusing images" so neither is overstated.

## 3. How the numbers were measured
- Neurons: [FILL date/time]. We generated [FILL n] images at each step setting, read the Cloudflare dashboard
  usage before and after, and divided by n. Result: 2 steps = [FILL] neurons, 4 steps = [FILL], 8 steps = [FILL].
- Seconds: `scripts/measure_costs.py` timed [FILL n] generations per tier; we use the median:
  2 steps = [FILL] s, 4 steps = [FILL] s, 8 steps = [FILL] s. This includes network time from our server.
- Both tables live in data/library/neurons.json and data/library/timings.json. Until they exist the app labels
  every figure "placeholder".

## 4. Why the lower tier is acceptable (not just cheaper)
Calibration: we generated the same [FILL n] subjects at 2, 4 and 8 steps and scored them 1-5 for the purpose
(colouring outline, worksheet picture, poster). Results: [FILL table from data/profiles.json]. Draft is used only
where its score is within [FILL] of high. Purpose-to-tier mapping: colouring = draft, worksheet = standard,
flashcards = standard, poster = high, thumbnail = draft, auto = decided from the prompt by the planner.

## 5. Energy
No energy-per-neuron figure is published for this service, so by default we show relative compute (neurons),
time and dollars instead of inventing watt-hours. If the team sets ENERGY_WH_PER_1000_NEURONS it is shown as
"illustrative" with its source: [FILL source or write "not used"].

## 6. Limits we state openly
- Estimates, not invoices. Neuron counts are our own measurements on [FILL date]; Cloudflare may change them.
- Seconds include network latency and vary by load.
- Image quality is judged by people in a small calibration set, not by an automatic metric.
- The saving is against our own maximum setting (8 steps), as the brief asks.

## 7. Results table (one row per test prompt)
[FILL: paste the output of the benchmark script: prompt, pages, tier, neurons used, baseline neurons, saving %,
seconds used, baseline seconds, time saving %, pages reused.]
