"""Run all 19 batch 2 programs spiders"""
import subprocess
import sys

SPIDERS = [
    "unical_programs_spider", "unijos_programs_spider", "unizik_programs_spider", "uniuyo_programs_spider",
    "eksu_programs_spider", "lautech_programs_spider", "babcock_programs_spider", "abuad_programs_spider",
    "fpno_programs_spider", "kadpoly_programs_spider", "auchipoly_programs_spider", "fedpotek_programs_spider",
    "fedpolel_programs_spider", "mapoly_programs_spider", "fedpolybida_programs_spider",
    "fcezaria_programs_spider", "fcetakoka_programs_spider", "nda_programs_spider", "noun_programs_spider"
]

print("=" * 80)
print("RUNNING 19 BATCH 2 PROGRAMS SPIDERS")
print("=" * 80)
print()

successful = 0
failed = 0
failed_spiders = []

for i, spider in enumerate(SPIDERS, 1):
    print(f"[{i:2d}/19] Running {spider}...", end=" ", flush=True)

    try:
        result = subprocess.run(
            ["python", "-m", "scrapy", "crawl", spider],
            capture_output=True,
            text=True,
            timeout=30  # 30 second timeout per spider (programs are fast)
        )

        if result.returncode == 0:
            print("[OK]")
            successful += 1
        else:
            print("[FAILED]")
            failed += 1
            failed_spiders.append(spider)
    except subprocess.TimeoutExpired:
        print("[TIMEOUT]")
        failed += 1
        failed_spiders.append(spider)
    except Exception as e:
        print(f"[ERROR: {e}]")
        failed += 1
        failed_spiders.append(spider)

print()
print("=" * 80)
print(f"RESULTS: {successful} successful, {failed} failed")
print("=" * 80)

if failed_spiders:
    print("\nFailed spiders:")
    for spider in failed_spiders:
        print(f"  - {spider}")

sys.exit(0 if failed == 0 else 1)
