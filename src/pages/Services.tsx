import { useNavigate } from 'react-router-dom';
import { Clock, Check, CalendarCheck, BadgeEuro } from 'lucide-react';
import { useApp } from '../lib/app-context';
import { SERVICES } from '../lib/data';
import { Kicker, DemoNote } from '../components/Shared';

export default function Services() {
  const { t, lang } = useApp();
  const navigate = useNavigate();

  return (
    <div className="bg-ink pt-24 sm:pt-28">
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <Kicker>{t('services.kicker')}</Kicker>
          <h1 className="font-display text-5xl font-black tracking-tight text-ivory sm:text-6xl">{t('services.title')}</h1>
          <p className="mt-4 text-base leading-relaxed text-ivory-3">{t('services.sub')}</p>
        </div>

        {/* Service cards */}
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((s) => (
            <article
              key={s.id}
              className="lift group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-ink-2 shadow-soft transition-colors hover:border-copper/45"
            >
              <div className="relative h-44 overflow-hidden sm:h-48">
                <img
                  src={s.img}
                  alt={`${s.name[lang]} — ${s.desc[lang].slice(0, 60)}…`}
                  loading="lazy"
                  className="img-zoom h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/40 to-transparent" aria-hidden />
                {s.best && (
                  <span className="absolute left-4 top-4 rounded-full border border-copper/50 bg-ink/85 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-copper-2 backdrop-blur">
                    ★ {t('services.popular')}
                  </span>
                )}
                <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-ink/70 py-1 pl-2 pr-3 backdrop-blur">
                  <Clock size={12} className="text-copper-2" aria-hidden />
                  <span className="text-[11px] font-semibold text-ivory">{s.duration} {t('common.min')}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-2xl font-bold text-ivory">{s.name[lang]}</h2>
                  <div className="text-right">
                    <p className="font-display text-2xl font-black leading-none text-copper-2">€{s.price}</p>
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-taupe-2">{t('services.per')}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ivory-3">{s.desc[lang]}</p>

                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.24em] text-taupe-2">{t('services.includes')}</p>
                <ul className="mt-1.5 space-y-1.5">
                  {s.includes[lang].map((inc) => (
                    <li key={inc} className="flex items-center gap-2 text-xs text-ivory-2">
                      <Check size={13} className="shrink-0 text-copper" aria-hidden /> {inc}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/buchen', { state: { serviceId: s.id } })}
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-copper text-xs font-bold uppercase tracking-[0.18em] text-ink transition-all hover:bg-copper-2 active:scale-[0.98]"
                >
                  <CalendarCheck size={15} aria-hidden /> {t('services.book')} · €{s.price}
                </button>
              </div>
            </article>
          ))}

          {/* Pricing summary card */}
          <aside className="flex flex-col justify-between rounded-2xl border border-copper/30 bg-gradient-to-br from-ink-3 via-ink-2 to-ink-3 p-6">
            <div>
              <BadgeEuro size={26} className="text-copper-2" aria-hidden />
              <h2 className="mt-3 font-display text-2xl font-bold text-ivory">{lang === 'de' ? 'Transparente Preise. Immer.' : 'Transparent prices. Always.'}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ivory-3">{t('services.note')}</p>
              <ul className="mt-4 divide-y divide-white/6 text-sm">
                {SERVICES.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2">
                    <span className="text-ivory-2">{s.name[lang]}</span>
                    <span className="font-display font-bold text-copper-2">€{s.price} <span className="text-[10px] font-sans font-medium text-taupe-2">/ {s.duration}′</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigate('/buchen')}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-copper/50 text-xs font-bold uppercase tracking-[0.18em] text-copper-2 transition-all hover:bg-copper hover:text-ink"
            >
              <CalendarCheck size={15} aria-hidden /> {t('nav.book')}
            </button>
          </aside>
        </div>

        <DemoNote text={t('demo.banner')} className="mt-8" />
      </div>
    </div>
  );
}
