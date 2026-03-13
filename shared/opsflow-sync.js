/**
 * OpsFlow Sync — Shared localStorage ↔ Cloudflare KV sync helper
 * T-085: Centralized version number
 * T-086: Data backup to KV (eliminates HTML-as-data-backup)
 * T-089: Generic cache layer — KV is source of truth, localStorage is cache
 *
 * Architecture (v0.82.0):
 *   Cloudflare KV  →  localStorage (cache)  →  page renders
 *   OpsFlow.get(key) checks cache freshness, falls back to KV
 *   OpsFlow.set(key, data) writes to BOTH localStorage + KV
 *
 * Usage (in any HTML page):
 *   <script src="../shared/opsflow-sync.js"></script>
 *   <script>
 *     OpsFlow.init();
 *
 *     // Async read (cache-first, KV fallback if stale):
 *     OpsFlow.get('opsflow_tasks').then(data => render(data));
 *
 *     // Sync read (localStorage only — fast, may be stale):
 *     var data = OpsFlow.getLocal('opsflow_tasks');
 *
 *     // Write (both localStorage + KV):
 *     OpsFlow.set('opsflow_tasks', data);
 *
 *     // Version helpers:
 *     OpsFlow.getVersion().then(v => console.log(v));
 *     OpsFlow.setVersion('0.82.0');
 *   </script>
 */

