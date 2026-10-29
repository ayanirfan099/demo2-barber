import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useApp } from '../lib/app-context';
import { Kicker } from '../components/Shared';

export default function Legal({ kind }: { kind: 'imprint' | 'privacy' }) {
  const { lang } = useApp();
  const navigate = useNavigate();
  const isImprint = kind === 'imprint';

  const imprint = {
    title: isImprint ? (lang === 'de' ? 'Impressum' : 'Imprint') : lang === 'de' ? 'Datenschutz' : 'Privacy',
    body: isImprint
      ? [
          ['Wien(n)a Cuts — Fiktives Demo-Studio', lang === 'de' ? 'Dieses Impressum ist Teil einer fiktiven Demonstrations-Website. Es existiert kein echtes Unternehmen namens “Vienna Cuts”.' : 'This imprint is part of a fictional demonstration website. No real company named “Vienna Cuts” exists.'],
          [lang === 'de' ? 'Betreiber (fiktiv)' : 'Operator (fictional)', lang === 'de' ? 'Jonas Berger — Inhaber (erfundene Person)' : 'Jonas Berger — owner (invented person)'],
          [lang === 'de' ? 'Kontakt (Beispiel)' : 'Contact (example)', 'hallo@vienna-cuts-demo.at · +43 1 234 56 78 (Beispiele, keine echte Erreichbarkeit)'],
          [lang === 'de' ? 'Standort (Beispiel)' : 'Location (example)', lang === 'de' ? 'Wien, 7. Bezirk — genauer Standort wird hier bewusst nicht genannt.' : 'Vienna, 7th district — an exact address is deliberately not provided.'],
        ]
      : [
          [lang === 'de' ? 'Datenspeicherung' : 'Data storage', lang === 'de' ? 'Diese Demo speichert Buchungen und Spracheinstellungen ausschließlich lokal in Ihrem Browser (localStorage/sessionStorage). Es werden keine Daten an Server übertragen, da kein Backend existiert.' : 'This demo stores bookings and language preferences exclusively in your browser (localStorage/sessionStorage). No data is transmitted to servers, as there is no backend.'],
          [lang === 'de' ? 'Cookies' : 'Cookies', lang === 'de' ? 'Es werden keine Cookies gesetzt. localStorage wird ausschließlich für Demo-Zwecke (Termin-Demo, Sprache) verwendet.' : 'No cookies are set. localStorage is used solely for demo purposes (booking demo, language).'],
          [lang === 'de' ? 'Analytics' : 'Analytics', lang === 'de' ? 'Keine Tracking-Tools, keine Werbung, keine externen Dienste.' : 'No tracking tools, no advertising, no external services.'],
          [lang === 'de' ? 'Ihre Rechte' : 'Your rights', lang === 'de' ? 'In einer echten Umgebung hätten Sie Rechte auf Auskunft, Berichtigung und Löschung (DSGVO). Hier gibt es schlicht keine gespeicherten Daten außerhalb Ihres Geräts.' : 'In a real environment you would have rights of access, rectification and erasure (GDPR). Here there is simply no data stored outside your device.'],
        ],
  };

  return (
    <div className="bg-ink pt-28 sm:pt-32">
      <div className="mx-auto max-w-3xl px-5 pb-20 sm:px-6">
        <Kicker>{lang === 'de' ? 'Rechtliches · Fiktiv' : 'Legal · Fictional'}</Kicker>
        <h1 className="font-display text-5xl font-black tracking-tight text-ivory">{imprint.title}</h1>
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/8 p-4">
          <ShieldAlert size={17} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />
          <p className="text-xs leading-relaxed text-amber-200/90">
            {lang === 'de' ? 'Demonstrations-Inhalt. Alle Angaben sind erfunden und dienen ausschließlich der Veranschaulichung.' : 'Demonstration content. All details are invented and serve illustration only.'}
          </p>
        </div>
        <div className="mt-8 divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8">
          {imprint.body.map(([k, v]) => (
            <div key={k as string} className="bg-ink-2 p-5">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-copper-2">{k as string}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ivory-2">{v as string}</p>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/kontakt')} className="mt-8 h-11 rounded-xl border border-copper/50 px-6 text-xs font-bold uppercase tracking-widest text-copper-2 transition-colors hover:bg-copper hover:text-ink">
          {lang === 'de' ? 'Zum Kontakt' : 'To contact'}
        </button>
      </div>
    </div>
  );
}
