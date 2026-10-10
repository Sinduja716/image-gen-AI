import csv
from pathlib import Path
import sys

repo_root = Path(__file__).parent.parent.parent
sys.path.append(str(repo_root / "backend"))

from app.schemas import GenerationRequest, MaterialType, Overrides, JobStatus
from app.planner import make_plan
from app.metrics import compute_metrics

def main():
    prompts_file = repo_root / "data" / "test_prompts.csv"
    if not prompts_file.exists():
        print("Test prompts not found.")
        return

    results = []
    
    with open(prompts_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            mat = MaterialType(row['material_type'])
            overrides = Overrides()
            
            # Pydantic models in V1 need strictly matching types if set, 
            # though None is allowed if we don't pass kwargs.
            kwargs = {}
            if row.get('override_count'):
                kwargs['count'] = int(row['override_count'])
            if row.get('override_tier'):
                kwargs['tier'] = row['override_tier']
                
            if kwargs:
                overrides = Overrides(**kwargs)
            else:
                overrides = None
                
            req = GenerationRequest(
                material_type=mat,
                prompt=row['prompt'],
                overrides=overrides
            )
            
            plan = make_plan(req)
            
            # Simulate completion
            for i, job in enumerate(plan.jobs):
                job.status = JobStatus.completed
                # Simulate a cache hit for every 3rd job to show reuse savings
                if i % 3 == 2:
                    job.cache_hit = True
                    
            metrics = compute_metrics(plan)
            results.append({
                "prompt": row['prompt'],
                "type": mat.value,
                "jobs": len(plan.jobs),
                "baseline_neurons": metrics.baseline_neurons,
                "used_neurons": metrics.neurons_used,
                "saving_percent": metrics.saving_percent
            })
            
    output = []
    output.append("## Benchmark Results (Simulated)")
    output.append("> **Note:** All figures use canonical placeholder estimates. Cache hits and completions are mocked. These do not represent actual provider measurements.")
    output.append("")
    output.append("| Prompt | Type | Jobs | Baseline Neurons | Used Neurons | Saving % |")
    output.append("|---|---|---|---|---|---|")
    for r in results:
        output.append(f"| {r['prompt']} | {r['type']} | {r['jobs']} | {r['baseline_neurons']} | {r['used_neurons']} | {r['saving_percent']}% |")
        
    md_path = repo_root / "docs" / "track1" / "benchmark.md"
    md_path.write_text("\n".join(output), encoding='utf-8')
    print(f"Results written to {md_path}")

if __name__ == "__main__":
    main()