var OpsFlow = (function () {
    'use strict';

    // ── Config ──
    var API_BASE = 'https://api.opsflowbetter.com';
    var SECRET_KEY = 'opsflow_upload_secret';   // localStorage key for the shared secret
    var VERSION_KV_KEY = 'opsflow_version';     // KV key that holds the suite version
    var STALE_THRESHOLD_MS = 5 * 60 * 1000;    // 5 minutes — cache considered stale after this
    var SYNC_TS_PREFIX = '_sync_ts_';           // localStorage prefix for per-key sync timestamps

    // ALL keys we manage — superset of everything in the suite
    var SYNC_KEYS = [
        // Core
        'opsflow_version',
        'opsflow_tasks_v2',
        'opsflow_tasks_migrations',
        'opsflow_feedback',
        // Pages
        'workshopState_v2',
        'opsflow_launchpad',
        'opsflow_services',
        'opsflow_changelog',
        // Tester
        'opsflow_tester',
        'opsflow_tester_halt',
        'opsflow_tester_config',
        // Pipeline
        'p2m_pipeline_state',
        // Media
        'opsflow_media_queue',
        'opsflow_media_gallery',
        // Workflow
        'opsflow_workflow_state',
        'opsflow_workflow_cycles'
    ];

    // ── Internal helpers ──

    var SERVICES_KEY = 'opsflow_services';
    var KV_SERVICE_ID = 's4'; // Cloudflare service in Services page

    /**
     * Update the Cloudflare KV service LED on the Services page.
     * Called automatically on KV write success/failure.
     * Only touches the status field — preserves all other service data.
     */
    function updateKVServiceStatus(newStatus) {
        try {
            var raw = localStorage.getItem(SERVICES_KEY);
            if (!raw) return;
            var services = JSON.parse(raw);
            if (!Array.isArray(services)) return;
            for (var i = 0; i < services.length; i++) {
                if (services[i].id === KV_SERVICE_ID) {
                    if (services[i].status !== newStatus) {
                        services[i].status = newStatus;
                        localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
                        console.log('[OpsFlow] KV service status \u2192 ' + newStatus);
                    }
                    break;
                }
            }
        } catch (e) {
            // Silent — don't let service status updates break core functionality
        }
    }

    function getSecret() {
        return localStorage.getItem(SECRET_KEY) || '';
    }

    /**
     * Make an authenticated request to the Worker KV API
     */
    function kvRequest(method, key, body) {
        var opts = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-Upload-Secret': getSecret()
            }
        };
        if (body !== undefined) {
            opts.body = typeof body === 'string' ? body : JSON.stringify(body);
        }
        return fetch(API_BASE + '/kv/' + encodeURIComponent(key), opts)
            .then(function (res) { return res.json(); })
            .catch(function (err) {
                console.warn('[OpsFlow] KV request failed:', err.message);
                updateKVServiceStatus('red');
                return { ok: false, error: err.message };
            });
    }

    function kvBulk(entries) {
        return fetch(API_BASE + '/kv-bulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Upload-Secret': getSecret()
            },
            body: JSON.stringify({ entries: entries })
        })
        .then(function (res) { return res.json(); })
        .then(function (res) {
            if (!res.ok) {
                console.warn('[OpsFlow] KV bulk write failed:', res.error);
                updateKVServiceStatus('red');
            } else {
                updateKVServiceStatus('green');
            }
            return res;
        })
        .catch(function (err) {
            console.warn('[OpsFlow] KV bulk write failed:', err.message);
            updateKVServiceStatus('red');
            return { ok: false, error: err.message };
        });
    }

    function stripQuotes(s) {
        if (typeof s === 'string' && s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') {
            return s.slice(1, -1);
        }
        return s;
    }

    // ── Staleness tracking ──

    /**
     * Get the sync timestamp for a key (ms since epoch, or 0 if never synced)
     */
    function getSyncTimestamp(key) {
        var ts = localStorage.getItem(SYNC_TS_PREFIX + key);
        return ts ? parseInt(ts, 10) : 0;
    }

    /**
     * Mark a key as freshly synced (now)
     */
    function touchSyncTimestamp(key) {
        localStorage.setItem(SYNC_TS_PREFIX + key, String(Date.now()));
    }

    /**
     * Check if a key's cache is stale
     */
    function isStale(key) {
        var ts = getSyncTimestamp(key);
        if (ts === 0) return true; // never synced
        return (Date.now() - ts) > STALE_THRESHOLD_MS;
    }

    // ── Generic Cache API (T-089) ──

    /**
     * OpsFlow.get(key) — async, cache-first with KV fallback
     *
     * 1. Check localStorage — if present AND fresh, return immediately
     * 2. If stale or missing, fetch from KV
     * 3. If KV has data, update localStorage + timestamp, return
     * 4. If KV unreachable, return whatever localStorage has (graceful degradation)
     *
     * Returns: Promise<any> — parsed JSON if the value is JSON, raw string otherwise
     */
    function get(key) {
        var local = localStorage.getItem(key);

        // If we have local data and it's fresh, return it
        if (local !== null && !isStale(key)) {
            return Promise.resolve(parseIfJSON(local));
        }

        // If no secret configured, can't reach KV — return local (or null)
        if (!getSecret()) {
            return Promise.resolve(local !== null ? parseIfJSON(local) : null);
        }

        // Fetch from KV
        return kvRequest('GET', key).then(function (res) {
            if (res.ok && res.value !== undefined && res.value !== null) {
                var raw = typeof res.value === 'string' ? res.value : JSON.stringify(res.value);
                localStorage.setItem(key, raw);
                touchSyncTimestamp(key);
                return parseIfJSON(raw);
            }
            // KV didn't have it — return local as fallback
            touchSyncTimestamp(key); // mark synced so we don't hammer KV
            return local !== null ? parseIfJSON(local) : null;
        }).catch(function () {
            // KV unreachable — graceful degradation to localStorage
            return local !== null ? parseIfJSON(local) : null;
        });
    }

    /**
     * OpsFlow.getLocal(key) — synchronous localStorage-only read
     *
     * For hot paths that can't await (render loops, event handlers).
     * Returns parsed JSON if possible, raw string otherwise, or null.
     */
    function getLocal(key) {
        var raw = localStorage.getItem(key);
        if (raw === null) return null;
        return parseIfJSON(raw);
    }

    /**
     * OpsFlow.set(key, data) — write to both localStorage AND KV
     *
     * Returns: Promise with KV write result
     */
    function set(key, data) {
        var raw = typeof data === 'string' ? data : JSON.stringify(data);
        localStorage.setItem(key, raw);
        touchSyncTimestamp(key);

        // Fire-and-forget KV write if secret is configured
        if (getSecret()) {
            return kvRequest('PUT', key, raw).then(function (res) {
                if (!res.ok) {
                    console.warn('[OpsFlow] KV write failed for ' + key + ':', res.error);
                    updateKVServiceStatus('red');
                } else {
                    updateKVServiceStatus('green');
                }
                return res;
            });
        }
        return Promise.resolve({ ok: true, local_only: true });
    }

    /**
     * OpsFlow.remove(key) — remove from both localStorage and KV
     */
    function remove(key) {
        localStorage.removeItem(key);
        localStorage.removeItem(SYNC_TS_PREFIX + key);
        if (getSecret()) {
            return kvRequest('DELETE', key);
        }
        return Promise.resolve({ ok: true, local_only: true });
    }

    /**
     * Force-refresh a key from KV (bypass staleness check)
     */
    function refresh(key) {
        if (!getSecret()) return Promise.resolve(getLocal(key));
        return kvRequest('GET', key).then(function (res) {
            if (res.ok && res.value !== undefined && res.value !== null) {
                var raw = typeof res.value === 'string' ? res.value : JSON.stringify(res.value);
                localStorage.setItem(key, raw);
                touchSyncTimestamp(key);
                return parseIfJSON(raw);
            }
            return getLocal(key);
        });
    }

    /**
     * Invalidate a key's cache (forces next get() to fetch from KV)
     */
    function invalidate(key) {
        localStorage.removeItem(SYNC_TS_PREFIX + key);
    }

    // ── JSON helper ──

    function parseIfJSON(raw) {
        if (typeof raw !== 'string') return raw;
        var trimmed = raw.trim();
        if ((trimmed[0] === '{' && trimmed[trimmed.length - 1] === '}') ||
            (trimmed[0] === '[' && trimmed[trimmed.length - 1] === ']')) {
            try { return JSON.parse(trimmed); } catch (e) { /* not JSON */ }
        }
        return raw;
    }

    // ── Version helpers (convenience wrappers) ──

    function getVersion() {
        var local = localStorage.getItem(VERSION_KV_KEY);
        if (local) return Promise.resolve(stripQuotes(local));

        return kvRequest('GET', VERSION_KV_KEY).then(function (res) {
            if (res.ok && res.value) {
                var clean = stripQuotes(res.value);
                localStorage.setItem(VERSION_KV_KEY, clean);
                touchSyncTimestamp(VERSION_KV_KEY);
                return clean;
            }
            return '0.82.0'; // fallback default
        });
    }

    function setVersion(version) {
        localStorage.setItem(VERSION_KV_KEY, version);
        touchSyncTimestamp(VERSION_KV_KEY);
        return kvRequest('PUT', VERSION_KV_KEY, version).then(function (res) {
            if (!res.ok) {
                updateKVServiceStatus('red');
            } else {
                updateKVServiceStatus('green');
            }
            return res;
        });
    }

    // ── Legacy backup/restore (kept for backward compat) ──

    function backupKey(key) {
        var value = localStorage.getItem(key);
        if (value === null) return Promise.resolve({ ok: true, skipped: true });
        return kvRequest('PUT', key, value);
    }

    function restoreKey(key) {
        return kvRequest('GET', key).then(function (res) {
            if (res.ok && res.value !== null) {
                localStorage.setItem(key, res.value);
                touchSyncTimestamp(key);
                return { ok: true, restored: true };
            }
            return { ok: true, restored: false };
        });
    }

    function backupAll() {
        var entries = {};
        var count = 0;
        for (var i = 0; i < SYNC_KEYS.length; i++) {
            var val = localStorage.getItem(SYNC_KEYS[i]);
            if (val !== null) {
                entries[SYNC_KEYS[i]] = val;
                count++;
            }
        }
        if (count === 0) return Promise.resolve({ ok: true, written: 0 });
        console.log('[OpsFlow] Backing up ' + count + ' keys to KV');
        return kvBulk(entries);
    }

    function restoreAll() {
        var promises = SYNC_KEYS.map(function (key) {
            return restoreKey(key);
        });
        return Promise.all(promises).then(function (results) {
            var restored = results.filter(function (r) { return r.restored; }).length;
            console.log('[OpsFlow] Restored ' + restored + ' keys from KV');
            return { ok: true, restored: restored };
        });
    }

    function checkHealth() {
        return fetch(API_BASE + '/health', {
            headers: { 'X-Upload-Secret': getSecret() }
        })
        .then(function (res) { return res.json(); })
        .catch(function () { return { status: 'unreachable' }; });
    }

    // ── Init ──

    function init(opts) {
        opts = opts || {};

        // Set version text in UI
        getVersion().then(function (version) {
            var cleanVer = version.replace(/^v/, '');
            var verSpans = document.querySelectorAll('.suite-ver');
            for (var i = 0; i < verSpans.length; i++) {
                verSpans[i].textContent = 'v' + cleanVer;
            }
            var el = document.getElementById('suite-version');
            if (el) el.textContent = 'v' + cleanVer;
        });

        // Auto-backup on page unload (if secret is set)
        if (getSecret()) {
            window.addEventListener('beforeunload', function () {
                var entries = {};
                for (var i = 0; i < SYNC_KEYS.length; i++) {
                    var val = localStorage.getItem(SYNC_KEYS[i]);
                    if (val !== null) entries[SYNC_KEYS[i]] = val;
                }
                if (Object.keys(entries).length > 0) {
                    var blob = new Blob([JSON.stringify({ entries: entries })], { type: 'application/json' });
                    navigator.sendBeacon(API_BASE + '/kv-bulk?secret=' + encodeURIComponent(getSecret()), blob);
                }
            });
        }

        // Auto-restore if localStorage looks empty (recovery mode)
        if (opts.autoRestore !== false && getSecret()) {
            var hasData = false;
            for (var i = 0; i < SYNC_KEYS.length; i++) {
                if (localStorage.getItem(SYNC_KEYS[i]) !== null) {
                    hasData = true;
                    break;
                }
            }
            if (!hasData) {
                console.log('[OpsFlow] localStorage empty — attempting KV restore');
                restoreAll();
            }
        }
    }

    // ── Expose public API ──
    return {
        // v0.82.0 — Generic cache layer
        get: get,
        getLocal: getLocal,
        set: set,
        remove: remove,
        refresh: refresh,
        invalidate: invalidate,
        isStale: isStale,
        parseIfJSON: parseIfJSON,

        // Version helpers
        init: init,
        getVersion: getVersion,
        setVersion: setVersion,

        // Legacy backup/restore (backward compat)
        backupKey: backupKey,
        restoreKey: restoreKey,
        backupAll: backupAll,
        restoreAll: restoreAll,
        checkHealth: checkHealth,

        // Config (exposed for debugging)
        API_BASE: API_BASE,
        SYNC_KEYS: SYNC_KEYS,
        STALE_THRESHOLD_MS: STALE_THRESHOLD_MS
    };

})();
