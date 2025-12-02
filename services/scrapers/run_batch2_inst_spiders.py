"""Run all 19 batch 2 institution spiders"""
import subprocess
import sys

SPIDERS = [
    "unical_spider", "unijos_spider", "unizik_spider", "uniuyo_spider",
    "eksu_spider", "lautech_spider", "babcock_spider", "abuad_spider",
    "fpno_spider", "kadpoly_spider", "auchipoly_spider", "fedpotek_spider",
    "fedpolel_spider", "mapoly_spider", "fedpolybida_spider",
    "fcezaria_spider", "fcetakoka_spider", "nda_spider", "noun_spider"
]

print("=" * 80)
print("RUNNING 19 BATCH 2 INSTITUTION SPIDERS")
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
            timeout=120  # 120 second timeout per spider
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
