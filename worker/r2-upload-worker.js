// OpsFlowBetter Worker — R2 Images + KV Data Store
// Deploy to Cloudflare Workers with R2 binding "IMAGES" and KV binding "DATA"
// Secrets: UPLOAD_SECRET, REMOVEBG_API_KEY
// Route: api.opsflowbetter.com/*

export default {
  async fetch(request, env) {
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Secret',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // ═══════════════════════════════════════════════════════════════════
    //  KV DATA STORE ENDPOINTS — T-085/T-086
    //  Mirrors localStorage key-value pairs to Cloudflare KV
    // ═══════════════════════════════════════════════════════════════════

    // ── GET /kv/:key — read a value from KV ──────────────────────────
    if (request.method === 'GET' && url.pathname.startsWith('/kv/')) {
      const secret = request.headers.get('X-Upload-Secret');
      if (!secret || secret !== env.UPLOAD_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const key = url.pathname.replace('/kv/', '');
      if (!key) {
        return new Response(JSON.stringify({ error: 'Missing key' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const value = await env.DATA.get(key);
        if (value === null) {
          return new Response(JSON.stringify({ ok: true, key, value: null }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ ok: true, key, value }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'KV read failed: ' + err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── PUT /kv/:key — write a value to KV ───────────────────────────
    if (request.method === 'PUT' && url.pathname.startsWith('/kv/')) {
      const secret = request.headers.get('X-Upload-Secret');
      if (!secret || secret !== env.UPLOAD_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const key = url.pathname.replace('/kv/', '');
      if (!key) {
        return new Response(JSON.stringify({ error: 'Missing key' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const body = await request.text();
        await env.DATA.put(key, body);
        return new Response(JSON.stringify({ ok: true, key }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'KV write failed: ' + err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── DELETE /kv/:key — remove a value from KV ─────────────────────
    if (request.method === 'DELETE' && url.pathname.startsWith('/kv/')) {
      const secret = request.headers.get('X-Upload-Secret');
      if (!secret || secret !== env.UPLOAD_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const key = url.pathname.replace('/kv/', '');
      if (!key) {
        return new Response(JSON.stringify({ error: 'Missing key' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        await env.DATA.delete(key);
        return new Response(JSON.stringify({ ok: true, key, deleted: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'KV delete failed: ' + err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── GET /kv-list — list all keys in KV (for diagnostics) ─────────
    if (request.method === 'GET' && url.pathname === '/kv-list') {
      const secret = request.headers.get('X-Upload-Secret');
      if (!secret || secret !== env.UPLOAD_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const list = await env.DATA.list();
        const keys = list.keys.map(k => k.name);
        return new Response(JSON.stringify({ ok: true, keys }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'KV list failed: ' + err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── POST /kv-bulk — write multiple keys at once ──────────────────
    // Body: { "entries": { "key1": "value1", "key2": "value2" } }
    if (request.method === 'POST' && url.pathname === '/kv-bulk') {
      const secret = request.headers.get('X-Upload-Secret');
      if (!secret || secret !== env.UPLOAD_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const body = await request.json();
        if (!body.entries || typeof body.entries !== 'object') {
          return new Response(JSON.stringify({ error: 'Missing entries object' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const keys = Object.keys(body.entries);
        const promises = keys.map(k => env.DATA.put(k, body.entries[k]));
        await Promise.all(promises);

        return new Response(JSON.stringify({ ok: true, written: keys.length, keys }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'KV bulk write failed: ' + err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  R2 IMAGE ENDPOINTS (existing)
    // ═══════════════════════════════════════════════════════════════════

    // ── PUT /upload/:path — upload (or overwrite) a file to R2 ──────────
    if (request.method === 'PUT' && url.pathname.startsWith('/upload/')) {
      const secret = request.headers.get('X-Upload-Secret');
      if (!secret || secret !== env.UPLOAD_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const key = url.pathname.replace('/upload/', '');
      if (!key || key.includes('..')) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const imageData = await request.arrayBuffer();
      const contentType = request.headers.get('Content-Type') || 'image/jpeg';

      await env.IMAGES.put(key, imageData, {
        httpMetadata: {
          contentType,
          cacheControl: 'public, max-age=60, s-maxage=60',
        },
      });

      const publicUrl = `https://images.opsflowbetter.com/${key}`;

      return new Response(JSON.stringify({ ok: true, url: publicUrl, key }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── POST /remove-bg — remove background via remove.bg API ───────────
    if (request.method === 'POST' && url.pathname === '/remove-bg') {
      const secret = request.headers.get('X-Upload-Secret');
      if (!secret || secret !== env.UPLOAD_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!env.REMOVEBG_API_KEY) {
        return new Response(JSON.stringify({ error: 'REMOVEBG_API_KEY not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { r2Key } = body;
      if (!r2Key) {
        return new Response(JSON.stringify({ error: 'Missing r2Key' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const r2Object = await env.IMAGES.get(r2Key);
        if (!r2Object) {
          return new Response(JSON.stringify({ error: 'Image not found in R2', key: r2Key }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const rawImageData = await r2Object.arrayBuffer();

        const formData = new FormData();
        formData.append('image_file', new Blob([rawImageData], { type: 'image/jpeg' }), 'image.jpg');
        formData.append('size', 'auto');
        formData.append('type', 'product');
        formData.append('bg_color', 'FFFFFF');
        formData.append('format', 'jpg');
        formData.append('crop', 'true');
        formData.append('crop_margin', '0');

        const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': env.REMOVEBG_API_KEY,
          },
          body: formData,
        });

        if (!removeBgResponse.ok) {
          const errText = await removeBgResponse.text();
          let errMsg = `remove.bg API error (${removeBgResponse.status})`;
          try {
            const errJson = JSON.parse(errText);
            if (errJson.errors) errMsg = errJson.errors.map(e => e.title).join('; ');
          } catch {}
          return new Response(JSON.stringify({ error: errMsg }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const cleanImageData = await removeBgResponse.arrayBuffer();

        await env.IMAGES.put(r2Key, cleanImageData, {
          httpMetadata: {
            contentType: 'image/jpeg',
            cacheControl: 'public, max-age=60, s-maxage=60',
          },
        });

        const publicUrl = `https://images.opsflowbetter.com/${r2Key}`;
        const cleanSizeKB = Math.round(cleanImageData.byteLength / 1024);
        const rawSizeKB = Math.round(rawImageData.byteLength / 1024);

        return new Response(JSON.stringify({
          ok: true,
          url: publicUrl,
          key: r2Key,
          rawSizeKB,
          cleanSizeKB,
          message: 'Background removed and uploaded',
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: 'Processing failed: ' + err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── GET /credits — check remove.bg account balance ──────────────────
    if (request.method === 'GET' && url.pathname === '/credits') {
      const secret = request.headers.get('X-Upload-Secret');
      if (!secret || secret !== env.UPLOAD_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!env.REMOVEBG_API_KEY) {
        return new Response(JSON.stringify({ error: 'REMOVEBG_API_KEY not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const resp = await fetch('https://api.remove.bg/v1.0/account', {
          headers: { 'X-Api-Key': env.REMOVEBG_API_KEY },
        });
        const data = await resp.json();
        return new Response(JSON.stringify({
          ok: true,
          credits: data.data?.attributes?.credits?.total || 0,
          freeCredits: data.data?.attributes?.credits?.subscription || 0,
          paygCredits: data.data?.attributes?.credits?.payg || 0,
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to check credits: ' + err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── GET /health — simple health check ───────────────────────────────
    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'opsflowbetter-r2',
        kv: env.DATA ? 'bound' : 'not-bound',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
