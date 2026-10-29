import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, CalendarCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../lib/app-context';
import { HOURS } from '../lib/data';
import { Kicker, DemoNote } from '../components/Shared';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Contact() {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; msg?: string }>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = t('contact.err.name');
    if (!EMAIL_RE.test(email.trim())) next.email = t('contact.err.email');
    if (msg.trim().length < 10) next.msg = t('contact.err.msg');
    setErrors(next);
    if (Object.keys(next).length) return;
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 700);
  };

  const inputCls = (invalid?: string) =>
    `h-11 w-full rounded-xl border bg-ink-3 px-4 text-sm text-ivory placeholder:text-taupe outline-none transition-colors focus:border-copper ${
      invalid ? 'border-red-400/60' : 'border-white/10'
    }`;

  return (
    <div className="bg-ink pt-24 sm:pt-28">
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <Kicker>{t('contact.kicker')}</Kicker>
        <h1 className="font-display text-5xl font-black tracking-tight text-ivory sm:text-6xl">{t('contact.title')}</h1>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-copper/25 bg-copper/8 p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-copper-2" aria-hidden />
          <p className="text-xs leading-relaxed text-copper-2/90">{t('contact.demo.note')}</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          {/* Hours + info */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-white/8 bg-ink-2 p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ivory"><Clock size={17} className="text-copper" aria-hidden />{t('contact.hours')}</h2>
              <ul className="mt-3 divide-y divide-white/6 text-sm">
                {HOURS.map((h, i) => (
                  <li key={i} className="flex items-center justify-between py-2">
                    <span className={i >= 5 ? 'text-ivory-2' : 'text-ivory-3'}>{h[lang]}</span>
                    <span className={h.open === null ? 'text-taupe' : 'font-semibold text-ivory'}>
                      {h.open === null ? t('contact.closed') : `${String(h.open).padStart(2, '0')}:00 – ${String(h.close).padStart(2, '0')}:00`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/8 bg-ink-2 p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ivory"><MapPin size={17} className="text-copper" aria-hidden />{t('contact.info')}</h2>
              <ul className="mt-3 space-y-3 text-sm text-ivory-2">
                <li className="flex items-start gap-2.5"><MapPin size={15} className="mt-0.5 shrink-0 text-copper" aria-hidden />{t('contact.loc')}</li>
                <li className="flex items-center gap-2.5"><Phone size={15} className="shrink-0 text-copper" aria-hidden />{t('contact.phone.label')}</li>
                <li className="flex items-center gap-2.5"><Mail size={15} className="shrink-0 text-copper" aria-hidden />{t('contact.email.label')}</li>
              </ul>
              {/* Stylized demo map (not a real address) */}
              <div className="dot-grid-light relative mt-5 flex h-40 items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-ivory-2" role="img" aria-label={lang === 'de' ? 'Stilisierte Demo-Karte — kein echter Standort' : 'Stylized demo map — no real location'}>
                <svg viewBox="0 0 300 160" className="absolute inset-0 h-full w-full" aria-hidden>
                  <path d="M0 96 H300 M60 0 V160 M150 0 V160 M236 0 V160" stroke="#c9bda9" strokeWidth="7" />
                  <path d="M0 96 H300 M60 0 V160 M150 0 V160 M236 0 V160" stroke="#e8e0d1" strokeWidth="3.5" />
                  <path d="M0 40 C90 30 200 60 300 34" stroke="#b7a98e" strokeWidth="5" fill="none" />
                </svg>
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-copper text-ink shadow-lg ring-4 ring-copper/30">
                  <MapPin size={18} aria-hidden />
                </span>
                <span className="absolute bottom-2 right-3 text-[9px] font-bold uppercase tracking-widest text-ink/50">DEMO MAP · Neubau</span>
              </div>
              <button onClick={() => navigate('/buchen')} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-copper text-xs font-bold uppercase tracking-[0.18em] text-ink transition-all hover:bg-copper-2">
                <CalendarCheck size={16} aria-hidden /> {t('contact.cta')}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} noValidate className="rounded-2xl border border-white/8 bg-ink-2 p-6 sm:p-8 lg:col-span-3">
            <h2 className="font-display text-2xl font-bold text-ivory">{t('contact.form.title')}</h2>
            {sent ? (
              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/8 px-6 py-12 text-center">
                <CheckCircle2 size={42} className="text-emerald-400" aria-hidden />
                <p className="max-w-sm text-sm leading-relaxed text-ivory-2">{t('contact.form.sent')}</p>
                <button type="button" onClick={() => { setSent(false); setName(''); setEmail(''); setMsg(''); }} className="mt-2 h-11 rounded-xl border border-copper/50 px-6 text-xs font-bold uppercase tracking-widest text-copper-2 transition-colors hover:bg-copper hover:text-ink">
                  {lang === 'de' ? 'Weitere Nachricht' : 'Send another'}
                </button>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-taupe-2">{t('contact.form.name')} *</label>
                    <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'c-name-err' : undefined} className={inputCls(errors.name)} placeholder="Jonas Berger" autoComplete="name" />
                    {errors.name && <p id="c-name-err" role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400"><AlertCircle size={11} aria-hidden />{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-taupe-2">{t('contact.form.email')} *</label>
                    <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'c-email-err' : undefined} className={inputCls(errors.email)} placeholder="du@beispiel.at" autoComplete="email" />
                    {errors.email && <p id="c-email-err" role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400"><AlertCircle size={11} aria-hidden />{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="c-msg" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-taupe-2">{t('contact.form.msg')} *</label>
                  <textarea id="c-msg" rows={6} value={msg} onChange={(e) => setMsg(e.target.value)} aria-invalid={!!errors.msg} aria-describedby={errors.msg ? 'c-msg-err' : undefined} className={`w-full rounded-xl border bg-ink-3 p-4 text-sm leading-relaxed text-ivory placeholder:text-taupe outline-none transition-colors focus:border-copper ${errors.msg ? 'border-red-400/60' : 'border-white/10'}`} placeholder={lang === 'de' ? 'Worum geht es? (mind. 10 Zeichen)' : 'What is it about? (min. 10 characters)'} />
                  {errors.msg && <p id="c-msg-err" role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400"><AlertCircle size={11} aria-hidden />{errors.msg}</p>}
                </div>
                <button type="submit" disabled={sending} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-copper text-xs font-bold uppercase tracking-[0.2em] text-ink transition-all hover:bg-copper-2 disabled:opacity-60">
                  {sending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden /> : <Send size={15} aria-hidden />}
                  {t('contact.form.send')}
                </button>
                <DemoNote text={lang === 'de' ? 'Demo-Formular: Es wird nichts versendet; Eingaben verlassen deinen Browser nicht.' : 'Demo form: nothing is sent; input never leaves this browser.'} />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
