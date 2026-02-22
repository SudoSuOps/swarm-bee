/**
 * Cloudflare Pages Function: GET /api/data/activate
 * Verifies Stripe payment, generates API key, stores in R2.
 * Params: ?session_id=cs_xxx
 * Idempotent — same session returns same key.
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (!sessionId) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing session_id parameter.' }), {
      status: 400, headers,
    });
  }

  if (!env.STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ ok: false, error: 'Payment system not configured.' }), {
      status: 500, headers,
    });
  }

  try {
    // Verify payment with Stripe
    const stripeResp = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId), {
      headers: {
        'Authorization': 'Basic ' + btoa(env.STRIPE_SECRET_KEY + ':'),
      },
    });

    if (!stripeResp.ok) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid session.' }), {
        status: 400, headers,
      });
    }

    const session = await stripeResp.json();

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ ok: false, error: 'Payment not completed.' }), {
        status: 402, headers,
      });
    }

    // Load existing keys from R2
    const keysObj = await env.DATA_BUCKET.get('platinum/keys.json');
    const keysData = keysObj ? JSON.parse(await keysObj.text()) : { keys: [] };

    // Idempotent — return existing key if already activated
    const existing = keysData.keys.find(function(k) { return k.stripe_session === sessionId; });
    if (existing) {
      return new Response(JSON.stringify({
        ok: true,
        api_key: existing.key,
        tier: existing.tier,
        email: existing.email,
        created_at: existing.created_at,
      }), { status: 200, headers });
    }

    // Generate new API key
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const apiKey = 'sk_swarm_' + Array.from(bytes).map(function(b) {
      return b.toString(16).padStart(2, '0');
    }).join('');

    const email = session.customer_details && session.customer_details.email
      ? session.customer_details.email : 'unknown';
    const tier = session.metadata && session.metadata.tier
      ? session.metadata.tier : 'unknown';

    const record = {
      key: apiKey,
      email: email,
      tier: tier,
      stripe_session: sessionId,
      amount_paid: session.amount_total,
      currency: session.currency,
      created_at: new Date().toISOString(),
    };

    keysData.keys.push(record);

    // Store updated keys in R2
    await env.DATA_BUCKET.put('platinum/keys.json', JSON.stringify(keysData, null, 2));

    // Log to Discord (fire-and-forget)
    logActivation(env, record).catch(function() {});

    return new Response(JSON.stringify({
      ok: true,
      api_key: apiKey,
      tier: tier,
      email: email,
      created_at: record.created_at,
    }), { status: 200, headers });

  } catch (err) {
    console.error('Activate error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Server error during activation.' }), {
      status: 500, headers,
    });
  }
}

async function logActivation(env, record) {
  const discordUrl = env.DISCORD_DATA_WEBHOOK_URL;
  if (!discordUrl) return;
  await fetch(discordUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: 'New API Key Activated',
        color: 0x5a9a6a,
        fields: [
          { name: 'Tier', value: record.tier, inline: true },
          { name: 'Email', value: record.email, inline: true },
          { name: 'Amount', value: '$' + (record.amount_paid / 100).toFixed(2), inline: true },
          { name: 'Key Prefix', value: record.key.slice(0, 16) + '...', inline: true },
          { name: 'Session', value: record.stripe_session.slice(0, 20) + '...', inline: true },
        ],
        timestamp: record.created_at,
        footer: { text: 'SwarmForge Data API — Stripe Checkout' },
      }],
    }),
  });
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
