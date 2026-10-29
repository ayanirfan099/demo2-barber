/* ── Appointment store — Supabase-backed with localStorage demo fallback. ──
   If VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are set, bookings
   live in the shared Supabase database. Otherwise it falls back to the
   original per-device localStorage demo. ─────────────────────────────────── */

import {
  Appointment,
  ApptStatus,
  getService,
  minutesToTime,
  timeToMinutes,
  viennaNow,
  addDaysISO,
  HOURS,
} from './data';
import { supabase } from './supabase';

const KEY = 'vienna-cuts-appointments-v1';

/* ── Row mapping: Supabase `bookings` table ↔ Appointment ────────────────── */

interface BusyRow {
  id: string;
  service_id: string;
  barber_id: string;
  date_iso: string;
  time: string;
  status: ApptStatus;
}

interface BookingRow extends BusyRow {
  name: string;
  email: string;
  phone: string | null;
  note: string | null;
  created_at_ms: number | null;
}

const rowToAppt = (r: Partial<BookingRow> & BusyRow): Appointment => ({
  id: r.id,
  serviceId: r.service_id,
  barberId: r.barber_id,
  dateISO: r.date_iso,
  time: r.time,
  name: r.name ?? '',
  email: r.email ?? '',
  phone: r.phone ?? '',
  note: r.note ?? '',
  status: r.status,
  createdAt: Number(r.created_at_ms) || 0,
});

const apptToRow = (a: Appointment) => ({
  id: a.id,
  service_id: a.serviceId,
  barber_id: a.barberId as string,
  date_iso: a.dateISO,
  time: a.time,
  name: a.name,
  email: a.email,
  phone: a.phone,
  note: a.note,
  status: a.status,
  created_at_ms: a.createdAt,
});

/* ── Deterministic seed for the localStorage demo mode ───────────────────── */
function seedAppointments(): Appointment[] {
  const { dateISO } = viennaNow();
  const mk = (
    dayOffset: number,
    time: string,
    serviceId: string,
    barberId: Appointment['barberId'],
    name: string,
    status: ApptStatus,
    note = '',
    i = 0
  ): Appointment => ({
    id: `VC-DEMO-${1000 + dayOffset * 13 + timeToMinutes(time) + i}`,
    serviceId,
    barberId,
    dateISO: addDaysISO(dateISO, dayOffset),
    time,
    name,
    email: name.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.') + '@example.com',
    phone: '+43 6' + String(600000000 + ((dayOffset + 7 + i * 31) * 7919) % 99999999),
    note,
    status,
    createdAt: Date.now() - (dayOffset + 12) * 86400000,
    demoSeed: true,
  });

  return [
    mk(0, '09:30', 'fade', 'jonas', 'Julian Wachter', 'confirmed', 'Instagram gesehen, bitte Skin Fade.'),
    mk(0, '11:00', 'combo', 'marco', 'Tobias Reinthaler', 'completed'),
    mk(0, '13:30', 'classic', 'any', 'Maximilian Hofer', 'confirmed', 'Zum ersten Mal hier.'),
    mk(0, '15:00', 'premium', 'lena', 'Alexander Brandner', 'pending'),
    mk(0, '17:30', 'beard', 'marco', 'Sebastian Pichler', 'confirmed'),
    mk(1, '10:00', 'fade', 'david', 'Christoph Maier', 'confirmed'),
    mk(1, '12:30', 'classic', 'lena', 'Florian Krainz', 'pending', 'Haube-freundlicher Schnitt.'),
    mk(2, '09:00', 'premium', 'jonas', 'Paul Gansl', 'confirmed'),
    mk(2, '14:00', 'combo', 'marco', 'Matthias Scholz', 'confirmed'),
    mk(-1, '16:00', 'fade', 'david', 'Lukas Eder', 'completed'),
    mk(-1, '10:30', 'classic', 'jonas', 'Stefan Novak', 'completed'),
    mk(3, '11:30', 'beard', 'any', 'David Koller', 'pending'),
    mk(4, '15:30', 'combo', 'lena', 'Raphael Stockinger', 'confirmed'),
    mk(-2, '18:00', 'classic', 'marco', 'Philipp Ziegelwagner', 'canceled', 'Kunde hat abgesagt.'),
  ];
}

/* ── localStorage helpers (demo mode) ───────────────────────────────────── */

function loadLocal(): Appointment[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Appointment[];
    const seeded = seedAppointments();
    localStorage.setItem(KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return seedAppointments();
  }
}

function saveLocal(list: Appointment[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full/unavailable — in-memory state still works for the session */
  }
}

/* ── Loaders ────────────────────────────────────────────────────────────── */

/** Full appointment rows (name/email/phone/note) — for the owner dashboard (signed-in). */
export async function loadAppointments(): Promise<Appointment[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at_ms', { ascending: false });
    if (error) {
      console.error('[Vienna Cuts] loadAppointments:', error.message);
      return [];
    }
    return (data as BookingRow[]).map(rowToAppt);
  }
  return loadLocal();
}

/** Anonymously-safe load (no PII columns) — powers the availability engine. */
async function loadBusy(): Promise<Appointment[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('bookings')
      .select('id,service_id,barber_id,date_iso,time,status');
    if (error) {
      console.error('[Vienna Cuts] loadBusy:', error.message);
      return [];
    }
    return (data as BusyRow[]).map(rowToAppt);
  }
  return loadLocal();
}

/* ── Availability engine ─────────────────────────────────────────────────── */
const SLOT_STEP = 30; // minutes

