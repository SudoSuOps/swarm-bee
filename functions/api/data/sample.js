/**
 * Cloudflare Pages Function: GET /api/data/sample
 * Returns 10 random platinum pairs for evaluation. No auth required.
 * Optional: ?specialty=neurology to filter by specialty.
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const specialty = url.searchParams.get('specialty');
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  };

  try {
    const obj = await env.DATA_BUCKET.get('samples.jsonl');
    if (!obj) {
      return new Response(JSON.stringify({ ok: false, error: 'Samples not available.' }), {
        status: 404, headers,
      });
    }

    const text = await obj.text();
    let pairs = text.trim().split('\n').map(line => JSON.parse(line));

    if (specialty) {
      pairs = pairs.filter(p => p.specialty === specialty);
    }

    // Fisher-Yates shuffle
    const arr = new Uint32Array(pairs.length);
    crypto.getRandomValues(arr);
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = arr[i] % (i + 1);
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    const sample = pairs.slice(0, 10).map(({ question, answer, specialty, fingerprint, tier }) => ({
      question, answer, specialty, fingerprint, tier,
    }));

    // Log to Discord (fire-and-forget)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ua = request.headers.get('User-Agent') || 'unknown';
    logSample(env, ip, ua, specialty, sample.length).catch(() => {});

    return new Response(JSON.stringify({
      ok: true,
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

async function logSample(env, ip, ua, specialty, count) {
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
          { name: 'IP', value: ip, inline: true },
          { name: 'Specialty', value: specialty || 'all', inline: true },
          { name: 'Returned', value: String(count), inline: true },
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
