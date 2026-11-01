import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../src/lib/supabase', () => ({ supabase: null }));
import { createAppointment, getSlots, loadAppointments, updateAppointmentStatus } from '../src/lib/store';

const input = {
  serviceId: 'classic', barberId: 'jonas', dateISO: '2026-11-03', time: '09:00',
  name: 'Test Visitor', email: 'visitor@example.invalid', phone: '', note: '',
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-02T06:00:00Z'));
  localStorage.setItem('vienna-cuts-appointments-v1', '[]');
});

describe('local demonstration booking integrity', () => {
  it('rejects closed Sundays and past dates', async () => {
    expect(await getSlots('2026-11-08', 'classic', 'jonas')).toEqual([]);
    expect(await getSlots('2026-11-01', 'classic', 'jonas')).toEqual([]);
    expect(await createAppointment({ ...input, dateISO: '2026-11-08' }))
      .toMatchObject({ ok: false, reason: 'invalid_slot' });
  });
  it('blocks overlapping appointments and releases canceled slots', async () => {
    const first = await createAppointment(input);
    expect(first.ok).toBe(true);
    expect(await createAppointment({ ...input, time: '09:30', email: 'other@example.invalid' }))
      .toMatchObject({ ok: false, reason: 'conflict' });
    if (!first.ok) throw new Error('Expected initial booking');
    await updateAppointmentStatus(first.appointment.id, 'canceled');
    expect(await createAppointment({ ...input, time: '09:30', email: 'other@example.invalid' }))
      .toMatchObject({ ok: true });
  });
  it('rejects duplicate submissions and assigns any-barber bookings to a free barber', async () => {
    expect(await createAppointment(input)).toMatchObject({ ok: true });
    expect(await createAppointment(input)).toMatchObject({ ok: false, reason: 'duplicate' });
    const next = await createAppointment({ ...input, barberId: 'any', email: 'other@example.invalid' });
    expect(next).toMatchObject({ ok: true });
    if (next.ok) expect(next.appointment.barberId).not.toBe('jonas');
    expect(await loadAppointments()).toHaveLength(2);
    expect(fetch).not.toHaveBeenCalled();
  });
});
