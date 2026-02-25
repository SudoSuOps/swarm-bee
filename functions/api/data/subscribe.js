/**
 * Cloudflare Pages Function: POST /api/data/subscribe
 * Creates a Stripe Checkout Session for CRE API subscriptions.
 * Body: { "tier": "starter" | "pro" }
 */
const TIERS = {
  starter: {
    name: 'SwarmCRE Starter — 500 credits/mo',
    description: 'Deep search, all 19 skills, priority inference, API key dashboard.',
    price: 4900,
    interval: 'month',
  },
  pro: {
    name: 'SwarmCRE Pro — 5,000 credits/mo',
    description: 'Deep search + batch, custom pipelines, webhooks, dedicated support.',
    price: 29900,
    interval: 'month',
  },
};

const ALLOWED_ORIGINS = [
  'https://swarmandbeecre.com',
  'https://swarmandbee.com',
  'https://swarmandbeeroi.com',
];

function corsOrigin(request) {
  const o = request.headers.get('Origin') || '';
  return ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = corsOrigin(request);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin };

  try {
    const body = await request.json();
    const tier = TIERS[body.tier];

    if (!tier) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid tier. Use "starter" or "pro".' }), { status: 400, headers });
    }

    if (!env.STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ ok: false, error: 'Payment system not configured.' }), { status: 500, headers });
    }

    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('success_url', 'https://swarmandbeecre.com/?checkout=success');
    params.append('cancel_url', 'https://swarmandbeecre.com/#pricing');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][product_data][name]', tier.name);
    params.append('line_items[0][price_data][product_data][description]', tier.description);
    params.append('line_items[0][price_data][unit_amount]', String(tier.price));
    params.append('line_items[0][price_data][recurring][interval]', tier.interval);
    params.append('line_items[0][quantity]', '1');
    params.append('metadata[tier]', body.tier);
    params.append('metadata[product]', 'swarmcre-api');

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(env.STRIPE_SECRET_KEY + ':'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await resp.json();

    if (session.error) {
      return new Response(JSON.stringify({ ok: false, error: session.error.message }), { status: 400, headers });
    }

    return new Response(JSON.stringify({ ok: true, url: session.url, session_id: session.id }), { status: 200, headers });
  } catch (err) {
    console.error('Subscribe error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Server error.' }), { status: 500, headers });
  }
}

export async function onRequestOptions(context) {
  const o = context.request.headers.get('Origin') || '';
  const origin = ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
