/**
 * Cloudflare Pages Function: GET /api/data/pull
 * API-key-gated access to pairs by vertical/specialty with pagination.
 * Auth: Authorization: Bearer sk_swarm_xxxx
 * Params: ?vertical=medical&specialty=surgery&tier=platinum&limit=100&offset=0
 *
 * R2 layout per bucket: {tier}/{specialty}.jsonl
 *
 * R2 Buckets:
 *   MEDICAL_BUCKET  → sb-medical
 *   AVIATION_BUCKET → sb-aviation
 *   CRE_BUCKET      → sb-cre
 *   CORE_BUCKET     → sb-core
 *   OPS_BUCKET      → swarm-ops (API keys)
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
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  // --- Auth ---
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return new Response(JSON.stringify({
      ok: false, error: 'Missing API key. Include Authorization: Bearer sk_swarm_xxx header.',
    }), { status: 401, headers });
  }

  const validKeys = (env.API_KEYS || '').split(',').map(function(k) { return k.trim(); }).filter(Boolean);
  let keyValid = validKeys.includes(token);

  let keyRecord = null;
  let keysData = null;
  let opsBucket = null;

  if (!keyValid) {
    try {
      opsBucket = env.OPS_BUCKET || env.DATA_BUCKET;
      const keysObj = await opsBucket.get('keys/api-keys.json');
      if (keysObj) {
        keysData = JSON.parse(await keysObj.text());
        keyRecord = keysData.keys.find(function(k) { return k.key === token; });
        keyValid = !!keyRecord;
      }
    } catch (_) {}
  }

  if (!keyValid) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid API key.' }), {
      status: 403, headers,
    });
  }

  // Quota enforcement (only for R2-stored keys with quota field)
  if (keyRecord) {
    if (keyRecord.status === 'cancelled') {
      return new Response(JSON.stringify({ ok: false, error: 'API key cancelled.' }), {
        status: 403, headers,
      });
    }
    if (keyRecord.quota && keyRecord.pairs_pulled >= keyRecord.quota) {
      return new Response(JSON.stringify({
        ok: false, error: 'Quota exhausted.',
        quota: keyRecord.quota, used: keyRecord.pairs_pulled,
      }), { status: 403, headers });
    }
  }

  // --- Params ---
  const vertical = (url.searchParams.get('vertical') || url.searchParams.get('vault') || 'medical').toLowerCase();
  const specialty = url.searchParams.get('specialty');
  const tier = (url.searchParams.get('tier') || 'platinum').toLowerCase();
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 1), 1000);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  if (!VALID_VERTICALS.includes(vertical)) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Invalid vertical. Use: ' + VALID_VERTICALS.join(', '),
      available_verticals: VALID_VERTICALS,
    }), { status: 400, headers });
  }

  if (!specialty) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'specialty parameter required. Use /api/data/catalog?vertical=' + vertical + ' to list available specialties.',
    }), { status: 400, headers });
  }

  try {
    const bucket = getBucket(env, vertical);
    if (!bucket) {
      return new Response(JSON.stringify({
        ok: false, error: 'Vertical not configured: ' + vertical,
      }), { status: 500, headers });
    }

    // R2 key: {tier}/{specialty}.jsonl (within vertical's own bucket)
    const r2Key = tier + '/' + specialty + '.jsonl';
    const chunkObj = await bucket.get(r2Key);

    if (!chunkObj) {
      // Try legacy layout for backward compat: {vertical}/{tier}/{specialty}.jsonl in DATA_BUCKET
      let legacyObj = null;
      if (env.DATA_BUCKET) {
        const legacyKey = vertical + '/' + tier + '/' + specialty + '.jsonl';
        legacyObj = await env.DATA_BUCKET.get(legacyKey);
      }

      if (!legacyObj) {
        // Load catalog to suggest valid specialties
        let available = [];
        try {
          const catObj = await bucket.get('catalog.json');
          if (catObj) {
            const catalog = JSON.parse(await catObj.text());
            if (catalog.tiers && catalog.tiers[tier]) {
              available = catalog.tiers[tier].specialties.map(function(s) { return s.specialty; });
            }
          }
        } catch (_) {}

        return new Response(JSON.stringify({
          ok: false,
          error: 'Specialty not found: ' + specialty,
          vertical: vertical, tier: tier,
          available: available.length > 0 ? available : undefined,
        }), { status: 404, headers });
      }

      // Use legacy object
      return servePairs(legacyObj, vertical, tier, specialty, offset, limit, headers, env, request, token, keyRecord, keysData, opsBucket);
    }

    return servePairs(chunkObj, vertical, tier, specialty, offset, limit, headers, env, request, token, keyRecord, keysData, opsBucket);
  } catch (err) {
    console.error('Pull handler error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Server error.' }), {
      status: 500, headers,
    });
  }
}

async function servePairs(chunkObj, vertical, tier, specialty, offset, limit, headers, env, request, token, keyRecord, keysData, opsBucketRef) {
  const text = await chunkObj.text();
  const lines = text.trim().split('\n');
  const total = lines.length;

  // Clamp limit to remaining quota if applicable
  var effectiveLimit = limit;
  if (keyRecord && keyRecord.quota) {
    var remaining = keyRecord.quota - (keyRecord.pairs_pulled || 0);
    effectiveLimit = Math.min(limit, remaining);
    if (effectiveLimit <= 0) {
      return new Response(JSON.stringify({
        ok: false, error: 'Quota exhausted.',
        quota: keyRecord.quota, used: keyRecord.pairs_pulled,
      }), { status: 403, headers: headers });
    }
  }

  if (offset >= total) {
    return new Response(JSON.stringify({
      ok: true, pairs: [], count: 0, total: total, offset: offset, limit: effectiveLimit, has_more: false,
    }), { status: 200, headers });
  }

  const pairs = lines.slice(offset, offset + effectiveLimit).map(function(line) {
    var d = JSON.parse(line);
    return {
      question: d.question,
      answer: d.answer,
      specialty: d.specialty,
      fingerprint: d.fingerprint,
      tier: d.tier || tier,
      vertical: vertical,
    };
  });

  const has_more = (offset + pairs.length) < total;

  // Track usage for quota-bearing keys
  if (keyRecord && keysData && opsBucketRef && pairs.length > 0) {
    keyRecord.pairs_pulled = (keyRecord.pairs_pulled || 0) + pairs.length;
    keyRecord.last_pull_at = new Date().toISOString();
    opsBucketRef.put('keys/api-keys.json', JSON.stringify(keysData, null, 2)).catch(function() {});
  }

  // Log to Discord (fire-and-forget)
  logPull(env, request, token, vertical, tier, specialty, offset, effectiveLimit, pairs.length).catch(function() {});

  var responseBody = {
    ok: true,
    vertical: vertical, tier: tier, specialty: specialty,
    total: total,
    offset: offset, limit: effectiveLimit,
    count: pairs.length,
    has_more: has_more,
    pairs: pairs,
  };

  // Add quota info if applicable
  if (keyRecord && keyRecord.quota) {
    responseBody.quota = keyRecord.quota;
    responseBody.used = keyRecord.pairs_pulled;
    responseBody.remaining = keyRecord.quota - keyRecord.pairs_pulled;
  }

  return new Response(JSON.stringify(responseBody), { status: 200, headers });
}

async function logPull(env, request, token, vertical, tier, specialty, offset, limit, returned) {
  const discordUrl = env.DISCORD_DATA_WEBHOOK_URL;
  if (!discordUrl) return;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const keyPrefix = token.slice(0, 12) + '...';
  await fetch(discordUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: 'Data API — Pull Request',
        color: 0xB89B3C,
        fields: [
          { name: 'API Key', value: keyPrefix, inline: true },
          { name: 'Vertical', value: vertical + '/' + tier, inline: true },
          { name: 'Specialty', value: specialty, inline: true },
          { name: 'Offset/Limit', value: offset + '/' + limit, inline: true },
          { name: 'Returned', value: String(returned), inline: true },
          { name: 'IP', value: ip, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'swarmandbee.com/api/data/pull' },
      }],
    }),
  });
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
