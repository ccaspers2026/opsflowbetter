// OpsFlowBetter R2 Upload Worker
// Deploy to Cloudflare Workers with R2 binding named "IMAGES"
// Set environment variable: UPLOAD_SECRET = (your chosen password)
// Route: api.opsflowbetter.com/*

export default {
  async fetch(request, env) {
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Secret',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // PUT /upload/:path — upload (or overwrite) an image
    if (request.method === 'PUT' && url.pathname.startsWith('/upload/')) {
      // Auth check
      const secret = request.headers.get('X-Upload-Secret');
      if (!secret || secret !== env.UPLOAD_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Extract object key from path (e.g., /upload/45-rpm-adaptor/main.jpg → 45-rpm-adaptor/main.jpg)
      const key = url.pathname.replace('/upload/', '');
      if (!key || key.includes('..')) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Read the image body
      const imageData = await request.arrayBuffer();
      const contentType = request.headers.get('Content-Type') || 'image/jpeg';

      // PUT to R2 — automatically overwrites if key already exists
      await env.IMAGES.put(key, imageData, {
        httpMetadata: { contentType },
      });

      const publicUrl = `https://images.opsflowbetter.com/${key}`;

      return new Response(JSON.stringify({ ok: true, url: publicUrl, key }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /health — simple health check
    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'opsflowbetter-r2' }), {
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
