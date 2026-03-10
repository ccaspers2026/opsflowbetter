/**
 * OpsFlow Sync — Shared localStorage ↔ Cloudflare KV sync helper
 * T-085: Centralized version number
 * T-086: Data backup to KV (eliminates HTML-as-data-backup)
 *
 * Usage (in any HTML page):
 *   <script src="../shared/opsflow-sync.js"></script>
 *   <script>
 *     // Auto-sets version in any element with class "version" or id "suite-version"
 *     OpsFlow.init();
 *
 *     // Or manually:
 *     OpsFlow.getVersion().then(v => console.log(v));
 *     OpsFlow.backupKey('opsflow_tasks');
 *     OpsFlow.restoreKey('opsflow_tasks');
 *   </script>
 */

var OpsFlow = (function () {
    'use strict';

    // ── Config ──
    var API_BASE = 'https://api.opsflowbetter.com';
    var SECRET_KEY = 'opsflow_upload_secret';   // localStorage key for the shared secret
    var VERSION_KV_KEY = 'opsflow_version';     // KV key that holds the suite version
    var SYNC_INTERVAL_MS = 5 * 60 * 1000;      // Auto-sync every 5 minutes (when enabled)

    // Keys we sync to KV as backups
    var SYNC_KEYS = [
        'opsflow_version',
        'opsflow_tasks',
        'opsflow_workshop',
        'opsflow_launchpad',
        'opsflow_feedback',
        'opsflow_migrations'
    ];

    // ── Internal helpers ──

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
        .catch(function (err) {
            console.warn('[OpsFlow] KV bulk write failed:', err.message);
            return { ok: false, error: err.message };
        });
    }

    // ── Public API ──

    /**
     * Get the suite version — tries localStorage first, falls back to KV
     */
    function getVersion() {
        var local = localStorage.getItem(VERSION_KV_KEY);
        if (local) return Promise.resolve(local);

        return kvRequest('GET', VERSION_KV_KEY).then(function (res) {
            if (res.ok && res.value) {
                localStorage.setItem(VERSION_KV_KEY, res.value);
                return res.value;
            }
            return '0.76.0'; // fallback default
        });
    }

    /**
     * Set the suite version in both localStorage and KV
     */
    function setVersion(version) {
        localStorage.setItem(VERSION_KV_KEY, version);
        return kvRequest('PUT', VERSION_KV_KEY, version);
    }

    /**
     * Backup a single localStorage key to KV
     */
    function backupKey(key) {
        var value = localStorage.getItem(key);
        if (value === null) return Promise.resolve({ ok: true, skipped: true });
        return kvRequest('PUT', key, value);
    }

    /**
     * Restore a single key from KV to localStorage
     */
    function restoreKey(key) {
        return kvRequest('GET', key).then(function (res) {
            if (res.ok && res.value !== null) {
                localStorage.setItem(key, res.value);
                return { ok: true, restored: true };
            }
            return { ok: true, restored: false };
        });
    }

    /**
     * Backup ALL sync keys to KV (bulk write)
     */
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

    /**
     * Restore ALL sync keys from KV to localStorage
     */
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

    /**
     * Check if KV is reachable (health check)
     */
    function checkHealth() {
        return fetch(API_BASE + '/health', {
            headers: { 'X-Upload-Secret': getSecret() }
        })
        .then(function (res) { return res.json(); })
        .catch(function () { return { status: 'unreachable' }; });
    }

    /**
     * Initialize — sets version display, starts auto-sync if secret is configured
     */
    function init(opts) {
        opts = opts || {};

        // Set version text in UI
        getVersion().then(function (version) {
            // Primary: update <span class="suite-ver"> elements (just the version number)
            var verSpans = document.querySelectorAll('.suite-ver');
            for (var i = 0; i < verSpans.length; i++) {
                verSpans[i].textContent = 'v' + version;
            }
            // Fallback: update #suite-version if present
            var el = document.getElementById('suite-version');
            if (el) el.textContent = 'v' + version;
        });

        // Auto-backup on page unload (if secret is set)
        if (getSecret()) {
            window.addEventListener('beforeunload', function () {
                // Use sendBeacon for reliability on page close
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
        init: init,
        getVersion: getVersion,
        setVersion: setVersion,
        backupKey: backupKey,
        restoreKey: restoreKey,
        backupAll: backupAll,
        restoreAll: restoreAll,
        checkHealth: checkHealth,
        API_BASE: API_BASE,
        SYNC_KEYS: SYNC_KEYS
    };

})();
