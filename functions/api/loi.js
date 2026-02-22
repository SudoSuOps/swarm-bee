/**
 * Cloudflare Pages Function: POST /api/loi
 * Receives LOI form submissions and forwards to Discord webhook.
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://swarmandbee.com',
  };

  try {
    const body = await request.json();
    const { company, name, email, phone, companyType, tier, specialties, use, baseModel, budget, details } = body;

    if (!company || !name || !email || !tier) {
      return new Response(JSON.stringify({ ok: false, error: 'Required fields missing.' }), { status: 400, headers });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ts = new Date().toISOString();

    const discordUrl = env.DISCORD_WEBHOOK_URL;
    if (!discordUrl) {
      return new Response(JSON.stringify({ ok: false, error: 'Not configured.' }), { status: 502, headers });
    }

    const specList = (specialties || []).join(', ') || 'Not specified';

    const discordPayload = {
      embeds: [{
        title: 'NEW LOI — Platinum Data License',
        color: 0xB89B3C,
        fields: [
          { name: 'Company', value: company, inline: true },
          { name: 'Contact', value: `${name}\n${email}\n${phone || 'No phone'}`, inline: true },
          { name: 'Type', value: companyType || 'Not specified', inline: true },
          { name: 'Tier', value: tier, inline: true },
          { name: 'Budget', value: budget || 'Not specified', inline: true },
          { name: 'Use', value: use || 'Not specified', inline: true },
          { name: 'Specialties', value: specList.slice(0, 1024), inline: false },
          { name: 'Base Model', value: baseModel || 'Not specified', inline: true },
          { name: 'Details', value: (details || 'None').slice(0, 1024), inline: false },
          { name: 'IP', value: ip, inline: true },
        ],
        timestamp: ts,
        footer: { text: 'swarmandbee.com/loi' },
      }],
    };

    const resp = await fetch(discordUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (resp.ok || resp.status === 204) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ ok: false, error: 'Delivery failed.' }), { status: 502, headers });
  } catch (err) {
    console.error('LOI handler error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Server error.' }), { status: 500, headers });
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
