/**
 * Cloudflare Pages Function: GET /api/data/count
 * Returns live pair counts from ledger (R2) or hardcoded fallback.
 * Public endpoint — no auth required. Cached 5 minutes.
 *
 * R2 object: count.json — updated by grinders/scripts
 * Format: { "platinum": N, "gold": N, "aviation": N, "cre": N, "total": N, "updated": "ISO" }
 */
export async function onRequestGet(context) {
  const { env } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300',
  };

  // Hardcoded floor — never show less than this
  const FALLBACK = {
    platinum: 406181,
    gold: 385626,
    aviation: 9000,
    cre: 3000,
    router: 14760,
    brain: 1405,
    total: 851507,
    source: 'fallback',
    updated: '2026-02-23T00:00:00Z',
  };

  try {
    const obj = await env.DATA_BUCKET.get('count.json');
    if (obj) {
      const data = JSON.parse(await obj.text());
      data.source = 'ledger';
      // Never return less than fallback
      if (data.total && data.total >= FALLBACK.total) {
        return new Response(JSON.stringify(data), { status: 200, headers });
      }
    }
  } catch (err) {
    console.error('Count ledger read error:', err);
  }

  return new Response(JSON.stringify(FALLBACK), { status: 200, headers });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
