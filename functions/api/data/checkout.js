/**
 * Cloudflare Pages Function: POST /api/data/checkout
 * Creates a Stripe Checkout Session for Featured Data Packs.
 * Body: { "tier": "starter" }
 * All packs are $99 / 1,000 pairs. Category handled client-side via metadata.
 */
const TIERS = {
  starter: {
    name: 'SwarmForge Featured Pack — 1,000 Pairs',
    description: '1,000 CoVe-verified QA pairs. Any category (Medical, Aviation, or CRE). API key. Instant access.',
    price: 9900,
    mode: 'payment',
  },
};

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();
    const tierKey = body.tier;
    const tier = TIERS[tierKey];

    if (!tier) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Invalid tier. Use "starter".',
      }), { status: 400, headers });
    }

    if (!env.STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Payment system not configured.',
      }), { status: 500, headers });
    }

    const params = new URLSearchParams();
    params.append('mode', tier.mode);
    params.append('success_url', 'https://swarmandbee.com/data-success?session_id={CHECKOUT_SESSION_ID}');
    params.append('cancel_url', 'https://swarmandbee.com/data');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][product_data][name]', tier.name);
    params.append('line_items[0][price_data][product_data][description]', tier.description);
    params.append('line_items[0][price_data][unit_amount]', String(tier.price));
    params.append('line_items[0][quantity]', '1');
    if (tier.mode === 'subscription') {
      params.append('line_items[0][price_data][recurring][interval]', 'month');
    }
    params.append('metadata[tier]', tierKey);
    params.append('metadata[product]', 'swarmforge-data-api');

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
      return new Response(JSON.stringify({
        ok: false,
        error: session.error.message,
      }), { status: 400, headers });
    }

    return new Response(JSON.stringify({
      ok: true,
      url: session.url,
      session_id: session.id,
    }), { status: 200, headers });

  } catch (err) {
    console.error('Checkout error:', err);
    return new Response(JSON.stringify({
      ok: false,
      error: 'Server error creating checkout session.',
    }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
