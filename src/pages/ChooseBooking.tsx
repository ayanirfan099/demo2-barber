import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarCheck, Mic, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../lib/app-context';

/* ── Booking chooser: BOOK NOW leads here — manual wizard or voice AI. ─── */
export default function ChooseBooking() {
  const { lang } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as Record<string, unknown>;

  const cards = [
    {
      key: 'manual',
      icon: <CalendarCheck size={26} aria-hidden />,
      title: lang === 'de' ? 'Manuell buchen' : 'Book manually',
      desc:
        lang === 'de'
          ? 'Der klassische 4-Schritte-Buchungsablauf — Service, Barber, Uhrzeit, Daten.'
          : 'The classic 4-step booking flow — service, barber, time, details.',
      onClick: () => navigate('/buchen', { state }),
      highlight: false,
    },
    {
      key: 'ai',
      icon: <Mic size={26} aria-hidden />,
      title: lang === 'de' ? 'KI-Rezeptionist buchen' : 'Book with AI Receptionist',
      desc:
        lang === 'de'
          ? 'Sprich mit Haris — unsere Sprach-KI bucht deinen Termin in wenigen Minuten.'
          : 'Talk to Haris — our voice AI books your appointment in a quick phone-style call.',
      onClick: () => navigate('/ai', { state }),
      highlight: true,
    },
  ];

  return (
    <div className="dot-grid min-h-[100svh] bg-ink px-4 pb-24 pt-[5.5rem] sm:pt-24">
      <div className="mx-auto max-w-4xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-copper-2">
          <span className="mr-2 inline-block h-px w-8 bg-copper align-middle" aria-hidden />
          {lang === 'de' ? 'RESERVIERUNG' : 'RESERVATION'}
        </p>
        <h1 className="mt-4 font-display text-4xl font-black leading-[1.04] text-ivory sm:text-5xl">
          {lang === 'de' ? 'Wie möchtest du buchen?' : 'How would you like to book?'}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-taupe-2">
          {lang === 'de'
            ? 'Wähle deinen Weg — beide Optionen landen im selben Buchungssystem und du erhältst eine Bestätigung.'
            : 'Pick your way — both options land in the same booking system and you get a confirmation either way.'}
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {cards.map((c) => (
            <button
              key={c.key}
              onClick={c.onClick}
              className={`group relative rounded-3xl border p-8 text-left transition-all ${
                c.highlight
                  ? 'border-copper/50 bg-copper/[0.07] hover:border-copper hover:bg-copper/[0.12]'
                  : 'border-white/10 bg-ink-2 hover:border-copper/50'
              }`}
            >
              {c.highlight && (
                <span className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-copper px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-ink">
                  <Sparkles size={10} aria-hidden />
                  {lang === 'de' ? 'Neu' : 'New'}
                </span>
              )}
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  c.highlight ? 'bg-copper text-ink' : 'bg-copper/15 text-copper-2'
                }`}
              >
                {c.icon}
              </span>
              <h2 className="mt-5 font-display text-xl font-black text-ivory">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-taupe-2">{c.desc}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-copper-2">
                {lang === 'de' ? 'Starten' : 'Get started'}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-[11px] text-taupe">
          {lang === 'de'
            ? 'Hinweis: Der KI-Rezeptionist spricht Deutsch und Englisch. Für Zahlung online oder im Salon kannst du dich beim Anruf entscheiden.'
            : 'Note: The AI receptionist speaks German and English. You can choose to pay online or at the salon during the call.'}
        </p>
      </div>
    </div>
  );
}