function barberAvailableOnWeekday(barberId: string, weekdayIdx: number): boolean {
  // Fictional per-barber schedules (0 = Sunday)
  switch (barberId) {
    case 'jonas': return [1, 2, 3, 4, 5, 6].includes(weekdayIdx); // Mo–Sa
    case 'marco': return [1, 2, 3, 4, 5].includes(weekdayIdx);    // Mo–Fr
    case 'david': return [2, 3, 4, 5, 6].includes(weekdayIdx);    // Di–Sa
    case 'lena':  return [1, 2, 4, 5, 6].includes(weekdayIdx);    // Mo, Di, Do–Sa
    default: return true;
  }
}

export interface SlotInfo {
  time: string;
  available: boolean;
}

/** Candidate slots for a barber (or 'any') + service on a date. Past days are closed. */
function computeSlots(all: Appointment[], dateISO: string, serviceId: string, barberId: string | 'any'): SlotInfo[] {
  const { dateISO: today, minutes: nowMin } = viennaNow();
  if (dateISO < today) return [];

  const [y, m, d] = dateISO.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun
  const hours = HOURS[(weekday + 6) % 7]; // HOURS is Mon-first
  if (hours.open === null || hours.close === null) return [];

  const dur = getService(serviceId).duration;
  const openMin = hours.open * 60;
  const closeMin = hours.close * 60;

  const barbers = barberId === 'any' ? ['jonas', 'marco', 'david', 'lena'] : [barberId];
  const eligible = barbers.filter((b) => barberAvailableOnWeekday(b, weekday));
  if (eligible.length === 0) return [];

  const day = all.filter(
    (a) => a.dateISO === dateISO && a.status !== 'canceled' && eligible.includes(a.barberId as string)
  );

  // For 'any': a slot is available if at least one eligible barber is free.
  const isFree = (b: string, startMin: number, endMin: number) =>
    !day.some((a) => {
      if (a.barberId !== b) return false;
      const s = timeToMinutes(a.time);
      const e = s + getService(a.serviceId).duration;
      return startMin < e && endMin > s;
    });

  const slots: SlotInfo[] = [];
  for (let t = openMin; t + dur <= closeMin; t += SLOT_STEP) {
    if (dateISO === today && t <= nowMin + 30) continue; // need lead time
    const anyFree = eligible.some((b) => isFree(b, t, t + dur));
    slots.push({ time: minutesToTime(t), available: anyFree });
  }
  return slots;
}

export async function getSlots(dateISO: string, serviceId: string, barberId: string | 'any'): Promise<SlotInfo[]> {
  return computeSlots(await loadBusy(), dateISO, serviceId, barberId);
}

export interface NewAppointmentInput {
  serviceId: string;
  barberId: string | 'any';
  dateISO: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  note: string;
}

export type CreateResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; reason: 'conflict' | 'invalid_slot' | 'duplicate' | 'server'; message: string };

/** Server-style validated create: re-checks slot fresh at write time. */
export async function createAppointment(input: NewAppointmentInput): Promise<CreateResult> {
  const dur = getService(input.serviceId).duration;
  const start = timeToMinutes(input.time);
  const end = start + dur;

  const list = await loadBusy();

  // Duplicate submission guard (demo mode only — anon cannot read emails in Supabase mode)
  if (!supabase) {
    const dupe = list.find(
      (a) =>
        a.email.toLowerCase() === input.email.toLowerCase() &&
        a.dateISO === input.dateISO &&
        a.time === input.time &&
        Date.now() - a.createdAt < 60_000
    );
    if (dupe) return { ok: false, reason: 'duplicate', message: 'duplicate' };
  }

  // Re-validate the slot against current state (conflict prevention)
  const slot = computeSlots(list, input.dateISO, input.serviceId, input.barberId).find((s) => s.time === input.time);
  if (!slot) return { ok: false, reason: 'invalid_slot', message: 'invalid_slot' };
  if (!slot.available) return { ok: false, reason: 'conflict', message: 'conflict' };

  // For 'any', assign the first eligible barber who is free, so no overlap is recorded.
  let assignedBarber = input.barberId;
  if (input.barberId === 'any') {
    const [y, m, d] = input.dateISO.split('-').map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const busy = (b: string) =>
      list.some((a) => {
        if (a.barberId !== b || a.dateISO !== input.dateISO || a.status === 'canceled') return false;
        const s = timeToMinutes(a.time);
        const e = s + getService(a.serviceId).duration;
        return start < e && end > s;
      });
    const free = ['jonas', 'marco', 'david', 'lena'].find(
      (b) => barberAvailableOnWeekday(b, weekday) && !busy(b)
    );
    if (!free) return { ok: false, reason: 'conflict', message: 'conflict' };
    assignedBarber = free;
  }

  const appointment: Appointment = {
    id: 'VC-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10),
    ...input,
    barberId: assignedBarber,
    status: 'pending',
    createdAt: Date.now(),
  };

  if (supabase) {
    const { error } = await supabase.from('bookings').insert(apptToRow(appointment));
    if (error) {
      console.error('[Vienna Cuts] createAppointment:', error.message);
      return { ok: false, reason: 'server', message: error.message };
    }
    return { ok: true, appointment };
  }

  saveLocal([appointment, ...loadLocal()]);
  return { ok: true, appointment };
}

export async function updateAppointmentStatus(id: string, status: ApptStatus): Promise<Appointment[]> {
  if (supabase) {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) console.error('[Vienna Cuts] updateAppointmentStatus:', error.message);
    return loadAppointments();
  }
  const list = loadLocal().map((a) => (a.id === id ? { ...a, status } : a));
  saveLocal(list);
  return list;
}
