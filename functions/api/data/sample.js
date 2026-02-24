/**
 * Cloudflare Pages Function: GET /api/data/sample
 * Returns 10 random pairs for evaluation. No auth required.
 * Supports ?vertical=medical|aviation|cre|core (default: medical)
 * Optional: ?specialty=neurology to filter by specialty.
 *
 * R2 Buckets:
 *   MEDICAL_BUCKET  → sb-medical
 *   AVIATION_BUCKET → sb-aviation
 *   CRE_BUCKET      → sb-cre
 *   CORE_BUCKET     → sb-core
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
  const specialty = url.searchParams.get('specialty');
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  };

  if (!VALID_VERTICALS.includes(vertical)) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Invalid vertical. Use: ' + VALID_VERTICALS.join(', '),
    }), { status: 400, headers });
  }

  try {
    const bucket = getBucket(env, vertical);
    if (!bucket) {
      return new Response(JSON.stringify({
        ok: false, error: 'Vertical not configured: ' + vertical,
      }), { status: 500, headers });
    }

    const obj = await bucket.get('samples.jsonl');
    if (!obj) {
      return new Response(JSON.stringify({
        ok: false, error: 'Samples not available for vertical: ' + vertical,
      }), { status: 404, headers });
    }

    const text = await obj.text();
    let pairs = text.trim().split('\n').map(function(line) { return JSON.parse(line); });

    if (specialty) {
      pairs = pairs.filter(function(p) { return p.specialty === specialty; });
    }

    // Fisher-Yates shuffle
    const arr = new Uint32Array(pairs.length);
    crypto.getRandomValues(arr);
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = arr[i] % (i + 1);
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    const sample = pairs.slice(0, 10).map(function(p) {
      return {
        question: p.question,
        answer: p.answer,
        specialty: p.specialty,
        fingerprint: p.fingerprint,
        tier: p.tier,
        vertical: vertical,
      };
    });

    // Log to Discord (fire-and-forget)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ua = request.headers.get('User-Agent') || 'unknown';
    logSample(env, ip, ua, vertical, specialty, sample.length).catch(function() {});

    return new Response(JSON.stringify({
      ok: true,
      vertical: vertical,
      count: sample.length,
      specialty_filter: specialty || 'all',
      pairs: sample,
    }), { status: 200, headers });
  } catch (err) {
    console.error('Sample handler error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Server error.' }), {
      status: 500, headers,
    });
  }
}

async function logSample(env, ip, ua, vertical, specialty, count) {
  const discordUrl = env.DISCORD_DATA_WEBHOOK_URL;
  if (!discordUrl) return;
  await fetch(discordUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: 'Data API — Sample Request',
        color: 0x4A90D9,
        fields: [
          { name: 'Vertical', value: vertical, inline: true },
          { name: 'Specialty', value: specialty || 'all', inline: true },
          { name: 'Returned', value: String(count), inline: true },
          { name: 'IP', value: ip, inline: true },
          { name: 'User-Agent', value: ua.slice(0, 256), inline: false },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'swarmandbee.com/api/data/sample' },
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
