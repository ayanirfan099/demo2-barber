/* ── Vercel Function: Vienna Cuts AI-tools endpoint for the Vapi voice agent. ──
   POST /api/ai-tools  — speaks the Vapi tool-call protocol:
   request:  { message: { toolCalls: [{ id, function: { name, arguments } }] } }
   response: { results: [{ toolCallId, result }] }

   Tools:
     get_services        → live service catalog + barbers + opening hours
     check_availability  → real free slots (same engine as the booking wizard)
     create_booking      → validated booking write (+ confirmation email,
                            optional Stripe payment link when payment='online')

   Security: if VAPI_TOOL_SECRET is set, requests must carry
   `x-ai-secret: <same value>` (configure it on the Vapi tool servers).
   Owner/admin APIs are intentionally NOT exposed here. ─────────────────────── */

import Stripe from 'stripe';

/* ── Catalog mirror (src/lib/data.ts) ────────────────────────────────────── */
const SERVICES = [
  { id: 'classic', name_de: 'Classic Haircut', name_en: 'Classic Haircut', price: 35, duration: 45 },
  { id: 'fade', name_de: 'Skin Fade', name_en: 'Skin Fade', price: 40, duration: 50 },
  { id: 'beard', name_de: 'Beard Trim', name_en: 'Beard Trim', price: 15, duration: 20 },
  { id: 'combo', name_de: 'Haircut & Beard', name_en: 'Haircut & Beard', price: 45, duration: 60 },
  { id: 'premium', name_de: 'Premium Grooming', name_en: 'Premium Grooming', price: 60, duration: 75 },
];

const BARBERS = [
  { id: 'jonas', name: 'Jonas Berger', weekdays: [1, 2, 3, 4, 5, 6] }, // Mo–Sa
  { id: 'marco', name: 'Marco Steiner', weekdays: [1, 2, 3, 4, 5] },   // Mo–Fr
  { id: 'david', name: 'David Auer', weekdays: [2, 3, 4, 5, 6] },      // Di–Sa
  { id: 'lena', name: 'Lena Hofmann', weekdays: [1, 2, 4, 5, 6] },     // Mo, Di, Do–Sa
];

/* Mon-first hours (Europe/Vienna) — mirror of data.ts HOURS */
const HOURS: { open: number | null; close: number | null }[] = [
  { open: 9, close: 19 }, // Mon
  { open: 9, close: 19 }, // Tue
  { open: 9, close: 19 }, // Wed
  { open: 9, close: 20 }, // Thu
  { open: 9, close: 20 }, // Fri
  { open: 10, close: 17 }, // Sat
  { open: null, close: null }, // Sun
];

const SLOT_STEP = 30;
const SITE_URL = process.env.SITE_URL || 'https://demo2-barber-jade.vercel.app';

/* ── Time helpers (Europe/Vienna, DST-aware) ─────────────────────────────── */
function viennaNow(): { dateISO: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Vienna',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return {
    dateISO: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
  };
}

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const minutesToTime = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/* ── Resolution helpers ──────────────────────────────────────────────────── */
function resolveService(raw: unknown) {
  const q = String(raw ?? '').trim().toLowerCase();
  if (!q) return null;
  return (
    SERVICES.find((s) => s.id === q) ??
    SERVICES.find((s) => s.name_en.toLowerCase() === q || s.name_de.toLowerCase() === q) ??
    SERVICES.find((s) => s.name_en.toLowerCase().includes(q) || s.name_de.toLowerCase().includes(q) || q.includes(s.name_en.toLowerCase())) ??
    null
  );
}

function resolveBarber(raw: unknown): string | 'any' | null {
  const q = String(raw ?? '').trim().toLowerCase();
  if (!q || q === 'any' || q === 'egal' || q === 'no preference' || q === 'egal wer' || q === 'anyone') return 'any';
  const b =
    BARBERS.find((x) => x.id === q) ??
    BARBERS.find((x) => x.name.toLowerCase() === q) ??
    BARBERS.find((x) => x.name.toLowerCase().includes(q) || q.includes(x.name.toLowerCase()) || q.includes(x.id));
  return b ? b.id : null;
}

