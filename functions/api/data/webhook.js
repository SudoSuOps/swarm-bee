/**
 * Cloudflare Pages Function: POST /api/data/webhook
 * Stripe webhook handler for reliable key generation, subscription lifecycle.
 *
 * Events handled:
 *   checkout.session.completed — generate API key with quota
 *   invoice.paid              — reset pairs_pulled on renewal
 *   customer.subscription.deleted — deactivate key
 *
 * Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, OPS_BUCKET, DISCORD_DATA_WEBHOOK_URL
 */

const QUOTA_MAP = {
  finetune:   1000,
  pro:        50000,
  custom:     100000,
  enterprise: 250000,
  starter:    500,
};

async function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = {};
  sigHeader.split(',').forEach(function(item) {
    const [k, v] = item.split('=');
    parts[k.trim()] = v;
  });
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const payload = timestamp + '.' + rawBody;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(sig)).map(function(b) {
    return b.toString(16).padStart(2, '0');
  }).join('');

  return expected === signature;
}

function generateApiKey() {
  var bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return 'sk_swarm_' + Array.from(bytes).map(function(b) {
    return b.toString(16).padStart(2, '0');
  }).join('');
}

async function loadKeys(env) {
  var opsBucket = env.OPS_BUCKET || env.DATA_BUCKET;
  var keysObj = await opsBucket.get('keys/api-keys.json');
  return keysObj ? JSON.parse(await keysObj.text()) : { keys: [] };
}

async function saveKeys(env, keysData) {
  var opsBucket = env.OPS_BUCKET || env.DATA_BUCKET;
  await opsBucket.put('keys/api-keys.json', JSON.stringify(keysData, null, 2));
}

async function handleCheckoutCompleted(session, env) {
  var keysData = await loadKeys(env);
  var sessionId = session.id;

  // Idempotent — skip if already activated
  var existing = keysData.keys.find(function(k) { return k.stripe_session === sessionId; });
  if (existing) return { action: 'skip', reason: 'already_activated' };

  var tier = (session.metadata && session.metadata.tier) || 'unknown';
  var email = (session.customer_details && session.customer_details.email) || 'unknown';
  var apiKey = generateApiKey();

  var record = {
    key: apiKey,
    email: email,
    tier: tier,
    stripe_session: sessionId,
    stripe_customer_id: session.customer || null,
    stripe_subscription_id: session.subscription || null,
    amount_paid: session.amount_total,
    currency: session.currency,
    quota: QUOTA_MAP[tier] || null,
    pairs_pulled: 0,
    status: 'active',
    origin: (session.metadata && session.metadata.origin) || 'hq',
    created_at: new Date().toISOString(),
  };

  keysData.keys.push(record);
  await saveKeys(env, keysData);

  // Discord notification
  logWebhookEvent(env, 'Key Activated (Webhook)', [
    { name: 'Tier', value: tier, inline: true },
    { name: 'Email', value: email, inline: true },
    { name: 'Amount', value: '$' + ((session.amount_total || 0) / 100).toFixed(2), inline: true },
    { name: 'Quota', value: String(record.quota || 'unlimited'), inline: true },
    { name: 'Key Prefix', value: apiKey.slice(0, 16) + '...', inline: true },
  ]).catch(function() {});

  return { action: 'created', tier: tier, email: email };
}

async function handleInvoicePaid(invoice, env) {
  var customerId = invoice.customer;
  if (!customerId) return { action: 'skip', reason: 'no_customer' };

  var keysData = await loadKeys(env);
  var found = false;

  keysData.keys.forEach(function(k) {
    if (k.stripe_customer_id === customerId && k.status === 'active') {
      k.pairs_pulled = 0;
      k.last_renewal = new Date().toISOString();
      found = true;
    }
  });

  if (found) {
    await saveKeys(env, keysData);
    logWebhookEvent(env, 'Subscription Renewed', [
      { name: 'Customer', value: customerId, inline: true },
      { name: 'Amount', value: '$' + ((invoice.amount_paid || 0) / 100).toFixed(2), inline: true },
    ]).catch(function() {});
  }

  return { action: found ? 'renewed' : 'no_match' };
}

async function handleSubscriptionDeleted(subscription, env) {
  var subId = subscription.id;
  if (!subId) return { action: 'skip', reason: 'no_subscription_id' };

  var keysData = await loadKeys(env);
  var found = false;

  keysData.keys.forEach(function(k) {
    if (k.stripe_subscription_id === subId) {
      k.status = 'cancelled';
      k.cancelled_at = new Date().toISOString();
      found = true;
    }
  });

  if (found) {
    await saveKeys(env, keysData);
    logWebhookEvent(env, 'Subscription Cancelled', [
      { name: 'Subscription', value: subId.slice(0, 20) + '...', inline: true },
    ]).catch(function() {});
  }

  return { action: found ? 'cancelled' : 'no_match' };
}

async function logWebhookEvent(env, title, fields) {
  var discordUrl = env.DISCORD_DATA_WEBHOOK_URL;
  if (!discordUrl) return;
  await fetch(discordUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: 'Webhook — ' + title,
        color: 0xB89B3C,
        fields: fields,
        timestamp: new Date().toISOString(),
        footer: { text: 'swarmandbee.com/api/data/webhook' },
      }],
    }),
  });
}

export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;

  var headers = { 'Content-Type': 'application/json' };

  try {
    var rawBody = await request.text();
    var sigHeader = request.headers.get('Stripe-Signature') || '';

    if (!env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response(JSON.stringify({ ok: false, error: 'Webhook not configured.' }), { status: 500, headers: headers });
    }

    var valid = await verifyStripeSignature(rawBody, sigHeader, env.STRIPE_WEBHOOK_SECRET);
    if (!valid) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid signature.' }), { status: 400, headers: headers });
    }

    var event = JSON.parse(rawBody);
    var result;

    switch (event.type) {
      case 'checkout.session.completed':
        result = await handleCheckoutCompleted(event.data.object, env);
        break;
      case 'invoice.paid':
        result = await handleInvoicePaid(event.data.object, env);
        break;
      case 'customer.subscription.deleted':
        result = await handleSubscriptionDeleted(event.data.object, env);
        break;
      default:
        result = { action: 'ignored', event_type: event.type };
    }

    return new Response(JSON.stringify({ ok: true, result: result }), { status: 200, headers: headers });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Webhook processing error.' }), { status: 500, headers: headers });
  }
}
