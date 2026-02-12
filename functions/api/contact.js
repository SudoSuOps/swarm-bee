/**
 * Cloudflare Pages Function: POST /api/contact
 * Receives contact form submissions and forwards to Rocket.Chat incoming webhook.
 *
 * Environment variable (set in Cloudflare Pages dashboard):
 *   ROCKETCHAT_WEBHOOK_URL = https://chat.swarmandbee.com/hooks/xxx/yyy
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://swarmandbee.com',
  };

  try {
    const body = await request.json();
    const { name, email, interest, message } = body;

    // Validate required fields
    if (!name || !email || !interest || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'All fields required.' }), {
        status: 400, headers,
      });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email.' }), {
        status: 400, headers,
      });
    }

    // Rate limit: simple per-IP (Cloudflare handles heavy abuse at edge)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    // Format message for Rocket.Chat
    const rcPayload = {
      text: `**New Contact — swarmandbee.com**`,
      attachments: [{
        color: '#eab308',
        fields: [
          { short: true, title: 'Name', value: name },
          { short: true, title: 'Email', value: email },
          { short: true, title: 'Interest', value: interest },
          { short: true, title: 'IP', value: ip },
          { short: false, title: 'Message', value: message },
        ],
        ts: new Date().toISOString(),
      }],
    };

    // Send to Rocket.Chat webhook
    const webhookUrl = env.ROCKETCHAT_WEBHOOK_URL;
    if (!webhookUrl) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Contact system not configured.',
        debug_type: typeof webhookUrl,
        debug_len: webhookUrl ? webhookUrl.length : 0,
        debug_val: String(webhookUrl).substring(0, 30),
      }), {
        status: 500, headers,
      });
    }

    const rcResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rcPayload),
    });

    if (!rcResponse.ok) {
      console.error('RC webhook failed:', rcResponse.status, await rcResponse.text());
      return new Response(JSON.stringify({ ok: false, error: 'Delivery failed. Try again.' }), {
        status: 502, headers,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });

  } catch (err) {
    console.error('Contact handler error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Server error.' }), {
      status: 500, headers,
    });
  }
}

// Handle OPTIONS for CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://swarmandbee.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