/* ── Availability engine (mirror of store.ts computeSlots) ───────────────── */
interface BusyRow {
  id: string; service_id: string; barber_id: string;
  date_iso: string; time: string; status: string;
}

function computeSlots(all: BusyRow[], dateISO: string, serviceId: string, barberId: string | 'any'): string[] {
  const { dateISO: today, minutes: nowMin } = viennaNow();
  if (dateISO < today) return [];

  const [y, m, d] = dateISO.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun
  const hours = HOURS[(weekday + 6) % 7];
  if (hours.open === null || hours.close === null) return [];

  const dur = SERVICES.find((s) => s.id === serviceId)!.duration;
  const openMin = hours.open * 60;
  const closeMin = hours.close * 60;

  const barbers = barberId === 'any' ? BARBERS.map((b) => b.id) : [barberId];
  const eligible = barbers.filter((b) => BARBERS.find((x) => x.id === b)!.weekdays.includes(weekday));
  if (eligible.length === 0) return [];

  const day = all.filter(
    (a) => a.date_iso === dateISO && a.status !== 'canceled' && eligible.includes(a.barber_id)
  );

  const isFree = (b: string, startMin: number, endMin: number) =>
    !day.some((a) => {
      if (a.barber_id !== b) return false;
      const s = timeToMinutes(a.time);
      const e = s + SERVICES.find((x) => x.id === a.service_id)!.duration;
      return startMin < e && endMin > s;
    });

  const slots: string[] = [];
  for (let t = openMin; t + dur <= closeMin; t += SLOT_STEP) {
    if (dateISO === today && t <= nowMin + 30) continue; // lead time
    if (eligible.some((b) => isFree(b, t, t + dur))) slots.push(minutesToTime(t));
  }
  return slots;
}

async function fetchBusy(supabaseUrl: string, supabaseKey: string, dateISO: string): Promise<BusyRow[]> {
  const resp = await fetch(
    `${supabaseUrl}/rest/v1/bookings?date_iso=eq.${encodeURIComponent(dateISO)}&select=id,service_id,barber_id,date_iso,time,status`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );
  if (!resp.ok) return [];
  const rows = await resp.json().catch(() => []);
  return Array.isArray(rows) ? rows : [];
}

/* ── Tool implementations ────────────────────────────────────────────────── */
function toolGetServices() {
  return {
    timezone: 'Europe/Vienna',
    currency: 'EUR',
    services: SERVICES,
    barbers: BARBERS.map((b) => ({ id: b.id, name: b.name })),
    opening_hours: [
      'Mon 09-19', 'Tue 09-19', 'Wed 09-19', 'Thu 09-20', 'Fri 09-20', 'Sat 10-17', 'Sun closed',
    ],
    note: 'Prices are in euros. Duration is in minutes.',
  };
}

async function toolCheckAvailability(args: any) {
  const service = resolveService(args.service);
  if (!service) return { ok: false, reason: 'unknown_service', message: `Unknown service: ${String(args.service)}` };
  const date = String(args.date ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, reason: 'bad_date', message: 'date must be YYYY-MM-DD' };
  const barber = resolveBarber(args.barber);
  if (barber === null) return { ok: false, reason: 'unknown_barber', message: `Unknown barber: ${String(args.barber)}` };

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  let busy: BusyRow[] = [];
  if (supabaseUrl && supabaseKey) busy = await fetchBusy(supabaseUrl, supabaseKey, date);

  const slots = computeSlots(busy, date, service.id, barber);
  return {
    ok: true,
    date,
    service: { id: service.id, name_en: service.name_en, name_de: service.name_de, price_eur: service.price, duration_min: service.duration },
    barber,
    available: slots.slice(0, 24),
    count: slots.length,
    note: 'Times are Europe/Vienna. Offer at most 3 options at a time.',
  };
}

