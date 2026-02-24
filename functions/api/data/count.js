/**
 * Cloudflare Pages Function: GET /api/data/count
 * Returns live pair counts. Supports ?vertical= for per-vertical counts.
 * No vertical param = aggregate across all verticals.
 * Public endpoint — no auth required. Cached 5 minutes.
 *
 * R2 Buckets:
 *   MEDICAL_BUCKET  → sb-medical   (count.json)
 *   AVIATION_BUCKET → sb-aviation  (count.json)
 *   CRE_BUCKET      → sb-cre       (count.json)
 *   CORE_BUCKET     → sb-core      (count.json)
 *   DATA_BUCKET     → swarm-data-vault (legacy master count.json)
 */

const BUCKET_MAP = {
  medical:  'MEDICAL_BUCKET',
  aviation: 'AVIATION_BUCKET',
  cre:      'CRE_BUCKET',
  core:     'CORE_BUCKET',
};

const VALID_VERTICALS = ['medical', 'aviation', 'cre', 'core'];

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const vertical = url.searchParams.get('vertical');
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300',
  };

  try {
    // Single vertical count
    if (vertical) {
      const v = vertical.toLowerCase();
      if (!VALID_VERTICALS.includes(v)) {
        return new Response(JSON.stringify({
          ok: false,
          error: 'Invalid vertical. Use: ' + VALID_VERTICALS.join(', '),
        }), { status: 400, headers });
      }

      const bucket = env[BUCKET_MAP[v]];
      if (bucket) {
        const obj = await bucket.get('count.json');
        if (obj) {
          const data = JSON.parse(await obj.text());
          data.source = 'vault';
          return new Response(JSON.stringify(data), { status: 200, headers });
        }
      }

      return new Response(JSON.stringify({
        vertical: v, total: 0, source: 'empty',
        updated: new Date().toISOString(),
      }), { status: 200, headers });
    }

    // Aggregate: try master count from legacy bucket first
    if (env.DATA_BUCKET) {
      const obj = await env.DATA_BUCKET.get('count.json');
      if (obj) {
        const data = JSON.parse(await obj.text());
        data.source = 'ledger';
        if (data.total && data.total > 0) {
          return new Response(JSON.stringify(data), { status: 200, headers });
        }
      }
    }

    // Build aggregate from individual vertical buckets
    const aggregate = {
      verticals: {},
      total: 0,
      platinum: 0,
      gold: 0,
      source: 'multi-vault',
      updated: new Date().toISOString(),
    };

    for (const vname of VALID_VERTICALS) {
      const bucket = env[BUCKET_MAP[vname]];
      if (!bucket) continue;
      try {
        const obj = await bucket.get('count.json');
        if (obj) {
          const data = JSON.parse(await obj.text());
          aggregate.verticals[vname] = data;
          aggregate.total += data.total || 0;
          aggregate.platinum += data.platinum || 0;
          aggregate.gold += data.gold || 0;
        }
      } catch (_) {}
    }

    if (aggregate.total > 0) {
      return new Response(JSON.stringify(aggregate), { status: 200, headers });
    }
  } catch (err) {
    console.error('Count handler error:', err);
  }

  // Fallback
  return new Response(JSON.stringify({
    platinum: 406181,
    gold: 19792,
    aviation: 13776,
    cre: 2611,
    core: 23361,
    total: 465721,
    source: 'fallback',
    updated: '2026-02-24T12:00:00Z',
  }), { status: 200, headers });
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
