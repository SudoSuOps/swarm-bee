/**
 * Cloudflare Pages Function: POST /api/contact
 * Receives contact form submissions and forwards to Rocket.Chat incoming webhook.
 *
 * Environment variable (set via CF API):
 *   ROCKETCHAT_WEBHOOK_URL = https://chat.swarmandbee.com/hooks/xxx/yyy
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://swarmandbee.com',
  };

  try {
    const body = await request.json();
    const { name, email, interest, message } = body;

    if (!name || !email || !interest || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'All fields required.' }), {
        status: 400, headers,
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email.' }), {
        status: 400, headers,
      });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

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

    const webhookUrl = env.ROCKETCHAT_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('ROCKETCHAT_WEBHOOK_URL not configured');
      return new Response(JSON.stringify({ ok: false, error: 'Contact system not configured.' }), {
        status: 500, headers,
      });
    }

    const rcResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rcPayload),
    });

    if (!rcResponse.ok) {
      console.error('RC webhook failed:', rcResponse.status);
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
