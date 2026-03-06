/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT */
/*
 * Cross-Origin Isolation Service Worker
 * Enables SharedArrayBuffer on hosts like GitHub Pages that don't allow custom headers.
 * Required for @imgly/background-removal WASM engine.
 */
if (typeof window === 'undefined') {
    // Service Worker context
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
    self.addEventListener("fetch", function (e) {
        if (e.request.cache === "only-if-cached" && e.request.mode !== "same-origin") return;
        e.respondWith(
            fetch(e.request).then(function (r) {
                if (r.status === 0) return r;
                const headers = new Headers(r.headers);
                headers.set("Cross-Origin-Embedder-Policy", "credentialless");
                headers.set("Cross-Origin-Opener-Policy", "same-origin");
                return new Response(r.body, { status: r.status, statusText: r.statusText, headers });
            }).catch((e) => console.error(e))
        );
    });
} else {
    // Window context — register the service worker
    (async function () {
        if (window.crossOriginIsolated !== false) return;

        const registration = await navigator.serviceWorker.register(window.document.currentScript.src).catch((e) => {
            console.log("COOP/COEP Service Worker failed to register:", e);
        });
        if (registration) {
            console.log("COOP/COEP Service Worker registered. Reloading page to enable cross-origin isolation.");
            window.sessionStorage.setItem("coiReloading", "true");
            window.location.reload();
        }
    })();

    // After reload, confirm isolation is active
    if (window.sessionStorage.getItem("coiReloading")) {
        window.sessionStorage.removeItem("coiReloading");
        console.log("Cross-origin isolation active:", window.crossOriginIsolated);
    }
}
