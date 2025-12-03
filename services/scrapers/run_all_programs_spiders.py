"""Run all 30 programs spiders to populate database with 500+ programs"""
import subprocess
import sys
from datetime import datetime

# All 30 programs spiders
SPIDERS = [
    "abu_programs_spider", "abuad_programs_spider", "auchipoly_programs_spider",
    "babcock_programs_spider", "buk_programs_spider", "eksu_programs_spider",
    "fcetakoka_programs_spider", "fcezaria_programs_spider", "fedpolel_programs_spider",
    "fedpolybida_programs_spider", "fedpotek_programs_spider", "fpno_programs_spider",
    "futa_programs_spider", "futo_programs_spider", "kadpoly_programs_spider",
    "lasu_programs_spider", "lautech_programs_spider", "mapoly_programs_spider",
    "nda_programs_spider", "noun_programs_spider", "oau_programs_spider",
    "obong_programs_spider", "uniben_programs_spider", "unical_programs_spider",
    "unijos_programs_spider", "unilag_programs_spider", "unilorin_programs_spider",
    "uniport_programs_spider", "uniuyo_programs_spider", "unizik_programs_spider",
    "unn_programs_spider"
]

print("=" * 80)
print(f"RUNNING ALL {len(SPIDERS)} PROGRAMS SPIDERS")
print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 80)
print()

successful = 0
failed = 0
failed_spiders = []
spider_details = []

for i, spider in enumerate(SPIDERS, 1):
    print(f"[{i:2d}/{len(SPIDERS)}] Running {spider:30s}...", end=" ", flush=True)

    try:
        result = subprocess.run(
            ["python", "-m", "scrapy", "crawl", spider],
            capture_output=True,
            text=True,
            timeout=60  # 60 second timeout per spider
        )

        if result.returncode == 0:
            # Try to extract program count from output
            output = result.stdout + result.stderr
            programs_added = "unknown"
            for line in output.split('\n'):
                if 'Scraped' in line or 'items' in line.lower():
                    # Try to extract number
                    import re
                    match = re.search(r'(\d+)\s+item', line, re.IGNORECASE)
                    if match:
                        programs_added = match.group(1)
                        break

            print(f"[OK] ({programs_added} programs)")
            successful += 1
            spider_details.append((spider, "success", programs_added))
        else:
            print("[FAILED]")
            failed += 1
            failed_spiders.append(spider)
            spider_details.append((spider, "failed", "0"))
    except subprocess.TimeoutExpired:
        print("[TIMEOUT]")
        failed += 1
        failed_spiders.append(spider)
        spider_details.append((spider, "timeout", "0"))
    except Exception as e:
        print(f"[ERROR: {e}]")
        failed += 1
        failed_spiders.append(spider)
        spider_details.append((spider, f"error: {e}", "0"))

print()
print("=" * 80)
print(f"BATCH EXECUTION COMPLETED")
print(f"End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 80)
print()
print(f"SUCCESS: {successful}/{len(SPIDERS)} spiders completed successfully")
print(f"FAILED:  {failed}/{len(SPIDERS)} spiders failed")
print()

if failed_spiders:
    print("Failed spiders:")
    for spider in failed_spiders:
        print(f"  - {spider}")
    print()

print("Detailed results:")
for spider, status, count in spider_details:
    print(f"  {spider:35s} | {status:15s} | {count} programs")

print()
print("=" * 80)
print("Next: Run 'python check_programs.py' to verify database state")
print("=" * 80)

sys.exit(0 if failed == 0 else 1)
