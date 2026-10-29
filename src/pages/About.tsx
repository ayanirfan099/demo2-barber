import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Ruler, Flame, HeartHandshake } from 'lucide-react';
import { useApp } from '../lib/app-context';
import { Kicker } from '../components/Shared';

export default function About() {
  const { t, lang } = useApp();
  const navigate = useNavigate();

  return (
    <div className="bg-ink pt-24 sm:pt-28">
      {/* Story hero */}
      <div className="relative overflow-hidden">
        <img src="/images/about-atmo.jpg" alt={lang === 'de' ? 'Interieur des Vienna Cuts Studios mit Lederstühlen und Messingdetails' : 'Interior of the Vienna Cuts studio with leather chairs and brass details'} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/15" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-32 lg:px-8">
          <Kicker>{t('about.kicker')}</Kicker>
          <h1 className="max-w-2xl font-display text-5xl font-black leading-[0.98] tracking-tight text-ivory sm:text-7xl">{t('about.title')}</h1>
        </div>
      </div>

      {/* Story */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="font-display text-xl leading-snug text-ivory-2 sm:text-2xl">{t('about.p1')}</p>
          <p className="mt-6 leading-relaxed text-ivory-3">{t('about.p2')}</p>
          <button
            onClick={() => navigate('/buchen')}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-copper px-7 text-xs font-bold uppercase tracking-[0.18em] text-ink transition-all hover:bg-copper-2"
          >
            <CalendarCheck size={16} aria-hidden /> {t('about.cta')}
          </button>
        </div>

        {/* Philosophy */}
        <div className="rounded-2xl border border-copper/25 bg-gradient-to-br from-ink-2 to-ink-3 p-6 sm:p-8">
          <Kicker>{t('about.philosophy')}</Kicker>
          <div className="mt-2 divide-y divide-white/6">
            {[
              [Ruler, 'about.ph1', 'about.ph1d'],
              [Flame, 'about.ph2', 'about.ph2d'],
              [HeartHandshake, 'about.ph3', 'about.ph3d'],
            ].map(([Icon, titleKey, descKey]: any, i) => (
              <div key={i} className="flex items-start gap-4 py-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-copper/15 text-copper-2">
                  <Icon size={22} aria-hidden />
                </span>
                <span>
                  <h2 className="font-display text-lg font-bold text-ivory">{t(titleKey as string)}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-ivory-3/90">{t(descKey as string)}</p>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Craft band */}
      <div className="border-t border-white/5 bg-ink-2 py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/6 sm:grid-cols-4">
          {[
            ['2019', lang === 'de' ? 'Gegründet in Wien' : 'Founded in Vienna'],
            ['4', lang === 'de' ? 'Barbiere am Stuhl' : 'Barbers at the chairs'],
            ['8.400+', lang === 'de' ? 'Schnitte & Fades*' : 'Cuts & fades*'],
            ['4,9 ★', lang === 'de' ? 'Demo-Bewertung*' : 'Demo rating*'],
          ].map(([n, label]) => (
            <div key={label as string} className="flex flex-col items-center justify-center bg-ink-3 px-4 py-8 text-center">
              <p className="font-display text-3xl font-black text-copper-2">{n}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-taupe-2">{label}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-4 max-w-7xl px-5 text-[10px] text-taupe sm:px-6 lg:px-8">* {lang === 'de' ? 'Fiktive Zahlen, Demo-Inhalt.' : 'Fictional numbers, demo content.'}</p>
      </div>
    </div>
  );
}
