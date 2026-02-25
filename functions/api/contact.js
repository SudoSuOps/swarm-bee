/**
 * Cloudflare Pages Function: POST /api/contact
 * Receives contact form submissions and forwards to Discord webhook.
 * Falls back to Rocket.Chat if Discord fails.
 *
 * Environment variables (set via CF Pages settings):
 *   DISCORD_WEBHOOK_URL  = https://discord.com/api/webhooks/xxx/yyy
 *   ROCKETCHAT_WEBHOOK_URL = https://chat.swarmandbee.com/hooks/xxx/yyy (fallback)
 */

const ALLOWED_ORIGINS = [
  'https://swarmandbee.com',
  'https://swarmandbeecre.com',
  'https://swarmandbeeroi.com',
];

function corsOrigin(request) {
  const o = request.headers.get('Origin') || '';
  return ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': corsOrigin(request),
  };

  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
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
    const ts = new Date().toISOString();

    // ─── Discord Webhook (primary) ──────────────────────────────
    let delivered = false;

    const discordUrl = env.DISCORD_WEBHOOK_URL;
    if (discordUrl) {
      const discordPayload = {
        embeds: [{
          title: 'New Contact — swarmandbee.com',
          color: 0xB89B3C,
          fields: [
            { name: 'Name', value: name, inline: true },
            { name: 'Email', value: email, inline: true },
            { name: 'IP', value: ip, inline: true },
            { name: 'Message', value: message.slice(0, 1024), inline: false },
          ],
          timestamp: ts,
          footer: { text: 'swarmandbee.com contact form' },
        }],
      };

      try {
        const discordResp = await fetch(discordUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordPayload),
        });
        if (discordResp.ok || discordResp.status === 204) {
          delivered = true;
        } else {
          console.error('Discord webhook failed:', discordResp.status);
        }
      } catch (err) {
        console.error('Discord webhook error:', err);
      }
    }

    // ─── Rocket.Chat Webhook (fallback) ─────────────────────────
    if (!delivered) {
      const rcUrl = env.ROCKETCHAT_WEBHOOK_URL;
      if (rcUrl) {
        const rcPayload = {
          text: `**New Contact — swarmandbee.com**`,
          attachments: [{
            color: '#B89B3C',
            fields: [
              { short: true, title: 'Name', value: name },
              { short: true, title: 'Email', value: email },
              { short: true, title: 'IP', value: ip },
              { short: false, title: 'Message', value: message },
            ],
            ts,
          }],
        };

        try {
          const rcResp = await fetch(rcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rcPayload),
          });
          if (rcResp.ok) {
            delivered = true;
          } else {
            console.error('RC webhook failed:', rcResp.status);
          }
        } catch (err) {
          console.error('RC webhook error:', err);
        }
      }
    }

    if (!delivered) {
      console.error('All delivery methods failed');
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
