/* ── Vercel Function: resend the booking confirmation email. ──
   POST { bookingId } with `Authorization: Bearer <supabase access token>`.
   Only logged-in admins (Supabase Auth) may call this. ─────────────────── */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!supabaseUrl || !supabaseKey) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  // 1) Verify the caller is a signed-in admin (Supabase Auth token).
  const token = String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  if (!token) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` },
  });
  if (!userResp.ok) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const { bookingId } = req.body ?? {};
  if (!bookingId) {
    res.status(400).json({ error: 'missing_params' });
    return;
  }

  // 2) Load the booking.
  const bResp = await fetch(
    `${supabaseUrl}/rest/v1/bookings?id=eq.${encodeURIComponent(bookingId)}&select=*`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=representation',
      },
    }
  );
  const rows = await bResp.json().catch(() => []);
  const booking = Array.isArray(rows) ? rows[0] : null;
  if (!booking) {
    res.status(404).json({ error: 'booking_not_found' });
    return;
  }

  // 3) Send via Resend (optional).
  if (!resendKey || !booking.email) {
    res.status(503).json({ error: 'email_not_configured' });
    return;
  }
  const send = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Vienna Cuts <onboarding@resend.dev>',
      to: booking.email,
      subject: 'Terminbestätigung — Vienna Cuts',
      html: emailHtml(booking),
    }),
  });
  if (!send.ok) {
    const detail = await send.text().catch(() => '');
    console.error('[resend-email] resend failed:', send.status, detail);
    res.status(502).json({ error: 'email_failed' });
    return;
  }

  res.status(200).json({ ok: true });
}

/* ── Email template (same branding as the webhook mail) ───────────────── */
const SERVICE_NAMES: Record<string, string> = {
  classic: 'Classic Haircut',
  fade: 'Skin Fade',
  beard: 'Beard Trim',
  combo: 'Haircut & Beard',
  premium: 'Premium Grooming',
};

function emailHtml(booking: any): string {
  const esc = (v: unknown) =>
    String(v ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
    );
  const row = (label: string, value: string) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #3a2c1c;color:#8a7a63;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #3a2c1c;color:#f3ead9;font-size:14px;text-align:right;font-weight:bold;">${value}</td>
      </tr>`;

  return `<!doctype html>
<html>
  <body style="margin:0;background:#14100c;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:520px;margin:0 auto;background:#1c1611;border:1px solid #b98a52;border-radius:16px;overflow:hidden;">
      <div style="background:#b98a52;padding:22px 28px;">
        <h1 style="margin:0;color:#14100c;font-size:22px;letter-spacing:2px;">✂ VIENNA CUTS</h1>
        <p style="margin:4px 0 0;color:#3a2c1c;font-size:10px;letter-spacing:4px;text-transform:uppercase;">Premium Barber Studio · Wien</p>
      </div>
      <div style="padding:28px;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#f3ead9;">Terminbestätigung</h2>
        <p style="margin:0 0 22px;font-size:13px;line-height:1.7;color:#c9b99f;">
          Hallo ${esc(booking.name)}, dein Termin ist gespeichert.
          Bitte sei 5 Minuten vor deinem Slot da.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Service', esc(SERVICE_NAMES[booking.service_id] ?? booking.service_id))}
          ${row('Datum', esc(booking.date_iso))}
          ${row('Uhrzeit', esc(booking.time))}
          ${row('Referenz', esc(booking.id))}
        </table>
        <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#c9b99f;">
          Wir freuen uns auf dich!<br />— Dein Vienna-Cuts-Team
        </p>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #3a2c1c;">
        <p style="margin:0;font-size:10px;color:#8a7a63;">
          Vienna Cuts — Premium Barber Studio Wien · Automatische Nachricht, bitte nicht antworten.
        </p>
      </div>
    </div>
  </body>
</html>`;
}
