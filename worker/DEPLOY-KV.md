# Deploying KV Data Store (T-085/T-086)

## Prerequisites
- Node.js installed
- Wrangler CLI installed: `npm install -g wrangler`
- Logged in: `wrangler login`

## Step-by-Step

### 1. Create the KV Namespace
Open PowerShell, navigate to the worker folder:
```
cd C:\Users\ccasperslocal\Documents\_Claude\opsflowbetter\worker
wrangler kv namespace create OPSFLOW_DATA
```

This will output something like:
```
{ binding = "DATA", id = "abc123def456..." }
```

**Copy that `id` value.**

### 2. Update wrangler.toml
Open `wrangler.toml` and replace `REPLACE_WITH_KV_NAMESPACE_ID` with the actual ID from step 1.

### 3. Deploy the Updated Worker
```
wrangler deploy
```

This redeploys the existing `opsflowbetter-r2` worker with the new KV endpoints added. All existing R2/image endpoints are unchanged.

### 4. Test the KV Endpoints
```
# Health check (should show kv: "bound")
curl https://api.opsflowbetter.com/health

# Write a test value
curl -X PUT https://api.opsflowbetter.com/kv/test_key \
  -H "X-Upload-Secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '"hello world"'

# Read it back
curl https://api.opsflowbetter.com/kv/test_key \
  -H "X-Upload-Secret: YOUR_SECRET"

# List all keys
curl https://api.opsflowbetter.com/kv-list \
  -H "X-Upload-Secret: YOUR_SECRET"

# Clean up test key
curl -X DELETE https://api.opsflowbetter.com/kv/test_key \
  -H "X-Upload-Secret: YOUR_SECRET"
```

### 5. Set the Version in KV
```
curl -X PUT https://api.opsflowbetter.com/kv/opsflow_version \
  -H "X-Upload-Secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '"0.77.0"'
```

## New KV Endpoints Added

| Method | Path | Description |
|--------|------|-------------|
| GET | `/kv/:key` | Read a value |
| PUT | `/kv/:key` | Write a value (body = raw value) |
| DELETE | `/kv/:key` | Delete a key |
| GET | `/kv-list` | List all keys (diagnostic) |
| POST | `/kv-bulk` | Write multiple keys at once |

All endpoints require `X-Upload-Secret` header (same secret as image uploads).

## What Changed
- `r2-upload-worker.js` — Added KV endpoints alongside existing R2 endpoints
- `wrangler.toml` — Added KV namespace binding (`DATA`)
- New file: `shared/opsflow-sync.js` — Client-side helper for all pages

## Next Steps (after deploy)
1. Add `<script src="../shared/opsflow-sync.js"></script>` to all P2M pages
2. Set `localStorage.setItem('opsflow_upload_secret', 'YOUR_SECRET')` in browser console once
3. Call `OpsFlow.init()` on each page to enable auto-version + auto-backup
4. Eventually replace hardcoded version strings with dynamic `OpsFlow.getVersion()`
