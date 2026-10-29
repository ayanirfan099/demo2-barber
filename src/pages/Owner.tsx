import { useEffect, useMemo, useState } from 'react';
import {
  Lock, LogOut, LayoutDashboard, CalendarDays, Table2, Search, Check, X, CheckCheck,
  ChevronLeft, ChevronRight, Users, Euro, CalendarClock, Inbox, Trash2, ShieldAlert,
} from 'lucide-react';
import { useApp } from '../lib/app-context';
import { BARBERS, SERVICES, Appointment, ApptStatus, getService, getBarber, viennaNow, addDaysISO, timeToMinutes } from '../lib/data';
import { loadAppointments, updateAppointmentStatus } from '../lib/store';
import { supabase } from '../lib/supabase';
import { StatusPill, Kicker } from '../components/Shared';
import Logo from '../components/Logo';

const AUTH_KEY = 'vienna-cuts-owner-session';
const DEMO_PASSWORD = 'vienna2026';

function useOwnerAuth() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    if (!supabase) {
      try {
        setAuthed(sessionStorage.getItem(AUTH_KEY) === '1');
      } catch {
        setAuthed(false);
      }
      return;
    }
    // Supabase Auth: session check + live updates
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { authed, setAuthed };
}

export default function Owner() {
  const { authed, setAuthed } = useOwnerAuth();
  const [view, setView] = useState<'overview' | 'appointments' | 'calendar'>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (authed) loadAppointments().then(setAppointments);
  }, [authed]);

  const refresh = () => {
    loadAppointments().then(setAppointments);
  };

  if (authed === null) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-ink pt-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-copper/30 border-t-copper" aria-hidden />
      </div>
    );
  }
  if (!authed) return <OwnerLogin onSuccess={() => setAuthed(true)} />;

  return <OwnerDashboard view={view} setView={setView} appointments={appointments} refresh={refresh} onLogout={async () => {
    if (supabase) await supabase.auth.signOut();
    else { try { sessionStorage.removeItem(AUTH_KEY); } catch {} }
    setAuthed(false);
  }} />;
}

