/**
 * Cloudflare Pages Function: GET /api/data/catalog
 * Returns the platinum data catalog with specialty counts and pricing.
 * Public endpoint — no auth required.
 */
export async function onRequestGet(context) {
  const { env } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=3600',
  };

  try {
    const obj = await env.DATA_BUCKET.get('catalog.json');
    if (!obj) {
      return new Response(JSON.stringify({ ok: false, error: 'Catalog not found.' }), {
        status: 404, headers,
      });
    }
    const catalog = await obj.text();
    return new Response(catalog, { status: 200, headers });
  } catch (err) {
    console.error('Catalog handler error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Server error.' }), {
      status: 500, headers,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