async function toolCreateBooking(args: any, siteUrl: string) {
  const service = resolveService(args.service);
  if (!service) return { ok: false, reason: 'unknown_service', message: `Unknown service: ${String(args.service)}` };
  const barber = resolveBarber(args.barber);
  if (barber === null) return { ok: false, reason: 'unknown_barber', message: `Unknown barber: ${String(args.barber)}` };

  const date = String(args.date ?? '').trim();
  const time = String(args.time ?? '').trim();
  const name = String(args.name ?? '').trim();
  const email = String(args.email ?? '').trim();
  const phone = String(args.phone ?? '').trim();
  const note = String(args.note ?? '').trim();
  const payment = args.payment === 'online' ? 'online' : 'in_person';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, reason: 'bad_date', message: 'date must be YYYY-MM-DD' };
  if (!/^\d{1,2}:\d{2}$/.test(time)) return { ok: false, reason: 'bad_time', message: 'time must be HH:mm' };
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, reason: 'missing_params', message: 'name and a valid email are required' };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseKey) return { ok: false, reason: 'not_configured', message: 'booking backend not configured' };

  // Fresh slot validation at write time (same rules as the manual wizard).
  const busy = await fetchBusy(supabaseUrl, supabaseKey, date);
  const freeTimes = computeSlots(busy, date, service.id, barber);
  if (!freeTimes.includes(time)) {
    return {
      ok: false,
      reason: 'conflict',
      message: 'slot not available (already booked, outside opening hours, or too soon). suggest check_availability again',
    };
  }

  // For 'any': assign the first eligible barber who is actually free.
  let assigned = barber;
  if (barber === 'any') {
    const [y, m, d] = date.split('-').map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const start = timeToMinutes(time);
    const end = start + service.duration;
    const day = busy.filter((a) => a.date_iso === date && a.status !== 'canceled');
    const free = BARBERS.filter((b) => b.weekdays.includes(weekday)).find((b) =>
      !day.some((a) => {
        if (a.barber_id !== b.id) return false;
        const s = timeToMinutes(a.time);
        const e = s + (SERVICES.find((x) => x.id === a.service_id)?.duration ?? 0);
        return start < e && end > s;
      })
    );
    if (!free) return { ok: false, reason: 'conflict', message: 'slot just became unavailable — offer alternatives' };
    assigned = free.id;
  }

  const reference = 'VC-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10);
  const row = {
    id: reference,
    service_id: service.id,
    barber_id: assigned,
    date_iso: date,
    time,
    name,
    email,
    phone,
    note,
    status: 'pending',
    created_at_ms: Date.now(),
    payment_method: payment,
  };

  const insert = await fetch(`${supabaseUrl}/rest/v1/bookings`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!insert.ok) {
    const detail = await insert.text().catch(() => '');
    console.error('[ai-tools] insert failed:', insert.status, detail);
    return { ok: false, reason: 'server', message: 'booking could not be saved' };
  }

  // Optional online payment link (same Stripe flow as the manual wizard).
  let paymentUrl: string | undefined;
  if (payment === 'online' && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'eur',
              unit_amount: Math.round(service.price * 100),
              product_data: {
                name: `Vienna Cuts — ${service.name_en}`,
                description: `${date} ${time} · ${reference}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: { bookingId: reference, serviceLabel: service.name_en },
        customer_email: email || undefined,
        success_url: `${siteUrl}/#/buchen?paid=1&ref=${encodeURIComponent(reference)}`,
        cancel_url: `${siteUrl}/#/buchen?canceled=1`,
      });
      paymentUrl = session.url ?? undefined;
      await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${encodeURIComponent(reference)}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ stripe_session_id: session.id }),
      }).catch(() => undefined);
    } catch (err: any) {
      console.error('[ai-tools] stripe:', err?.message ?? err);
    }
  }

  // Best-effort confirmation email (Resend test mode may restrict recipients).
  if (process.env.RESEND_API_KEY) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vienna Cuts <onboarding@resend.dev>',
        to: email,
        subject: payment === 'online' && paymentUrl ? 'Zahlungslink — Vienna Cuts' : 'Terminanfrage — Vienna Cuts',
        html: emailHtml({ reference, name, service: service.name_en, date, time, payment, paymentUrl }),
      }),
    }).catch(() => undefined);
  }

  return {
    ok: true,
    reference,
    status: 'pending',
    payment,
    price_eur: service.price,
    duration_min: service.duration,
    barber: assigned,
    payment_url: paymentUrl,
    message:
      payment === 'online' && paymentUrl
        ? 'Booking saved (pending). A payment link was emailed to the customer — tell them to check their inbox; never read URLs aloud.'
        : 'Booking saved (pending) — awaiting confirmation from the barbershop. Payment happens at the salon.',
  };
}

