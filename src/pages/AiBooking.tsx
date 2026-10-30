import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, PhoneOff, Home, RotateCcw, ShieldAlert, Sparkles, PhoneCall } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import { useApp } from '../lib/app-context';

/* ── Voice booking page — Vapi AI receptionist ("Haris"). ─────────────────── */

const PUBLIC_KEY = (import.meta.env.VITE_VAPI_PUBLIC_KEY as string | undefined) ?? '';
const ASSISTANT_ID = (import.meta.env.VITE_VAPI_ASSISTANT_ID as string | undefined) ?? '';

type Phase = 'idle' | 'connecting' | 'live' | 'ended' | 'error';
interface Line { role: 'user' | 'assistant'; text: string }

export default function AiBooking() {
  const { lang } = useApp();
  const navigate = useNavigate();
  const vapiRef = useRef<any>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [lines, setLines] = useState<Line[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const configured = Boolean(PUBLIC_KEY && ASSISTANT_ID);

  useEffect(() => {
    if (!configured) return;
    const vapi = new Vapi(PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setPhase('live');
      setLines([]);
    });
    vapi.on('call-end', () => setPhase('ended'));
    vapi.on('speech-start', () => setSpeaking(true));
    vapi.on('speech-end', () => setSpeaking(false));
    vapi.on('message', (msg: any) => {
      if (msg?.type === 'transcript' && msg?.transcriptType === 'final') {
        const role: 'user' | 'assistant' = msg.role === 'user' ? 'user' : 'assistant';
        setLines((prev) => [...prev, { role, text: String(msg.transcript ?? '') }]);
      }
    });
    vapi.on('error', (e: any) => {
      console.error('[AiBooking] vapi error', e);
      setPhase('error');
    });

    return () => {
      try { vapi.stop(); } catch { /* ignore */ }
      vapiRef.current = null;
    };
  }, [configured]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  const start = () => {
    setLines([]);
    setPhase('connecting');
    try {
      vapiRef.current?.start(ASSISTANT_ID);
    } catch {
      setPhase('error');
    }
  };
  const stop = () => {
    try { vapiRef.current?.stop(); } catch { /* ignore */ }
  };

  const statusText =
    phase === 'idle' ? (lang === 'de' ? 'Bereit' : 'Ready')
    : phase === 'connecting' ? (lang === 'de' ? 'Verbinde…' : 'Connecting…')
    : speaking ? (lang === 'de' ? 'Haris spricht…' : 'Haris is speaking…')
    : phase === 'live' ? (lang === 'de' ? 'Am Sprechen…' : 'Listening…')
    : phase === 'ended' ? (lang === 'de' ? 'Anruf beendet' : 'Call ended')
    : (lang === 'de' ? 'Fehler' : 'Error');

  return (
    <div className="dot-grid min-h-[100svh] bg-ink px-4 pb-24 pt-[5.5rem] sm:pt-24">
      <div className="mx-auto max-w-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-copper-2">
          <span className="mr-2 inline-block h-px w-8 bg-copper align-middle" aria-hidden />
          {lang === 'de' ? 'KI-REZEPTION' : 'AI RECEPTIONIST'}
        </p>
        <h1 className="mt-4 font-display text-4xl font-black leading-[1.04] text-ivory">
          {lang === 'de' ? 'Sprich mit Haris.' : 'Talk to Haris.'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-taupe-2">
          {lang === 'de'
            ? 'Unser virtueller Rezeptionist bucht deinen Termin per Sprachanruf — direkt im Browser, deutsch oder englisch.'
            : 'Our virtual receptionist books your appointment in a voice call — right in your browser, German or English.'}
        </p>

        {!configured ? (
          <div className="mt-10 rounded-3xl border border-amber-400/25 bg-amber-400/8 p-8">
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />
              <div>
                <p className="text-sm font-bold text-ivory">
                  {lang === 'de' ? 'Voice-Assistent noch nicht konfiguriert' : 'Voice assistant not configured yet'}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ivory-3">
                  {lang === 'de'
                    ? 'Bitte in Vercel die Umgebungsvariablen VITE_VAPI_PUBLIC_KEY und VITE_VAPI_ASSISTANT_ID setzen und erneut deployen. Danach erscheint hier der Anruf-Button.'
                    : 'Add VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID in Vercel and redeploy — the call button will appear here.'}
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ivory-2 transition-colors hover:border-copper hover:text-copper-2"
                >
                  <Home size={13} aria-hidden /> {lang === 'de' ? 'Zur Startseite' : 'Back to homepage'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-copper/25 bg-gradient-to-b from-ink-2 to-ink-3 p-8 shadow-card sm:p-10">
            {/* Orb + status */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {(phase === 'live' || phase === 'connecting') && (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full bg-copper/25" aria-hidden />
                    <span className="absolute -inset-3 animate-pulse rounded-full border border-copper/30" aria-hidden />
                  </>
                )}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-copper/50 bg-copper/15">
                  <span className="font-display text-2xl font-black text-copper-2">H</span>
                </div>
              </div>

              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-taupe-2">{statusText}</p>

              {/* Waveform */}
              <div className="mt-5 flex h-10 items-end gap-1.5" aria-hidden>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <span
                    key={i}
                    className={`w-1.5 rounded-full bg-copper/70 transition-all ${
                      phase === 'live' ? 'animate-bounce' : 'h-2 opacity-40'
                    }`}
                    style={phase === 'live' ? { height: `${12 + ((i * 7) % 22)}px`, animationDelay: `${i * 90}ms`, animationDuration: speaking ? '0.6s' : '1.1s' } : undefined}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="mt-8 flex items-center gap-3">
                {phase !== 'live' && phase !== 'connecting' && (
                  <button
                    onClick={start}
                    className="flex h-13 items-center gap-2.5 rounded-2xl bg-copper px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ink transition-all hover:bg-copper-2"
                  >
                    {phase === 'ended' ? <RotateCcw size={16} aria-hidden /> : <PhoneCall size={16} aria-hidden />}
                    {phase === 'ended'
                      ? (lang === 'de' ? 'Neuer Anruf' : 'Call again')
                      : (lang === 'de' ? 'Anruf starten' : 'Start call')}
                  </button>
                )}
                {(phase === 'live' || phase === 'connecting') && (
                  <button
                    onClick={stop}
                    className="flex items-center gap-2.5 rounded-2xl border border-red-400/40 px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-red-300 transition-colors hover:bg-red-400/15"
                  >
                    <PhoneOff size={16} aria-hidden /> {lang === 'de' ? 'Auflegen' : 'End call'}
                  </button>
                )}
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-ivory-3 transition-colors hover:border-copper hover:text-copper-2"
                >
                  <Home size={15} aria-hidden /> {lang === 'de' ? 'Startseite' : 'Home'}
                </button>
              </div>
            </div>

            {/* Transcript */}
            {(phase === 'live' || lines.length > 0) && (
              <div
                ref={listRef}
                className="mt-8 max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-ink/60 p-4"
                aria-live="polite"
              >
                {lines.length === 0 && (
                  <p className="text-center text-xs text-taupe">
                    {lang === 'de' ? 'Das Gespräch erscheint hier…' : 'The conversation will appear here…'}
                  </p>
                )}
                {lines.map((l, i) => (
                  <div key={i} className={`flex ${l.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        l.role === 'user'
                          ? 'bg-copper/20 text-ivory'
                          : 'border border-white/10 bg-ink-3 text-ivory-2'
                      }`}
                    >
                      <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-taupe-2">
                        {l.role === 'user' ? (lang === 'de' ? 'Du' : 'You') : 'Haris'}
                      </span>
                      {l.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* After-call note */}
            {phase === 'ended' && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/8 p-4">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden />
                <p className="text-xs leading-relaxed text-ivory-2">
                  {lang === 'de'
                    ? 'Deine Buchungsanfrage wurde übermittelt. Du erhältst eine Bestätigung per E-Mail — dein Termin wartet noch auf die Freigabe des Barbershops.'
                    : 'Your booking request was submitted. You will get a confirmation by email — your appointment is pending approval from the barbershop.'}
                </p>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-[11px] text-taupe">
          {lang === 'de'
            ? 'Du kannst stattdessen auch manuell buchen — oder während des Anrufs einfach „speak English" sagen.'
            : 'You can also book manually instead — or just say „speak English" during the call.'}
        </p>
      </div>
    </div>
  );
}
