# Quick Start - Test Search Integration

## Step 1: Start Backend API

Open a terminal:

```bash
cd services/api
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# Install dependencies (if needed)
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify backend is running:**
```bash
# In another terminal
curl http://127.0.0.1:8001/health
```

Should return: `{"status":"healthy"}`

---

## Step 2: Start Frontend

Open another terminal:

```bash
cd apps/web

# Install dependencies (if needed)
pnpm install

# Start dev server
pnpm dev
```

**Expected output:**
```
VITE v5.x.x  ready in 500ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## Step 3: Test Search

1. **Open browser:** http://localhost:5173/search

2. **Enter search query:** Type "computer" in search box

3. **Verify:**
   - API call in Network tab: `GET /api/v1/search?q=computer&type=all&page=1&page_size=50`
   - Results appear (institutions and programs)
   - Search time shown (e.g., "Search took 45ms")
   - No console errors

4. **Test filters:**
   - Click "Programs" tab → Only programs shown
   - Click "Institutions" tab → Only institutions shown
   - Select "Lagos" state → URL updates with `state=Lagos`
   - Results filtered to Lagos only

5. **Test error handling:**
   - Stop backend (Ctrl+C)
   - Try search → Error message appears
   - Start backend again → Search works

---

## Step 4: Verify API Directly

Test the search API with cURL:

```bash
# Basic search
curl "http://127.0.0.1:8001/api/v1/search?q=computer"

# Search with filters
curl "http://127.0.0.1:8001/api/v1/search?q=engineering&state=Lagos"

# Autocomplete
curl "http://127.0.0.1:8001/api/v1/search/autocomplete?q=comp&limit=5"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "institutions": [...],
    "programs": [...],
    "total_results": 42
  },
  "pagination": {...},
  "query": "computer",
  "search_time_ms": 45.2
}
```

---

## Troubleshooting

### Backend won't start
**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Fix:**
```bash
cd services/api
pip install -r requirements.txt
```

### Frontend shows "Backend not running"
**Fix:**
- Verify backend is at `http://127.0.0.1:8001`
- Check `apps/web/.env.local` has `VITE_API_URL=http://127.0.0.1:8001`

### No search results
**Check:**
1. Backend logs for errors
2. Meilisearch is running
3. Indexes are populated (run sync script)

### Type errors
**Fix:**
```bash
cd apps/web
pnpm typecheck
```

Most type errors are from type casting and are expected (safe).

---

## What to Look For

✅ **Working correctly:**
- Search query triggers API call
- Results display in cards
- Filters update URL
- Filters affect results
- Loading state shows
- Error state shows (when backend down)
- Empty state shows (when no results)
- Search time displays

❌ **Not working:**
- No API calls in Network tab → Check VITE_API_URL
- 404 errors → Check backend is running
- CORS errors → Backend should allow CORS
- Type errors → Some expected, check console

---

## Next Steps

After testing:
1. Review `PHASE5_INTEGRATION_REPORT.md` for detailed implementation
2. Test all 10 manual test cases from report
3. Fix any issues found
4. Consider implementing autocomplete UI (Phase 5.1)
5. Consider adding pagination (Phase 5.2)

---

**Questions?** Check the full report: `PHASE5_INTEGRATION_REPORT.md`