/* ── Email template ──────────────────────────────────────────────────────── */
function emailHtml(b: { reference: string; name: string; service: string; date: string; time: string; payment: string; paymentUrl?: string }): string {
  const esc = (v: unknown) =>
    String(v ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
    );
  const row = (label: string, value: string) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #3a2c1c;color:#8a7a63;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #3a2c1c;color:#f3ead9;font-size:14px;text-align:right;font-weight:bold;">${value}</td>
      </tr>`;
  const payBtn = b.payment === 'online' && b.paymentUrl
    ? `<p style="margin:22px 0 0;"><a href="${esc(b.paymentUrl)}" style="display:inline-block;background:#b98a52;color:#14100c;padding:13px 26px;border-radius:10px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">Jetzt online bezahlen</a></p>`
    : `<p style="margin:22px 0 0;font-size:12px;color:#c9b99f;">Zahlung im Salon: bar oder Karte.</p>`;
  return `<!doctype html>
<html>
  <body style="margin:0;background:#14100c;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:520px;margin:0 auto;background:#1c1611;border:1px solid #b98a52;border-radius:16px;overflow:hidden;">
      <div style="background:#b98a52;padding:22px 28px;">
        <h1 style="margin:0;color:#14100c;font-size:22px;letter-spacing:2px;">✂ VIENNA CUTS</h1>
        <p style="margin:4px 0 0;color:#3a2c1c;font-size:10px;letter-spacing:4px;text-transform:uppercase;">Premium Barber Studio · Wien</p>
      </div>
      <div style="padding:28px;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#f3ead9;">Terminanfrage eingegangen</h2>
        <p style="margin:0 0 22px;font-size:13px;line-height:1.7;color:#c9b99f;">
          Hallo ${esc(b.name)}, dein Termin wurde über unseren KI-Rezeptionisten angelegt und wartet auf die Bestätigung des Barbershops.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Service', esc(b.service))}
          ${row('Datum', esc(b.date))}
          ${row('Uhrzeit', esc(b.time))}
          ${row('Referenz', esc(b.reference))}
        </table>
        ${payBtn}
        <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#c9b99f;">
          Wir freuen uns auf dich!<br />— Dein Vienna-Cuts-Team
        </p>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #3a2c1c;">
        <p style="margin:0;font-size:10px;color:#8a7a63;">Vienna Cuts — Premium Barber Studio Wien · Automatische Nachricht, bitte nicht antworten.</p>
      </div>
    </div>
  </body>
</html>`;
}

/* ── Vapi tool-call protocol handler ─────────────────────────────────────── */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const secret = process.env.VAPI_TOOL_SECRET;
  if (secret && String(req.headers['x-ai-secret'] ?? '') !== secret) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const toolCalls: any[] =
    req.body?.message?.toolCalls ?? req.body?.toolCalls ?? (Array.isArray(req.body) ? req.body : []);
  if (!toolCalls.length) {
    res.status(400).json({ error: 'no_tool_calls' });
    return;
  }

  const siteUrl = String(req.body?.call?.websiteUrl ?? '') || SITE_URL;
  const results: { toolCallId: string; result: string }[] = [];

  for (const tc of toolCalls) {
    const name: string = tc?.function?.name ?? tc?.name ?? '';
    let args: any = {};
    try {
      const raw = tc?.function?.arguments ?? tc?.arguments ?? {};
      args = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      args = {};
    }

    let out: unknown;
    try {
      if (name === 'get_services') out = toolGetServices();
      else if (name === 'check_availability') out = await toolCheckAvailability(args);
      else if (name === 'create_booking') out = await toolCreateBooking(args, siteUrl);
      else out = { ok: false, reason: 'unknown_tool', message: `unknown tool: ${name}` };
    } catch (err: any) {
      console.error('[ai-tools]', name, err?.message ?? err);
      out = { ok: false, reason: 'server', message: 'internal error' };
    }

    results.push({ toolCallId: tc?.id ?? name, result: JSON.stringify(out) });
  }

  res.status(200).json({ results });
}
