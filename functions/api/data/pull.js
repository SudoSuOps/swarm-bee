/**
 * Cloudflare Pages Function: GET /api/data/pull
 * API-key-gated access to platinum pairs by specialty with pagination.
 * Auth: Authorization: Bearer sk_swarm_xxxx
 * Params: ?specialty=surgery&limit=100&offset=0
 */
const CHUNK_SIZE = 50000;

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
    return new Response(JSON.stringify({ ok: false, error: 'Missing API key. Include Authorization: Bearer sk_swarm_xxx header.' }), {
      status: 401, headers,
    });
  }
  // Check env var keys (manual/admin keys)
  const validKeys = (env.API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
  let keyValid = validKeys.includes(token);
  // Check R2-stored keys (Stripe-issued)
  if (!keyValid) {
    try {
      const keysObj = await env.DATA_BUCKET.get('platinum/keys.json');
      if (keysObj) {
        const keysData = JSON.parse(await keysObj.text());
        keyValid = keysData.keys.some(function(k) { return k.key === token; });
      }
    } catch (_) {}
  }
  if (!keyValid) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid API key.' }), {
      status: 403, headers,
    });
  }

  // --- Params ---
  const specialty = url.searchParams.get('specialty');
  if (!specialty) {
    return new Response(JSON.stringify({ ok: false, error: 'specialty parameter required. Use /api/data/catalog to list available specialties.' }), {
      status: 400, headers,
    });
  }

  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 1), 1000);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  try {
    // Load catalog to validate specialty
    const catObj = await env.DATA_BUCKET.get('platinum/catalog.json');
    if (!catObj) {
      return new Response(JSON.stringify({ ok: false, error: 'Catalog unavailable.' }), {
        status: 500, headers,
      });
    }
    const catalog = JSON.parse(await catObj.text());
    const specInfo = catalog.specialties[specialty];
    if (!specInfo) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Unknown specialty: ' + specialty,
        available: Object.keys(catalog.specialties).sort(),
      }), { status: 400, headers });
    }

    if (offset >= specInfo.pair_count) {
      return new Response(JSON.stringify({
        ok: true, pairs: [], count: 0, total: specInfo.pair_count,
        offset, limit, has_more: false,
      }), { status: 200, headers });
    }

    // Determine chunk to read
    const startChunk = Math.floor(offset / CHUNK_SIZE);
    const withinChunkOffset = offset % CHUNK_SIZE;

    const chunkKey = 'platinum/' + specialty + '/chunk-' + startChunk + '.jsonl';
    const chunkObj = await env.DATA_BUCKET.get(chunkKey);
    if (!chunkObj) {
      return new Response(JSON.stringify({ ok: false, error: 'Data chunk not found.' }), {
        status: 404, headers,
      });
    }

    const text = await chunkObj.text();
    const lines = text.trim().split('\n');
    let pairs = lines.slice(withinChunkOffset, withinChunkOffset + limit)
      .map(line => {
        const d = JSON.parse(line);
        return {
          question: d.question,
          answer: d.answer,
          specialty: d.specialty,
          fingerprint: d.fingerprint,
          tier: d.tier || 'platinum',
        };
      });

    // Cross-chunk boundary
    const remaining = limit - pairs.length;
    if (remaining > 0 && (startChunk + 1) * CHUNK_SIZE < specInfo.pair_count) {
      const nextKey = 'platinum/' + specialty + '/chunk-' + (startChunk + 1) + '.jsonl';
      const nextObj = await env.DATA_BUCKET.get(nextKey);
      if (nextObj) {
        const nextText = await nextObj.text();
        const nextLines = nextText.trim().split('\n');
        const morePairs = nextLines.slice(0, remaining).map(l => {
          const d = JSON.parse(l);
          return {
            question: d.question,
            answer: d.answer,
            specialty: d.specialty,
            fingerprint: d.fingerprint,
            tier: d.tier || 'platinum',
          };
        });
        pairs = pairs.concat(morePairs);
      }
    }

    const has_more = (offset + pairs.length) < specInfo.pair_count;

    // Log to Discord (fire-and-forget)
    logPull(env, request, token, specialty, offset, limit, pairs.length).catch(() => {});

    return new Response(JSON.stringify({
      ok: true,
      specialty,
      total: specInfo.pair_count,
      offset,
      limit,
      count: pairs.length,
      has_more,
      pairs,
    }), { status: 200, headers });

  } catch (err) {
    console.error('Pull handler error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Server error.' }), {
      status: 500, headers,
    });
  }
}

async function logPull(env, request, token, specialty, offset, limit, returned) {
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
