/* ── Vercel Function: Stripe webhook. ──
   Verifies the Stripe signature for `checkout.session.completed`,
   then: booking.status = 'confirmed' + confirmation email via Resend. ──── */

import Stripe from 'stripe';
import type { IncomingMessage } from 'node:http';

async function getRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    res.status(503).json({ error: 'payments_not_configured' });
    return;
  }

  const stripe = new Stripe(secretKey);
  const signature = req.headers['stripe-signature'] as string | undefined;
  if (!signature) {
    res.status(400).json({ error: 'missing_signature' });
    return;
  }

  let event: Stripe.Event;
  try {
    const raw = await getRawBody(req);
    event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
  } catch (err: any) {
    console.error('[stripe-webhook] signature check failed:', err?.message ?? err);
    res.status(400).json({ error: 'invalid_signature' });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (bookingId && supabaseUrl && supabaseKey) {
      // 1) Mark the booking as confirmed (admin key bypasses RLS).
      let booking: any = null;
      try {
        const patch = await fetch(
          `${supabaseUrl}/rest/v1/bookings?id=eq.${encodeURIComponent(bookingId)}`,
          {
            method: 'PATCH',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=representation',
            },
            body: JSON.stringify({ status: 'confirmed', stripe_session_id: session.id }),
          }
        );
        const rows = await patch.json().catch(() => []);
        booking = Array.isArray(rows) ? rows[0] : null;
      } catch (err: any) {
        console.error('[stripe-webhook] booking update failed:', err?.message ?? err);
      }

      // 2) Confirmation email via Resend (optional — skipped when no key).
      const resendKey = process.env.RESEND_API_KEY;
      const to = session.customer_details?.email || booking?.email;
      if (resendKey && to) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Vienna Cuts <onboarding@resend.dev>',
              to,
              subject: 'Terminbestätigung — Vienna Cuts',
              html: emailHtml(booking, session.metadata?.serviceLabel ?? 'Termin', session.amount_total),
            }),
          });
        } catch (err: any) {
          console.error('[stripe-webhook] email failed:', err?.message ?? err);
        }
      }
    }
  }

  res.status(200).json({ received: true });
}

/* ── Email template (branded, German — matches the site) ──────────────── */
function emailHtml(booking: any, serviceLabel: string, amountTotal: number | null): string {
  const esc = (v: unknown) =>
    String(v ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
    );
  const row = (label: string, value: string) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #3a2c1c;color:#8a7a63;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #3a2c1c;color:#f3ead9;font-size:14px;text-align:right;font-weight:bold;">${value}</td>
      </tr>`;

  const price = amountTotal != null ? `€${(amountTotal / 100).toFixed(2)}` : '';

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
          Hallo ${esc(booking?.name || '')}, dein Termin ist bestätigt und bezahlt.
          Bitte sei 5 Minuten vor deinem Slot da.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Service', esc(serviceLabel))}
          ${row('Datum', esc(booking?.date_iso))}
          ${row('Uhrzeit', esc(booking?.time))}
          ${price ? row('Bezahlt', price) : ''}
          ${row('Referenz', esc(booking?.id))}
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
