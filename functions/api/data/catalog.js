/**
 * Cloudflare Pages Function: GET /api/data/catalog
 * Returns the data catalog with specialty counts and pricing.
 * Supports ?vertical=medical|aviation|cre|core (default: medical)
 * Public endpoint — no auth required.
 *
 * R2 Buckets (bound in CF Pages dashboard):
 *   MEDICAL_BUCKET  → sb-medical
 *   AVIATION_BUCKET → sb-aviation
 *   CRE_BUCKET      → sb-cre
 *   CORE_BUCKET     → sb-core
 *   DATA_BUCKET     → swarm-data-vault (legacy fallback)
 */

function getBucket(env, vertical) {
  const map = {
    medical:  env.MEDICAL_BUCKET,
    aviation: env.AVIATION_BUCKET,
    cre:      env.CRE_BUCKET,
    core:     env.CORE_BUCKET,
  };
  return map[vertical] || env.MEDICAL_BUCKET || env.DATA_BUCKET;
}

const VALID_VERTICALS = ['medical', 'aviation', 'cre', 'core'];

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const vertical = (url.searchParams.get('vertical') || 'medical').toLowerCase();
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=3600',
  };

  if (!VALID_VERTICALS.includes(vertical)) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Invalid vertical. Use: ' + VALID_VERTICALS.join(', '),
      available_verticals: VALID_VERTICALS,
    }), { status: 400, headers });
  }

  try {
    const bucket = getBucket(env, vertical);
    if (!bucket) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Vertical not configured: ' + vertical,
      }), { status: 500, headers });
    }

    const obj = await bucket.get('catalog.json');
    if (!obj) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Catalog not found for vertical: ' + vertical,
        vertical: vertical,
      }), { status: 404, headers });
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
