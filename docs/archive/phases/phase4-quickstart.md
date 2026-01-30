# Phase 4 - Search Integration Quick Start Guide

**Status:** ✅ **READY TO USE**
**Tests:** 14/14 PASSING ✅
**Performance:** < 50ms ✅

---

## 🚀 Quick Start (5 Minutes)

### 1. Start Meilisearch

```bash
# From project root
docker-compose -f docker-compose.meilisearch.yml up -d

# Verify it's running
curl http://localhost:7700/health
# Expected: {"status":"available"}
```

### 2. Set Up Indexes

```bash
cd services/api
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Linux/Mac

python scripts/setup_meilisearch.py
```

### 3. Sync Data

```bash
python scripts/sync_to_meilisearch.py
```

### 4. Start API

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test It!

```bash
# Search for "computer"
curl "http://localhost:8000/api/v1/search?q=computer"

# Autocomplete
curl "http://localhost:8000/api/v1/search/autocomplete?q=uni"
```

---

## 📋 Environment Variables

Make sure these are in `services/api/.env`:

```bash
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=admitly_master_key_dev_2025
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

---

## 🧪 Run Tests

```bash
cd services/api
python -m pytest tests/test_search.py -v
# Expected: 14 passed
```

---

## 📚 API Endpoints

### Global Search
```bash
GET /api/v1/search?q=<query>&type=<all|institutions|programs>
```

**Filters:**
- `state` - Comma-separated states
- `institution_type` - Comma-separated types
- `verified` - Boolean
- `degree_type` - Comma-separated
- `field_of_study` - Comma-separated
- `mode` - Comma-separated
- `min_tuition`, `max_tuition` - Range
- `min_cutoff`, `max_cutoff` - Range
- `page`, `page_size` - Pagination

### Autocomplete
```bash
GET /api/v1/search/autocomplete?q=<query>&limit=<number>
```

---

## 📖 Examples

### Basic Search
```bash
curl "http://localhost:8000/api/v1/search?q=computer"
```

### Institution Search
```bash
curl "http://localhost:8000/api/v1/search?q=lagos&type=institutions"
```

### Program Search with Filters
```bash
curl "http://localhost:8000/api/v1/search?q=engineering&type=programs&state=Lagos&degree_type=undergraduate"
```

### Typo-Tolerant Search
```bash
# Searches for "UNILAG" even with typo
curl "http://localhost:8000/api/v1/search?q=Unilaag&type=institutions"
```

### Autocomplete
```bash
curl "http://localhost:8000/api/v1/search/autocomplete?q=comp&limit=5"
```

---

## 🐛 Troubleshooting

### Docker not running?
```bash
# Start Docker Desktop first, then:
docker-compose -f docker-compose.meilisearch.yml up -d
```

### No results?
```bash
# Re-sync data
python scripts/sync_to_meilisearch.py
```

### Tests failing?
```bash
# Reinstall dependencies
pip install -r requirements.txt
pytest tests/test_search.py -v
```

---

## 📁 Key Files

| File | Description |
|------|-------------|
| `docker-compose.meilisearch.yml` | Meilisearch Docker setup |
| `scripts/setup_meilisearch.py` | Create & configure indexes |
| `scripts/sync_to_meilisearch.py` | Sync data from Supabase |
| `routers/search.py` | Search API endpoints |
| `services/search_service.py` | Search business logic |
| `schemas/search.py` | Pydantic models |
| `tests/test_search.py` | Test suite (14 tests) |

---

## ✨ Features

✅ Fast search (< 50ms)
✅ Typo tolerance
✅ Advanced filtering
✅ Autocomplete
✅ Highlighted results
✅ Pagination
✅ 14 tests passing

---

## 📄 Full Documentation

See `PHASE4_SEARCH_IMPLEMENTATION.md` for complete documentation.

---

**Quick Questions?**

1. **How to re-sync data?**
   ```bash
   python scripts/sync_to_meilisearch.py
   ```

2. **How to check Meilisearch status?**
   ```bash
   curl http://localhost:7700/health
   docker logs admitly_meilisearch
   ```

3. **How to stop Meilisearch?**
   ```bash
   docker-compose -f docker-compose.meilisearch.yml down
   ```

4. **How to test search?**
   ```bash
   # Open in browser
   http://localhost:8000/docs
   # Navigate to "search" section
   ```

---

**Ready to go!** 🚀

For production deployment, see `PHASE4_IMPLEMENTATION_SUMMARY.md`.
