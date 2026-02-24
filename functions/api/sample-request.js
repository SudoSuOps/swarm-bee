/**
 * Cloudflare Pages Function: POST /api/sample-request
 * Email capture for dataset samples — logs lead to Discord webhook.
 *
 * Environment variables:
 *   DISCORD_WEBHOOK_URL = https://discord.com/api/webhooks/xxx/yyy
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://swarmandbee.com',
  };

  try {
    const body = await request.json();
    const { email, vertical, company } = body;

    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: 'Email required.' }), {
        status: 400, headers,
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email.' }), {
        status: 400, headers,
      });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ua = request.headers.get('User-Agent') || 'unknown';
    const ts = new Date().toISOString();

    // Log lead to Discord
    const discordUrl = env.DISCORD_WEBHOOK_URL;
    if (discordUrl) {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: 'Dataset Lead — Sample Request',
            color: 0xB89B3C,
            fields: [
              { name: 'Email', value: email, inline: true },
              { name: 'Vertical', value: vertical || 'not specified', inline: true },
              { name: 'Company', value: company || 'not specified', inline: true },
              { name: 'IP', value: ip, inline: true },
              { name: 'Source', value: 'swarmandbee.com/datasets', inline: true },
              { name: 'User-Agent', value: ua.slice(0, 256), inline: false },
            ],
            timestamp: ts,
            footer: { text: 'Dataset funnel — email capture' },
          }],
        }),
      }).catch(() => {});
    }

    return new Response(JSON.stringify({ ok: true, message: 'Sample request received.' }), {
      status: 200, headers,
    });

  } catch (err) {
    console.error('Sample request error:', err);
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
