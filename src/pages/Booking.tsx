import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check, ChevronLeft, ChevronRight, Clock, CalendarCheck, Scissors, User, Users,
  AlertCircle, CheckCircle2, Loader2, BadgeCheck, Sparkles, Info,
} from 'lucide-react';
import { useApp } from '../lib/app-context';
import { SERVICES, BARBERS, getService, getBarber, HOURS, viennaNow, addDaysISO } from '../lib/data';
import { createAppointment, getSlots } from '../lib/store';
import { Kicker } from '../components/Shared';
import Logo from '../components/Logo';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-.\s\d]{6,20}$/;
const DRAFT_KEY = 'vienna-cuts-booking-draft';

function dateLabel(iso: string, lang: 'de' | 'en') {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(lang === 'de' ? 'de-AT' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export default function Booking() {
  const { t, lang, toast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const prefill = (location.state as { serviceId?: string; barberId?: string } | null) ?? null;

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(prefill?.serviceId ?? null);
  const [barberId, setBarberId] = useState<string | 'any' | null>(prefill?.barberId ?? null);
  const [dateISO, setDateISO] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [doneRef, setDoneRef] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const { dateISO: today } = viennaNow();
    const [y, m] = today.split('-').map(Number);
    return { y, m: m - 1 };
  });

  /* Restore draft once (but never a dead "done" state) */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.serviceId && !prefill?.serviceId) setServiceId(d.serviceId);
        if (d.barberId && !prefill?.barberId) setBarberId(d.barberId);
        if (d.dateISO) setDateISO(d.dateISO);
        if (d.time) setTime(d.time);
        if (d.name) setName(d.name);
        if (d.email) setEmail(d.email);
        if (d.phone) setPhone(d.phone);
        if (d.note) setNote(d.note);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Persist draft on every change */
  useEffect(() => {
    if (doneRef) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ serviceId, barberId, dateISO, time, name, email, phone, note }));
    } catch { /* ignore */ }
  }, [serviceId, barberId, dateISO, time, name, email, phone, note, doneRef]);

  const service = serviceId ? getService(serviceId) : null;
  const barber = barberId ? getBarber(barberId) : null;

  /* ── Calendar model ── */
  const { dateISO: todayISO } = viennaNow();
  const calCells = useMemo(() => {
    const first = new Date(Date.UTC(viewMonth.y, viewMonth.m, 1));
    const startWeekday = (first.getUTCDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(Date.UTC(viewMonth.y, viewMonth.m + 1, 0)).getUTCDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(`${viewMonth.y}-${String(viewMonth.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return cells;
  }, [viewMonth]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(lang === 'de' ? 'de-AT' : 'en-GB', { month: 'long', year: 'numeric' }).format(new Date(Date.UTC(viewMonth.y, viewMonth.m, 1))),
    [viewMonth, lang]
  );
  const canGoPrev = (() => {
    const [ty, tm] = todayISO.split('-').map(Number);
    return viewMonth.y > ty || (viewMonth.y === ty && viewMonth.m > tm - 1);
  })();

  const slots = useMemo(
    () => (dateISO && serviceId && barberId ? getSlots(dateISO, serviceId, barberId) : []),
    [dateISO, serviceId, barberId]
  );
  const dateClosed = (() => {
    if (!dateISO) return false;
    const [y, m, d] = dateISO.split('-').map(Number);
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return HOURS[(wd + 6) % 7].open === null;
  })();

  const pickDate = (iso: string) => {
    setDateISO(iso);
    setTime(null);
    setSubmitError(null);
  };

  const validateDetails = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = t('book.err.name');
    if (!EMAIL_RE.test(email.trim())) next.email = t('book.err.email');
    if (!PHONE_RE.test(phone.trim())) next.phone = t('book.err.phone');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!serviceId || !barberId || !dateISO || !time) return;
    if (!validateDetails()) return;
    setSaving(true);
    setSubmitError(null);
    window.setTimeout(() => {
      const result = createAppointment({ serviceId, barberId, dateISO, time, name: name.trim(), email: email.trim(), phone: phone.trim(), note: note.trim() });
      setSaving(false);
      if (result.ok) {
        setDoneRef(result.appointment.id);
        try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        toast(t('toast.saved'), 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(result.reason === 'conflict' ? t('book.conflict') : result.reason === 'duplicate' ? t('book.duplicate') : t('book.invalid'));
        if (result.reason === 'conflict') {
          setTime(null);
          setStep(3);
        }
      }
    }, 650);
  };

  const resetAll = () => {
    setDoneRef(null);
    setServiceId(null);
    setBarberId(null);
    setDateISO(null);
    setTime(null);
    setName(''); setEmail(''); setPhone(''); setNote(''); setErrors({}); setStep(1);
  };

  const stepDefs = [
    { n: 1, label: t('book.step1') },
    { n: 2, label: t('book.step2') },
    { n: 3, label: t('book.step3') },
    { n: 4, label: t('book.step4') },
  ];

  const inputCls = (invalid?: string) =>
    `h-11 w-full rounded-xl border bg-ink-3 px-4 text-sm text-ivory placeholder:text-taupe outline-none transition-colors focus:border-copper ${invalid ? 'border-red-400/60' : 'border-white/10'}`;

  /* ════════ CONFIRMATION SCREEN ════════ */
  if (doneRef) {
    return (
      <div className="flex min-h-[90svh] items-center justify-center bg-ink px-5 pt-24 sm:pt-28">
        <div className="animate-fade-up w-full max-w-lg rounded-3xl border border-copper/30 bg-gradient-to-b from-ink-2 to-ink-3 p-8 text-center shadow-card sm:p-12">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 16 }}>
            <CheckCircle2 size={64} className="mx-auto text-copper-2" aria-hidden />
          </motion.div>
          <h1 className="mt-6 font-display text-4xl font-black text-ivory">{t('book.done.title')}</h1>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-copper/35 bg-copper/10 px-4 py-1.5 font-mono text-sm font-bold tracking-wider text-copper-2">
            <BadgeCheck size={15} aria-hidden /> {t('book.done.ref')}: {doneRef}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-left text-sm">
            {[
              [t('book.step1'), service?.name[lang] + ` · €${service?.price}`],
              [t('book.step2'), barberId === 'any' ? t('book.anyone') : barber?.name],
              [t('book.step3'), dateISO ? dateLabel(dateISO, lang) : ''],
              [lang === 'de' ? 'Uhrzeit' : 'Time', `${time} · ${service?.duration} ${t('common.min')}`],
            ].map(([k, v]) => (
              <div key={String(k)} className="rounded-xl border border-white/8 bg-ink p-3">
                <dt className="text-[9px] font-bold uppercase tracking-[0.2em] text-taupe-2">{k}</dt>
                <dd className="mt-1 font-semibold text-ivory">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs leading-relaxed text-ivory-3">{t('book.done.text')}</p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button onClick={resetAll} className="h-11 rounded-xl border border-copper/50 px-6 text-xs font-bold uppercase tracking-widest text-copper-2 transition-colors hover:bg-copper hover:text-ink">
              {t('book.done.again')}
            </button>
            <Link to="/" className="flex h-11 items-center justify-center rounded-xl bg-copper px-6 text-xs font-bold uppercase tracking-widest text-ink transition-colors hover:bg-copper-2">
              {t('book.done.overview')}
            </Link>
          </div>
          <button onClick={() => navigate('/inhaber')} className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe-2 underline-offset-4 hover:text-copper-2 hover:underline">
            {lang === 'de' ? 'Zum Inhaber-Dashboard (Demo)' : 'Open owner dashboard (demo)'}
          </button>
        </div>
      </div>
    );
  }

  const canNext = step === 1 ? !!serviceId : step === 2 ? !!barberId : step === 3 ? !!(dateISO && time) : true;

  return (
    <div className="min-h-[100svh] bg-ink pt-24 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
          <div>
            <Kicker>{t('book.kicker')}</Kicker>
            <h1 className="font-display text-4xl font-black tracking-tight text-ivory sm:text-5xl">{t('book.title')}</h1>
          </div>
          <p className="flex max-w-[240px] items-center gap-1.5 text-[10px] leading-snug text-taupe-2"><Info size={13} className="shrink-0" aria-hidden />{t('book.demo')}</p>
        </div>

        {/* Step indicator */}
        <ol className="mt-6 grid grid-cols-4 gap-1.5 sm:gap-3" aria-label="Booking steps">
          {stepDefs.map((s) => {
            const state = step > s.n ? 'done' : step === s.n ? 'active' : 'todo';
            return (
              <li key={s.n}>
                <button
                  onClick={() => s.n < step && setStep(s.n)}
                  disabled={s.n > step}
                  aria-current={step === s.n ? 'step' : undefined}
                  className={`flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-[0.14em] transition-all sm:gap-2 sm:text-[11px] ${
                    state === 'done'
                      ? 'border-copper/50 bg-copper/15 text-copper-2'
                      : state === 'active'
                        ? 'border-copper bg-copper text-ink shadow-[0_8px_26px_-8px] shadow-copper/50'
                        : 'cursor-default border-white/8 bg-white/[0.02] text-taupe-2'
                  }`}
                >
                  {state === 'done' ? <Check size={13} aria-hidden /> : <span className="font-display text-sm">{s.n}</span>}
                  <span className="hidden min-[420px]:inline">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* ════ STEP PANELS ════ */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: SERVICE ── */}
              {step === 1 && (
                <motion.section key="s1" initial={{ opacity: 0, x: 34 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -26 }} transition={{ duration: 0.32 }} aria-labelledby="st1">
                  <h2 id="st1" className="font-display text-2xl font-bold text-ivory">{t('book.s1.title')}</h2>
                  <p className="mt-1 text-sm text-ivory-3">{t('book.s1.sub')}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {SERVICES.map((s) => {
                      const selected = serviceId === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => { setServiceId(s.id); setTime(null); }}
                          aria-pressed={selected}
                          className={`group relative flex gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                            selected
                              ? 'border-copper bg-copper/12 shadow-[0_0_0_1px] shadow-copper/70 ring-2 ring-copper/40'
                              : 'border-white/9 bg-ink-2 hover:border-copper/45 hover:bg-ink-3'
                          }`}
                        >
                          <img src={s.img} alt="" aria-hidden className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24" loading="lazy" />
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 font-display text-base font-bold text-ivory">
                              {s.name[lang]}
                              {selected && <CheckCircle2 size={15} className="shrink-0 text-copper-2" aria-hidden />}
                            </span>
                            <span className="mt-1 line-clamp-2 block text-[11px] leading-snug text-ivory-3/85">{s.desc[lang]}</span>
                            <span className="mt-2 flex items-center gap-3 text-[11px] font-semibold">
                              <span className="font-display text-base font-black text-copper-2">€{s.price}</span>
                              <span className="flex items-center gap-1 text-taupe-2"><Clock size={11} aria-hidden />{s.duration} {t('common.min')}</span>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* ── STEP 2: BARBER ── */}
              {step === 2 && (
                <motion.section key="s2" initial={{ opacity: 0, x: 34 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -26 }} transition={{ duration: 0.32 }} aria-labelledby="st2">
                  <h2 id="st2" className="font-display text-2xl font-bold text-ivory">{t('book.s2.title')}</h2>
                  <p className="mt-1 text-sm text-ivory-3">{t('book.s2.sub')}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {BARBERS.map((b) => {
                      const selected = barberId === b.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => { setBarberId(b.id); setTime(null); }}
                          aria-pressed={selected}
                          className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
                            selected ? 'border-copper shadow-[0_0_0_1px] shadow-copper/70 ring-2 ring-copper/40' : 'border-white/9 hover:border-copper/45'
                          }`}
                        >
                          <div className="relative aspect-[4/5] w-full overflow-hidden">
                            <img src={b.img} alt={`${b.name} — ${b.spec[lang]}`} loading="lazy" className="img-zoom h-full w-full object-cover object-top" />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" aria-hidden />
                            {selected && <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-copper text-ink"><Check size={16} strokeWidth={3.5} aria-hidden /></span>}
                            <span className="absolute inset-x-0 bottom-0 p-3">
                              <span className="font-display text-sm font-bold text-ivory sm:text-base">{b.name}</span>
                              <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-[0.14em] text-copper-2 sm:text-[9px]">{b.spec[lang]}</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                    {/* Any available */}
                    <button
                      onClick={() => { setBarberId('any'); setTime(null); }}
                      aria-pressed={barberId === 'any'}
                      className={`flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-center transition-all duration-200 ${
                        barberId === 'any' ? 'border-copper bg-copper/12 ring-2 ring-copper/40' : 'border-dashed border-white/15 bg-white/[0.02] hover:border-copper/45'
                      }`}
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-copper/40 bg-copper/15 text-copper-2">
                        <Users size={26} aria-hidden />
                      </span>
                      <span>
                        <span className="font-display text-base font-bold text-ivory">{t('book.anyone')}</span>
                        <span className="mt-1 block text-[11px] leading-snug text-ivory-3/85">{t('book.anyone.sub')}</span>
                      </span>
                      {barberId === 'any' && <CheckCircle2 size={18} className="text-copper-2" aria-hidden />}
                    </button>
                  </div>
                </motion.section>
              )}

              {/* ── STEP 3: DATE & TIME ── */}
              {step === 3 && (
                <motion.section key="s3" initial={{ opacity: 0, x: 34 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -26 }} transition={{ duration: 0.32 }} aria-labelledby="st3">
                  <h2 id="st3" className="font-display text-2xl font-bold text-ivory">{t('book.s3.title')}</h2>
                  <p className="mt-1 text-sm text-ivory-3">{t('book.s3.sub')}</p>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {/* Calendar */}
                    <div className="rounded-2xl border border-white/9 bg-ink-2 p-4">
                      <div className="flex items-center justify-between">
                        <button onClick={() => canGoPrev && setViewMonth((v) => { const d = new Date(Date.UTC(v.y, v.m - 1, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; })} disabled={!canGoPrev} aria-label={t('admin.prev')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ivory transition-colors hover:border-copper hover:text-copper-2 disabled:cursor-not-allowed disabled:opacity-25">
                          <ChevronLeft size={17} aria-hidden />
                        </button>
                        <p className="font-display text-base font-bold capitalize text-ivory">{monthLabel}</p>
                        <button onClick={() => setViewMonth((v) => { const d = new Date(Date.UTC(v.y, v.m + 1, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; })} aria-label={t('admin.next')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ivory transition-colors hover:border-copper hover:text-copper-2">
                          <ChevronRight size={17} aria-hidden />
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[9px] font-bold uppercase tracking-wider text-taupe-2">
                        {(lang === 'de' ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']).map((d) => <span key={d} className="py-1">{d}</span>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {calCells.map((iso, i) => {
                          if (!iso) return <span key={`e${i}`} />;
                          const [y, m, d] = iso.split('-').map(Number);
                          const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
                          const closed = HOURS[(wd + 6) % 7].open === null;
                          const past = iso < todayISO;
                          const selected = dateISO === iso;
                          const isToday = iso === todayISO;
                          const disabled = past || closed;
                          return (
                            <button
                              key={iso}
                              disabled={disabled}
                              onClick={() => pickDate(iso)}
                              aria-pressed={selected}
                              aria-label={dateLabel(iso, lang)}
                              className={`flex h-10 flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all sm:h-11 ${
                                selected
                                  ? 'bg-copper text-ink shadow-[0_6px_16px_-4px] shadow-copper/60'
                                  : disabled
                                    ? 'cursor-not-allowed text-taupe/40 line-through decoration-taupe/30'
                                    : 'text-ivory-2 hover:bg-copper/20 hover:text-copper-2'
                              } ${isToday && !selected ? 'ring-1 ring-copper/60' : ''}`}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-3 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-taupe-2"><span className="inline-block h-1.5 w-1.5 rounded-full bg-copper" aria-hidden />Europe/Vienna · {lang === 'de' ? 'Sonntags geschlossen' : 'Closed Sundays'}</p>
                    </div>

                    {/* Slots */}
                    <div className="rounded-2xl border border-white/9 bg-ink-2 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-taupe-2">
                        {service ? t('book.s3.slots', { service: service.name[lang], duration: service.duration }) : t('book.s3.slots', { service: '', duration: 0 })}
                      </p>
                      {dateClosed && <p className="mt-4 flex items-center gap-2 text-sm text-red-300"><AlertCircle size={15} aria-hidden />{t('book.s3.closed')}</p>}
                      {!dateISO && !dateClosed && <p className="mt-4 text-sm text-ivory-3">{lang === 'de' ? 'Wähle links ein Datum.' : 'Pick a date on the left.'}</p>}
                      {dateISO && !dateClosed && (
                        <div className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                          {slots.length === 0 && <p className="col-span-full py-6 text-center text-sm text-ivory-3">{t('book.s3.unavailable')}</p>}
                          {slots.map((s) => (
                            <button
                              key={s.time}
                              disabled={!s.available}
                              onClick={() => setTime(s.time)}
                              aria-pressed={time === s.time}
                              className={`h-11 rounded-xl border font-mono text-xs font-bold tracking-wider transition-all ${
                                time === s.time
                                  ? 'border-copper bg-copper text-ink shadow-[0_6px_16px_-4px] shadow-copper/60'
                                  : s.available
                                    ? 'border-white/12 text-ivory-2 hover:border-copper/60 hover:text-copper-2'
                                    : 'cursor-not-allowed border-white/5 text-taupe/45 line-through'
                              }`}
                            >
                              {s.time}
                            </button>
                          ))}
                        </div>
                      )}
                      {submitError && step === 3 && (
                        <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs leading-snug text-red-300">
                          <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />{submitError}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* ── STEP 4: DETAILS ── */}
              {step === 4 && (
                <motion.section key="s4" initial={{ opacity: 0, x: 34 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -26 }} transition={{ duration: 0.32 }} aria-labelledby="st4">
                  <h2 id="st4" className="font-display text-2xl font-bold text-ivory">{t('book.s4.title')}</h2>
                  <p className="mt-1 text-sm text-ivory-3">{t('book.s4.sub')}</p>

                  <form noValidate onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-5 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="b-name" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-taupe-2">{t('book.name')} *</label>
                        <input id="b-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={!!errors.name} className={inputCls(errors.name)} placeholder="Alex Berger" />
                        {errors.name && <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400"><AlertCircle size={11} aria-hidden />{errors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="b-phone" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-taupe-2">{t('book.phone')} *</label>
                        <input id="b-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" aria-invalid={!!errors.phone} className={inputCls(errors.phone)} placeholder="+43 660 123 45 67" />
                        {errors.phone && <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400"><AlertCircle size={11} aria-hidden />{errors.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="b-email" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-taupe-2">{t('book.email')} *</label>
                      <input id="b-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!errors.email} className={inputCls(errors.email)} placeholder="du@beispiel.at" />
                      {errors.email && <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400"><AlertCircle size={11} aria-hidden />{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="b-note" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-taupe-2">{t('book.note')}</label>
                      <textarea id="b-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border border-white/10 bg-ink-3 p-4 text-sm text-ivory placeholder:text-taupe outline-none focus:border-copper" placeholder={lang === 'de' ? 'z.B. Übergangs-Fade, 2mm oben…' : 'e.g. taper fade, 2mm on top…'} />
                    </div>

                    {submitError && (
                      <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs leading-snug text-red-300">
                        <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />{submitError}
                      </p>
                    )}
                  </form>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="mt-6 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)} className="flex h-12 items-center gap-2 rounded-xl border border-white/12 px-5 text-xs font-bold uppercase tracking-widest text-ivory-2 transition-all hover:border-copper hover:text-copper-2">
                  <ChevronLeft size={16} aria-hidden /> {t('book.back')}
                </button>
              ) : <span />}
              {step < 4 ? (
                <button
                  onClick={() => canNext && setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)}
                  disabled={!canNext}
                  className="flex h-12 items-center gap-2 rounded-xl bg-copper px-6 text-xs font-bold uppercase tracking-widest text-ink transition-all hover:bg-copper-2 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {t('book.next')} <ChevronRight size={16} aria-hidden />
                </button>
              ) : (
                <button onClick={submit} disabled={saving} className="flex h-12 items-center gap-2 rounded-xl bg-copper px-6 text-xs font-bold uppercase tracking-widest text-ink shadow-[0_10px_30px_-10px] shadow-copper/60 transition-all hover:bg-copper-2 disabled:opacity-60">
                  {saving ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <CalendarCheck size={16} aria-hidden />}
                  {saving ? t('book.sending') : t('book.confirm')}
                </button>
              )}
            </div>
          </div>

          {/* ════ SUMMARY SIDEBAR ════ */}
          <aside className="h-fit rounded-2xl border border-copper/25 bg-gradient-to-b from-ink-2 to-ink-3 p-6 lg:sticky lg:top-28">
            <div className="flex items-center gap-2 border-b border-white/8 pb-4">
              <Logo size={30} />
              <p className="font-display text-base font-bold text-ivory">{t('book.summary')}</p>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2 text-taupe-2"><Scissors size={14} aria-hidden />{t('book.step1')}</span>
                <span className="text-right font-semibold text-ivory">{service ? service.name[lang] : '—'}</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2 text-taupe-2"><User size={14} aria-hidden />{t('book.step2')}</span>
                <span className="text-right font-semibold text-ivory">{barberId === 'any' ? t('book.anyone') : barber ? barber.name : '—'}</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2 text-taupe-2"><CalendarCheck size={14} aria-hidden />{t('book.step3')}</span>
                <span className="text-right font-semibold text-ivory">{dateISO ? dateLabel(dateISO, lang) : '—'}{time ? ` · ${time}` : ''}</span>
              </li>
              <li className="flex items-center justify-between border-t border-white/8 pt-3">
                <span className="flex items-center gap-2 text-taupe-2"><Clock size={14} aria-hidden />{lang === 'de' ? 'Dauer' : 'Duration'}</span>
                <span className="font-semibold text-ivory">{service ? `${service.duration} ${t('common.min')}` : '—'}</span>
              </li>
            </ul>
            <div className="mt-4 flex items-end justify-between border-t border-copper/25 pt-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-taupe-2">{t('book.total')}</span>
              <span className="font-display text-4xl font-black text-copper-2">{service ? `€${service.price}` : '€—'}</span>
            </div>
            <p className="mt-4 flex items-start gap-1.5 text-[9px] leading-relaxed text-taupe">
              <Info size={11} className="mt-0.5 shrink-0" aria-hidden />
              {lang === 'de'
                ? 'Demo: Reservierung wird nur in diesem Browser gespeichert (localStorage). Konfliktprüfung läuft lokal in Echtzeit — es werden keine echten Termine vergeben.'
                : 'Demo: your reservation is stored only in this browser (localStorage). Conflict checks run locally in real time — no real appointments are made.'}
            </p>
            {step === 4 && (
              <button onClick={submit} disabled={saving} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-copper text-xs font-bold uppercase tracking-widest text-ink shadow-[0_10px_34px_-10px] shadow-copper/60 transition-all hover:bg-copper-2 lg:hidden">
                {saving ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Sparkles size={16} aria-hidden />}
                {saving ? t('book.sending') : t('book.confirm')}
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