/* ════════ LOGIN ════════ */
function OwnerLogin({ onSuccess }: { onSuccess: () => void }) {
  const { t, lang } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    if (supabase) {
      // Real auth: email + password checked server-side (Supabase Auth)
      const { error: signErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signErr) {
        setError(t('admin.login.err'));
        setBusy(false);
      } else {
        onSuccess();
      }
      return;
    }
    window.setTimeout(() => {
      if (password === DEMO_PASSWORD) {
        try { sessionStorage.setItem(AUTH_KEY, '1'); } catch {}
        onSuccess();
      } else {
        setError(t('admin.login.err'));
        setBusy(false);
      }
    }, 500);
  };

  return (
    <div className="dot-grid flex min-h-[100svh] items-center justify-center bg-ink px-4 pt-24">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-copper/25 bg-gradient-to-b from-ink-2 to-ink-3 p-8 shadow-card sm:p-10">
          <Logo size={52} />
          <h1 className="mt-5 font-display text-3xl font-black text-ivory">{t('admin.login.title')}</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-taupe-2">{t('admin.login.sub')}</p>

          <form onSubmit={submit} className="mt-7">
            {supabase && (
              <>
                <label htmlFor="owner-email" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-taupe-2">{lang === 'de' ? 'E-Mail' : 'Email'}</label>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-taupe-2" aria-hidden />
                  <input
                    id="owner-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    className="h-12 w-full rounded-xl border border-white/10 bg-ink py-2 pl-11 pr-4 text-sm text-ivory outline-none transition-colors placeholder:text-taupe focus:border-copper"
                    placeholder="admin@example.com"
                  />
                </div>
                <label htmlFor="owner-pw" className="mb-1.5 mt-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-taupe-2">{lang === 'de' ? 'Passwort' : 'Password'}</label>
              </>
            )}
            {!supabase && (
              <label htmlFor="owner-pw" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-taupe-2">{t('admin.login.label')}</label>
            )}
            <div className="relative">
              <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-taupe-2" aria-hidden />
              <input
                id="owner-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                className="h-12 w-full rounded-xl border border-white/10 bg-ink py-2 pl-11 pr-4 text-sm text-ivory outline-none transition-colors placeholder:text-taupe focus:border-copper"
                placeholder="••••••••••"
                aria-invalid={!!error}
                aria-describedby={error ? 'pw-err' : undefined}
              />
            </div>
            {error && <p id="pw-err" role="alert" className="mt-2 text-[11px] font-medium text-red-400">{error}</p>}
            <button type="submit" disabled={busy || !password || (!!supabase && !email.trim())} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-copper text-xs font-bold uppercase tracking-[0.2em] text-ink transition-all hover:bg-copper-2 disabled:opacity-50">
              {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden /> : <Lock size={15} aria-hidden />}
              {t('admin.login.btn')}
            </button>
            <p className="mt-3 text-center font-mono text-[11px] text-copper-2/80">
              {supabase
                ? (lang === 'de' ? 'Anmeldung mit deinem Admin-Konto (Supabase Auth).' : 'Sign in with your admin account (Supabase Auth).')
                : t('admin.login.hint')}
            </p>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/8 p-3">
            <ShieldAlert size={15} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />
            <p className="text-[10px] leading-relaxed text-amber-200/85">
              {supabase
                ? (lang === 'de' ? 'Sicher: Das Login läuft über Supabase Auth (E-Mail + Passwort) und wird serverseitig geprüft.' : 'Secure: login runs through Supabase Auth (email + password) and is verified server-side.')
                : t('admin.login.secure')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════ DASHBOARD SHELL ════════ */
function OwnerDashboard({ view, setView, appointments, refresh, onLogout }: {
  view: 'overview' | 'appointments' | 'calendar';
  setView: (v: 'overview' | 'appointments' | 'calendar') => void;
  appointments: Appointment[];
  refresh: () => void;
  onLogout: () => void;
}) {
  const { t, lang, toast } = useApp();
  const { dateISO: todayISO } = viennaNow();

  const act = async (id: string, status: ApptStatus) => {
    await updateAppointmentStatus(id, status);
    refresh();
    toast(status === 'confirmed' ? t('toast.confirmed') : status === 'canceled' ? t('toast.canceled') : t('toast.completed'), 'success');
  };

  const tabs = [
    { id: 'overview' as const, label: t('admin.overview'), icon: LayoutDashboard },
    { id: 'appointments' as const, label: t('admin.appointments'), icon: Table2 },
    { id: 'calendar' as const, label: t('admin.calendar'), icon: CalendarDays },
  ];

  return (
    <div className="min-h-[100svh] bg-ink pt-[4.6rem] sm:pt-20">
      {/* Sub-header */}
      <div className="sticky top-[4.6rem] z-30 border-b border-copper/15 bg-ink/95 backdrop-blur-xl sm:top-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-copper/15 font-display text-[11px] font-black text-copper-2">VC</span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-sm font-bold text-ivory">{t('admin.title')} <span className="text-copper-2">· Demo</span></p>
              <p className="hidden truncate text-[9px] uppercase tracking-[0.2em] text-taupe-2 sm:block">{t('admin.demo.note')}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <nav className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-1" aria-label="Dashboard views">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  aria-pressed={view === id}
                  aria-label={label}
                  className={`flex h-9 items-center gap-1.5 rounded-lg px-2 text-[11px] font-bold transition-all sm:px-3 ${
                    view === id ? 'bg-copper text-ink' : 'text-ivory-3 hover:text-ivory'
                  }`}
                >
                  <Icon size={15} aria-hidden />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
            <button onClick={onLogout} aria-label={t('admin.logout')} title={t('admin.logout')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ivory-3 transition-colors hover:border-red-400/50 hover:text-red-300">
              <LogOut size={16} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {view === 'overview' && <Overview appointments={appointments} todayISO={todayISO} act={act} goAppointments={() => setView('appointments')} />}
        {view === 'appointments' && <AppointmentsTable appointments={appointments} act={act} />}
        {view === 'calendar' && <OwnerCalendar appointments={appointments} todayISO={todayISO} act={act} />}
      </div>
    </div>
  );
}

const statusLabel = (s: ApptStatus, lang: 'de' | 'en') =>
  ({ pending: lang === 'de' ? 'Offen' : 'Pending', confirmed: lang === 'de' ? 'Bestätigt' : 'Confirmed', completed: lang === 'de' ? 'Erledigt' : 'Completed', canceled: lang === 'de' ? 'Storniert' : 'Canceled' })[s];

/* ════════ OVERVIEW ════════ */
function Overview({ appointments, todayISO, act, goAppointments }: {
  appointments: Appointment[];
  todayISO: string;
  act: (id: string, status: ApptStatus) => void;
  goAppointments: () => void;
}) {
  const { t, lang } = useApp();
  const { minutes: nowMin } = viennaNow();
  const active = appointments.filter((a) => a.status !== 'canceled');
  const today = active.filter((a) => a.dateISO === todayISO).sort((a, b) => a.time.localeCompare(b.time));
  const upcoming = active.filter((a) => a.dateISO > todayISO || (a.dateISO === todayISO && timeToMinutes(a.time) >= nowMin)).filter((a) => a.status === 'confirmed' || a.status === 'pending');
  const pending = appointments.filter((a) => a.status === 'pending');
  const confirmed = appointments.filter((a) => a.status === 'confirmed');
  const completed = appointments.filter((a) => a.status === 'completed');
  const canceled = appointments.filter((a) => a.status === 'canceled');
  const revenue = completed.reduce((sum, a) => sum + getService(a.serviceId).price, 0);
  const utilization = Math.min(100, Math.round((today.length / 14) * 100));

  const kpis = [
    { label: t('admin.today'), value: today.length, icon: CalendarClock, tone: 'text-copper-2' },
    { label: t('admin.upcoming'), value: upcoming.length, icon: Users, tone: 'text-sky-300' },
    { label: t('admin.pending'), value: pending.length, icon: Inbox, tone: 'text-amber-300' },
    { label: t('admin.confirmed'), value: confirmed.length, icon: Check, tone: 'text-emerald-300' },
    { label: t('admin.completed'), value: completed.length, icon: CheckCheck, tone: 'text-ivory-2' },
    { label: t('admin.canceled'), value: canceled.length, icon: X, tone: 'text-red-300' },
    { label: t('admin.revenue'), value: `€${revenue}`, icon: Euro, tone: 'text-copper-2' },
    { label: t('admin.utilization'), value: `${utilization}%`, icon: LayoutDashboard, tone: 'text-violet-300' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-ink-2 p-4">
            <Icon size={17} className={tone} aria-hidden />
            <p className="mt-2 font-display text-2xl font-black text-ivory sm:text-3xl">{value}</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-taupe-2 sm:text-[10px]">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        {/* Today's list */}
        <section className="rounded-2xl border border-white/8 bg-ink-2 p-5 sm:p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ivory">{t('admin.todayList')} <span className="text-taupe-2">· {today.length}</span></h2>
            <button onClick={goAppointments} className="text-[11px] font-bold uppercase tracking-widest text-copper-2 hover:text-ivory">{t('admin.appointments')} →</button>
          </div>
          {today.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <CalendarClock size={36} className="text-taupe" aria-hidden />
              <p className="text-sm text-ivory-3">{t('admin.noToday')}</p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-white/6">
              {today.map((a) => {
                const s = getService(a.serviceId);
                const b = a.barberId === 'any' ? null : getBarber(a.barberId);
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <span className="w-12 shrink-0 font-mono text-sm font-bold text-copper-2">{a.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ivory">{a.name}</p>
                      <p className="truncate text-[10px] text-taupe-2">{s.name[lang]} · {b ? b.name.split(' ')[0] : (lang === 'de' ? 'Egal' : 'Any')}</p>
                    </div>
                    <StatusPill status={a.status} labels={{ pending: statusLabel('pending', lang), confirmed: statusLabel('confirmed', lang), completed: statusLabel('completed', lang), canceled: statusLabel('canceled', lang) }} />
                    <div className="flex shrink-0 gap-1">
                      {a.status === 'pending' && (
                        <button onClick={() => act(a.id, 'confirmed')} aria-label={t('admin.confirm')} title={t('admin.confirm')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 text-emerald-300 transition-colors hover:bg-emerald-400/15"><Check size={15} aria-hidden /></button>
                      )}
                      {a.status === 'confirmed' && (
                        <button onClick={() => act(a.id, 'completed')} aria-label={t('admin.complete')} title={t('admin.complete')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/30 text-sky-300 transition-colors hover:bg-sky-400/15"><CheckCheck size={15} aria-hidden /></button>
                      )}
                      {a.status !== 'canceled' && a.status !== 'completed' && (
                        <button onClick={() => act(a.id, 'canceled')} aria-label={t('admin.cancel')} title={t('admin.cancel')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/30 text-red-300 transition-colors hover:bg-red-400/15"><X size={15} aria-hidden /></button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Weekly occupancy */}
        <section className="rounded-2xl border border-white/8 bg-ink-2 p-5 sm:p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-bold text-ivory">{lang === 'de' ? 'Nächste 7 Tage' : 'Next 7 days'}</h2>
          <div className="mt-4 space-y-2">
            {Array.from({ length: 7 }, (_, i) => {
              const iso = addDaysISO(todayISO, i);
              const [y, m, d] = iso.split('-').map(Number);
              const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
              const closed = wd === 0; // Sunday closed
              const count = appointments.filter((a) => a.dateISO === iso && a.status !== 'canceled').length;
              const pct = Math.min(100, (count / 12) * 100);
              const dayName = new Intl.DateTimeFormat(lang === 'de' ? 'de-AT' : 'en-GB', { weekday: 'short', day: 'numeric' }).format(new Date(Date.UTC(y, m - 1, d)));
              return (
                <div key={iso} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-[11px] font-semibold capitalize text-ivory-3">{dayName}</span>
                  <div className="h-5 flex-1 overflow-hidden rounded-full bg-ink-4">
                    <div className="h-full rounded-full bg-gradient-to-r from-copper-3 to-copper-2 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono text-[11px] font-bold text-taupe-2">{closed && count === 0 ? '–' : count}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[9px] uppercase tracking-[0.2em] text-taupe">{lang === 'de' ? 'Auslastung basierend auf Demo-Terminen' : 'Occupancy based on demo appointments'}</p>
        </section>
      </div>
    </div>
  );
}

/* ════════ APPOINTMENTS TABLE ════════ */
function AppointmentsTable({ appointments, act }: {
  appointments: Appointment[];
  act: (id: string, status: ApptStatus) => void;
}) {
  const { t, lang } = useApp();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ApptStatus>('all');
  const [barber, setBarber] = useState<'all' | string>('all');
  const [date, setDate] = useState('');
  const [detail, setDetail] = useState<Appointment | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return appointments
      .filter((a) => (status === 'all' || a.status === status))
      .filter((a) => (barber === 'all' || a.barberId === barber))
      .filter((a) => (!date || a.dateISO === date))
      .filter((a) => !q || [a.name, a.email, a.id, a.phone].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => (b.dateISO + b.time).localeCompare(a.dateISO + a.time));
  }, [appointments, query, status, barber, date]);

  const reset = () => { setQuery(''); setStatus('all'); setBarber('all'); setDate(''); };
  const statusLbl = { pending: statusLabel('pending', lang), confirmed: statusLabel('confirmed', lang), completed: statusLabel('completed', lang), canceled: statusLabel('canceled', lang) };

  return (
    <div>
      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe-2" aria-hidden />
          <span className="sr-only">{t('admin.search')}</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('admin.search')} className="h-11 w-full rounded-xl border border-white/10 bg-ink-2 pl-10 pr-3 text-sm text-ivory placeholder:text-taupe outline-none focus:border-copper" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | ApptStatus)} aria-label={t('admin.filter.status')} className="h-11 rounded-xl border border-white/10 bg-ink-2 px-3 text-sm text-ivory outline-none focus:border-copper">
          <option value="all">{t('admin.filter.status')}: {t('admin.filter.all')}</option>
          {(['pending', 'confirmed', 'completed', 'canceled'] as ApptStatus[]).map((s) => (
            <option key={s} value={s}>{statusLbl[s]}</option>
          ))}
        </select>
        <select value={barber} onChange={(e) => setBarber(e.target.value)} aria-label={t('admin.filter.barber')} className="h-11 rounded-xl border border-white/10 bg-ink-2 px-3 text-sm text-ivory outline-none focus:border-copper">
          <option value="all">{t('admin.filter.barber')}: {t('admin.filter.all')}</option>
          {BARBERS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label={t('admin.filter.date')} className="h-11 rounded-xl border border-white/10 bg-ink-2 px-3 text-sm text-ivory outline-none focus:border-copper" />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-ink-3 text-[10px] font-bold uppercase tracking-[0.18em] text-taupe-2">
              <tr>
                <th scope="col" className="px-4 py-3">{t('admin.col.datetime')}</th>
                <th scope="col" className="px-4 py-3">{t('admin.col.customer')}</th>
                <th scope="col" className="px-4 py-3">{t('admin.col.service')}</th>
                <th scope="col" className="px-4 py-3">{t('admin.col.barber')}</th>
                <th scope="col" className="px-4 py-3">{t('admin.col.status')}</th>
                <th scope="col" className="px-4 py-3 text-right">{t('admin.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6 bg-ink-2">
              {filtered.map((a) => {
                const s = getService(a.serviceId);
                const b = a.barberId === 'any' ? null : getBarber(a.barberId);
                return (
                  <tr key={a.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <button onClick={() => setDetail(a)} className="text-left">
                        <span className="block font-mono text-xs font-bold text-copper-2">{a.time}</span>
                        <span className="text-[11px] text-ivory-3">{new Intl.DateTimeFormat(lang === 'de' ? 'de-AT' : 'en-GB', { day: '2-digit', month: 'short' }).format(new Date(a.dateISO + 'T00:00:00Z'))}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ivory">{a.name}</p>
                      <p className="text-[10px] text-taupe-2">{a.id}</p>
                    </td>
                    <td className="px-4 py-3 text-ivory-2">{s.name[lang]}<span className="block text-[10px] text-taupe-2">€{s.price} · {s.duration}′</span></td>
                    <td className="px-4 py-3 text-ivory-2">{b ? b.name.split(' ')[0] : lang === 'de' ? 'Egal' : 'Any'}</td>
                    <td className="px-4 py-3"><StatusPill status={a.status} labels={statusLbl} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {a.status === 'pending' && <button onClick={() => act(a.id, 'confirmed')} title={t('admin.confirm')} aria-label={t('admin.confirm')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/15"><Check size={15} aria-hidden /></button>}
                        {a.status === 'confirmed' && <button onClick={() => act(a.id, 'completed')} title={t('admin.complete')} aria-label={t('admin.complete')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/30 text-sky-300 hover:bg-sky-400/15"><CheckCheck size={15} aria-hidden /></button>}
                        {a.status !== 'canceled' && a.status !== 'completed' && <button onClick={() => act(a.id, 'canceled')} title={t('admin.cancel')} aria-label={t('admin.cancel')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/30 text-red-300 hover:bg-red-400/15"><X size={15} aria-hidden /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Trash2 size={30} className="text-taupe" aria-hidden />
                    <p className="text-sm text-ivory-3">{t('admin.empty')}</p>
                    <button onClick={reset} className="h-10 rounded-xl border border-copper/50 px-5 text-[11px] font-bold uppercase tracking-widest text-copper-2 hover:bg-copper hover:text-ink">{t('admin.reset')}</button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div role="dialog" aria-modal="true" aria-label={detail.name} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" onClick={() => setDetail(null)}>
          <div className="w-full max-w-md rounded-t-3xl border border-copper/25 bg-ink-2 p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-taupe-2">{detail.id}{detail.demoSeed ? ' · DEMO' : ''}</p>
                <h3 className="mt-1 font-display text-2xl font-bold text-ivory">{detail.name}</h3>
              </div>
              <button onClick={() => setDetail(null)} aria-label={t('common.close')} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-ivory-3"><X size={18} aria-hidden /></button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                [lang === 'de' ? 'E-Mail' : 'Email', detail.email],
                [lang === 'de' ? 'Telefon' : 'Phone', detail.phone],
                [t('admin.col.service'), `${getService(detail.serviceId).name[lang]} · €${getService(detail.serviceId).price} · ${getService(detail.serviceId).duration}′`],
                [t('admin.col.barber'), detail.barberId === 'any' ? t('book.anyone') : getBarber(detail.barberId)?.name ?? ''],
                [lang === 'de' ? 'Termin' : 'Slot', `${detail.dateISO} · ${detail.time}`],
                [t('admin.col.status'), statusLabel(detail.status, lang)],
                ...(detail.note ? [[lang === 'de' ? 'Notiz' : 'Note', detail.note]] : []),
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between gap-4 border-b border-white/6 pb-2">
                  <dt className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-taupe-2">{k}</dt>
                  <dd className="text-right text-ivory-2">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex gap-2">
              {detail.status === 'pending' && <button onClick={() => { act(detail.id, 'confirmed'); setDetail(null); }} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-xs font-bold uppercase tracking-widest text-ink"><Check size={15} aria-hidden />{t('admin.confirm')}</button>}
              {detail.status === 'confirmed' && <button onClick={() => { act(detail.id, 'completed'); setDetail(null); }} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-400 text-xs font-bold uppercase tracking-widest text-ink"><CheckCheck size={15} aria-hidden />{t('admin.complete')}</button>}
              {detail.status !== 'canceled' && detail.status !== 'completed' && <button onClick={() => { act(detail.id, 'canceled'); setDetail(null); }} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/40 text-xs font-bold uppercase tracking-widest text-red-300 hover:bg-red-400/10"><X size={15} aria-hidden />{t('admin.cancel')}</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════ CALENDAR (day / week) ════════ */
function OwnerCalendar({ appointments, todayISO, act }: {
  appointments: Appointment[];
  todayISO: string;
  act: (id: string, status: ApptStatus) => void;
}) {
  const { t, lang } = useApp();
  const [mode, setMode] = useState<'week' | 'day'>('week');
  const [anchor, setAnchor] = useState(() => {
    const [y, m, d] = todayISO.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  });
  const [barberFilter, setBarberFilter] = useState<'all' | string>('all');
  const [selected, setSelected] = useState<Appointment | null>(null);

  const isoOf = (d: Date) => d.toISOString().slice(0, 10);
  const days: Date[] = useMemo(() => {
    if (mode === 'day') return [anchor];
    const wd = (anchor.getUTCDay() + 6) % 7;
    const monday = new Date(anchor);
    monday.setUTCDate(anchor.getUTCDate() - wd);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      return d;
    });
  }, [anchor, mode]);

  const visible = appointments.filter((a) => barberFilter === 'all' || a.barberId === barberFilter);
  const shift = (dir: 1 | -1) => {
    const d = new Date(anchor);
    d.setUTCDate(anchor.getUTCDate() + dir * (mode === 'week' ? 7 : 1));
    setAnchor(d);
  };
  const statusLbl = { pending: statusLabel('pending', lang), confirmed: statusLabel('confirmed', lang), completed: statusLabel('completed', lang), canceled: statusLabel('canceled', lang) };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} aria-label={t('admin.prev')} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-ivory hover:border-copper hover:text-copper-2"><ChevronLeft size={18} aria-hidden /></button>
          <button onClick={() => setAnchor(new Date(Date.UTC(Number(todayISO.slice(0, 4)), Number(todayISO.slice(5, 7)) - 1, Number(todayISO.slice(8, 10)))))} className="h-10 rounded-lg border border-copper/40 px-4 text-[11px] font-bold uppercase tracking-widest text-copper-2 hover:bg-copper hover:text-ink">{t('admin.today')}</button>
          <button onClick={() => shift(1)} aria-label={t('admin.next')} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-ivory hover:border-copper hover:text-copper-2"><ChevronRight size={18} aria-hidden /></button>
        </div>
        <div className="flex items-center gap-2">
          <select value={barberFilter} onChange={(e) => setBarberFilter(e.target.value)} aria-label={t('admin.filter.barber')} className="h-10 rounded-lg border border-white/10 bg-ink-2 px-3 text-xs font-semibold text-ivory outline-none focus:border-copper">
            <option value="all">{t('admin.filter.barber')}: {t('admin.filter.all')}</option>
            {BARBERS.map((b) => <option key={b.id} value={b.id}>{b.name.split(' ')[0]}</option>)}
          </select>
          <div className="flex rounded-lg border border-white/10 p-1" role="group" aria-label="Calendar mode">
            {(['week', 'day'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className={`h-8 rounded-md px-4 text-[11px] font-bold uppercase tracking-widest transition-all ${mode === m ? 'bg-copper text-ink' : 'text-ivory-3'}`}>{t(`admin.${m}`)}</button>
            ))}
          </div>
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${mode === 'week' ? 'grid-cols-1 sm:grid-cols-7' : 'grid-cols-1'}`}>
        {days.map((d) => {
          const iso = isoOf(d);
          const isToday = iso === todayISO;
          const dayAppts = visible.filter((a) => a.dateISO === iso).sort((a, b) => a.time.localeCompare(b.time));
          const wd = d.getUTCDay();
          const closed = wd === 0;
          return (
            <div key={iso} className={`rounded-2xl border p-3 ${isToday ? 'border-copper/50 bg-copper/[0.06]' : 'border-white/8 bg-ink-2'} ${mode === 'day' ? 'min-h-[60svh]' : 'min-h-[220px]'}`}>
              <div className="flex items-baseline justify-between border-b border-white/8 pb-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ivory-3">
                  {new Intl.DateTimeFormat(lang === 'de' ? 'de-AT' : 'en-GB', { weekday: 'short', day: 'numeric' }).format(d)}
                </p>
                {isToday && <span className="text-[8px] font-black uppercase tracking-[0.2em] text-copper-2">{t('admin.today')}</span>}
                {closed && <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-taupe">{lang === 'de' ? 'Geschl.' : 'Closed'}</span>}
              </div>
              <div className="mt-2 space-y-1.5">
                {dayAppts.map((a) => {
                  const svc = getService(a.serviceId);
                  const canceled = a.status === 'canceled';
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className={`block w-full rounded-lg border px-2 py-1.5 text-left transition-all ${
                        canceled ? 'border-white/5 opacity-40' : a.status === 'completed' ? 'border-sky-400/20 bg-sky-400/8' : a.status === 'confirmed' ? 'border-emerald-400/25 bg-emerald-400/8' : 'border-amber-400/25 bg-amber-400/8 hover:border-copper/50'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] font-bold text-copper-2">{a.time}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" style={{ color: a.status === 'pending' ? '#fbbf24' : a.status === 'confirmed' ? '#34d399' : a.status === 'completed' ? '#38bdf8' : '#f87171' }} />
                      </span>
                      <span className="block truncate text-[10px] font-semibold text-ivory">{a.name.split(' ')[0]} {a.name.split(' ')[1]?.[0] ?? ''}.</span>
                      <span className="block truncate text-[8px] uppercase tracking-wide text-taupe-2">{svc.name[lang]}</span>
                    </button>
                  );
                })}
                {dayAppts.length === 0 && <p className="py-4 text-center text-[10px] text-taupe/70">—</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected appointment panel */}
      {selected && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm rounded-t-3xl border border-copper/25 bg-ink-2 p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-widest text-taupe-2">{selected.id}</p>
              <button onClick={() => setSelected(null)} aria-label={t('common.close')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ivory-3"><X size={16} aria-hidden /></button>
            </div>
            <h3 className="mt-2 font-display text-xl font-bold text-ivory">{selected.name}</h3>
            <p className="mt-1 text-sm text-ivory-3">{getService(selected.serviceId).name[lang]} · {selected.time} · €{getService(selected.serviceId).price}</p>
            <div className="mt-2"><StatusPill status={selected.status} labels={statusLbl} /></div>
            <div className="mt-4 flex gap-2">
              {selected.status === 'pending' && <button onClick={() => { act(selected.id, 'confirmed'); setSelected(null); }} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-xs font-bold uppercase tracking-widest text-ink"><Check size={15} aria-hidden />{t('admin.confirm')}</button>}
              {selected.status === 'confirmed' && <button onClick={() => { act(selected.id, 'completed'); setSelected(null); }} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-400 text-xs font-bold uppercase tracking-widest text-ink"><CheckCheck size={15} aria-hidden />{t('admin.complete')}</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
