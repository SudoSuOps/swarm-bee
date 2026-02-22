/**
 * Cloudflare Pages Function: GET /api/data/pull
 * API-key-gated access to pairs by vault/specialty with pagination.
 * Auth: Authorization: Bearer sk_swarm_xxxx
 * Params: ?specialty=surgery&vault=med-vault&tier=platinum&limit=100&offset=0
 *
 * Default vault: med-vault, default tier: platinum
 */
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
  const validKeys = (env.API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
  let keyValid = validKeys.includes(token);
  if (!keyValid) {
    try {
      const keysObj = await env.DATA_BUCKET.get('keys.json');
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

  const vault = url.searchParams.get('vault') || 'med-vault';
  const tier = url.searchParams.get('tier') || 'platinum';
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 1), 1000);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  try {
    // Read the specialty chunk directly from R2
    // Layout: {vault}/{tier}/{specialty}.jsonl
    const r2Key = vault + '/' + tier + '/' + specialty + '.jsonl';
    const chunkObj = await env.DATA_BUCKET.get(r2Key);

    if (!chunkObj) {
      // Try to help: load catalog for valid specialties
      const catObj = await env.DATA_BUCKET.get('catalog.json');
      let available = [];
      if (catObj) {
        try {
          const catalog = JSON.parse(await catObj.text());
          const vaultData = catalog.vaults[vault];
          if (vaultData && vaultData.tiers[tier]) {
            available = vaultData.tiers[tier].specialties.map(s => s.specialty);
          }
        } catch (_) {}
      }
      return new Response(JSON.stringify({
        ok: false,
        error: 'Specialty not found: ' + specialty,
        vault, tier,
        available: available.length > 0 ? available : undefined,
      }), { status: 404, headers });
    }

    const text = await chunkObj.text();
    const lines = text.trim().split('\n');
    const total = lines.length;

    if (offset >= total) {
      return new Response(JSON.stringify({
        ok: true, pairs: [], count: 0, total, offset, limit, has_more: false,
      }), { status: 200, headers });
    }

    const pairs = lines.slice(offset, offset + limit).map(line => {
      const d = JSON.parse(line);
      return {
        question: d.question,
        answer: d.answer,
        specialty: d.specialty,
        fingerprint: d.fingerprint,
        tier: d.tier || tier,
      };
    });

    const has_more = (offset + pairs.length) < total;

    // Log to Discord (fire-and-forget)
    logPull(env, request, token, vault, tier, specialty, offset, limit, pairs.length).catch(() => {});

    return new Response(JSON.stringify({
      ok: true,
      vault, tier, specialty,
      total,
      offset, limit,
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

async function logPull(env, request, token, vault, tier, specialty, offset, limit, returned) {
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
          { name: 'Vault', value: vault + '/' + tier, inline: true },
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
