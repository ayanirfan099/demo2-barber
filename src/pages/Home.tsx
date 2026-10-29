import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, ArrowRight, Scissors, Star, Clock, ChevronRight, ChevronDown } from 'lucide-react';
import { useApp } from '../lib/app-context';
import { SERVICES, BARBERS } from '../lib/data';
import { Kicker } from '../components/Shared';

const REVIEWS = [
  { name: 'Julian W.', text: { de: 'Der beste Skin Fade, den ich in Wien hatte. Jonas versteht Proportionen wie kaum ein Zweiter.', en: 'The best skin fade I’ve had in Vienna. Jonas understands proportions like few others.' }, stars: 5, service: 'Skin Fade' },
  { name: 'Tobias R.', text: { de: 'Heißtuch, Rasiermesser, Gespräch — das volle Ritual. Bin seit 2021 Stammgast.', en: 'Hot towel, straight razor, conversation — the full ritual. A regular since 2021.' }, stars: 5, service: 'Premium Grooming' },
  { name: 'Alexander B.', text: { de: 'Lena hat mir endlich den Stufenschnitt gezeigt, der zu meiner Kopfform passt. Weltklasse.', en: 'Lena finally showed me the layered cut that fits my head shape. World class.' }, stars: 5, service: 'Classic Haircut' },
];

export default function Home() {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const featured = SERVICES.filter((s) => ['classic', 'fade', 'combo', 'premium'].includes(s.id));

  return (
    <>
      {/* ════════ HERO ════════ */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt={lang === 'de' ? 'Barber schneidet einem Gast im Salon die Haare — dunkle, warme Atmosphäre' : 'Barber cutting a guest’s hair in the studio — dark, warm atmosphere'}
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/25 to-transparent" aria-hidden />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-40 sm:px-6 sm:pb-20 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <p className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em] text-copper-2 sm:text-[11px]">
              <span className="inline-block h-px w-10 bg-copper" aria-hidden />
              {t('home.kicker')}
            </p>
            <h1 className="font-display text-[13vw] font-black leading-[0.98] tracking-tight text-ivory min-[420px]:text-6xl sm:text-7xl lg:text-[5.2rem]">
              {t('home.h1a')}<br />
              <span className="italic text-copper-2">{t('home.h1b')}</span><br />
              {t('home.h1c')}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory-2/95 sm:text-base">{t('home.sub')}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/buchen')}
                className="flex h-12 items-center gap-2 rounded-xl bg-copper px-6 text-sm font-bold uppercase tracking-wide text-ink shadow-[0_14px_40px_-10px] shadow-copper/60 transition-all hover:scale-[1.03] hover:bg-copper-2 active:scale-95"
              >
                <CalendarCheck size={17} aria-hidden /> {t('home.cta')}
              </button>
              <Link
                to="/leistungen"
                className="flex h-12 items-center gap-2 rounded-xl border border-ivory/25 bg-ink/40 px-6 text-sm font-semibold text-ivory backdrop-blur transition-all hover:border-copper/60 hover:text-copper-2"
              >
                {t('home.cta2')} <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            {/* Stats strip */}
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5 sm:gap-x-9">
              {[
                [t('home.stat4'), '€35'],
                ['4,9 ★*', t('home.stat2')],
                ['07', t('home.stat3')],
                ['2019', t('home.stat1')],
              ].map(([a, b]) => (
                <div key={b} className="leading-tight">
                  <p className="font-display text-lg font-black text-ivory sm:text-xl">{a}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-taupe-2 sm:text-[10px]">{b}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <a href="#services" aria-label="scroll" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-ivory/50 transition-colors hover:text-copper-2 md:block">
          <ChevronDown size={26} className="animate-bounce" aria-hidden />
        </a>
      </section>

      {/* ════════ SERVICES PREVIEW ════════ */}
      <section id="services" className="dot-grid relative bg-ink py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Kicker>{t('home.services.kicker')}</Kicker>
              <h2 className="font-display text-4xl font-black tracking-tight text-ivory sm:text-5xl">{t('home.services.title')}</h2>
            </div>
            <Link to="/leistungen" className="hidden items-center gap-1.5 text-sm font-semibold text-copper-2 hover:text-ivory sm:flex">
              {t('home.services.all')} <ChevronRight size={16} aria-hidden />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-4">
            {featured.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate('/buchen', { state: { serviceId: s.id } })}
                className="lift group relative overflow-hidden rounded-2xl border border-white/8 bg-ink-2 text-left shadow-soft transition-colors hover:border-copper/45 focus-visible:border-copper"
              >
                <div className="relative h-36 overflow-hidden sm:h-40">
                  <img src={s.img} alt={s.name[lang]} loading="lazy" className="img-zoom h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/35 to-transparent" aria-hidden />
                  {s.best && (
                    <span className="absolute left-3 top-3 rounded-full border border-copper/50 bg-ink/85 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-copper-2 backdrop-blur">
                      ★ {t('services.popular')}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-ivory">{s.name[lang]}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-display text-xl font-black text-copper-2">€{s.price}</span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-taupe-2"><Clock size={12} aria-hidden />{s.duration} {t('common.min')}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <Link to="/leistungen" className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-copper-2 sm:hidden">
            {t('home.services.all')} <ChevronRight size={16} aria-hidden />
          </Link>
        </div>
      </section>

      {/* ════════ TEAM PREVIEW ════════ */}
      <section className="border-y border-white/5 bg-ink-2 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Kicker>{t('home.team.kicker')}</Kicker>
              <h2 className="font-display text-4xl font-black tracking-tight text-ivory sm:text-5xl">{t('home.team.title')}</h2>
            </div>
            <Link to="/team" className="hidden items-center gap-1.5 text-sm font-semibold text-copper-2 hover:text-ivory sm:flex">
              {t('home.team.all')} <ChevronRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {BARBERS.map((b) => (
              <Link key={b.id} to="/team" className="lift group overflow-hidden rounded-2xl border border-white/8 bg-ink-3 shadow-soft">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={b.img} alt={`${b.name} — ${b.role[lang]}`} loading="lazy" className="img-zoom h-full w-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <p className="font-display text-base font-bold text-ivory sm:text-lg">{b.name}</p>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-copper-2 sm:text-[10px]">{b.spec[lang]}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ ATMOSPHERE + WHY ════════ */}
      <section className="grid lg:grid-cols-2">
        <div className="relative min-h-[320px] overflow-hidden sm:min-h-[420px]">
          <img src="/images/about-atmo.jpg" alt={lang === 'de' ? 'Barber-Stühle im Vienna Cuts Studio — Leder und Messing' : 'Barber chairs inside the Vienna Cuts studio — leather and brass'} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/35 to-ink/10 lg:bg-gradient-to-r lg:from-transparent lg:via-ink/30 lg:to-ink" aria-hidden />
          <div className="absolute bottom-6 left-5 max-w-xs sm:left-8">
            <Kicker>{t('home.atmo.kicker')}</Kicker>
            <h2 className="font-display text-3xl font-black text-ivory">{t('home.atmo.title')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ivory-2/90">{t('home.atmo.text')}</p>
          </div>
        </div>
        <div className="bg-ink px-5 py-14 sm:px-10 lg:py-20">
          <Kicker>{t('home.why.kicker')}</Kicker>
          <h2 className="font-display text-3xl font-black tracking-tight text-ivory sm:text-4xl">{t('home.why.title')}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {[['1', 'why.1t', 'why.1d'], ['2', 'why.2t', 'why.2d'], ['3', 'why.3t', 'why.3d'], ['4', 'why.4t', 'why.4d']].map(([n, titleKey, descKey]) => (
              <div key={n} className="rounded-2xl border border-white/6 bg-ink-2 p-5">
                <span className="font-display text-3xl font-black text-copper/70">0{n}</span>
                <h3 className="mt-2 font-display text-base font-bold text-ivory">{t(titleKey)}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ivory-3/85">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="dot-grid bg-ink py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 text-center sm:px-6 lg:px-8">
          <Kicker><span className="mx-auto">{t('home.steps.kicker')}</span></Kicker>
          <h2 className="font-display text-3xl font-black tracking-tight text-ivory sm:text-4xl">{t('home.steps.title')}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[['1', 'step.1t', 'step.1d'], ['2', 'step.2t', 'step.2d'], ['3', 'step.3t', 'step.3d']].map(([n, titleKey, descKey]) => (
              <div key={n} className="relative rounded-2xl border border-copper/20 bg-gradient-to-b from-ink-2 to-ink-3 p-6 text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-copper font-display text-lg font-black text-ink">{n}</span>
                <h3 className="mt-4 font-display text-lg font-bold text-ivory">{t(titleKey)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ivory-3/85">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ REVIEWS (labeled demo) ════════ */}
      <section className="border-t border-white/5 bg-ink-2 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Kicker>{t('home.reviews.kicker')}</Kicker>
          <h2 className="font-display text-3xl font-black tracking-tight text-ivory sm:text-4xl">{t('home.reviews.title')}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="flex flex-col rounded-2xl border border-white/8 bg-ink-3 p-6">
                <div className="flex gap-0.5" aria-label="5 / 5 stars">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} size={15} className="fill-copper text-copper" aria-hidden />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ivory-2">“{r.text[lang]}”</blockquote>
                <figcaption className="mt-5 border-t border-white/8 pt-4">
                  <p className="text-sm font-bold text-ivory">{r.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-taupe-2">{r.service} · {lang === 'de' ? 'fiktiver Gast' : 'fictional guest'}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-taupe">{t('home.reviews.note')}</p>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="relative overflow-hidden">
        <img src="/images/gallery-4.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-ink/78" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-6">
          <Scissors className="mx-auto text-copper-2" size={30} aria-hidden />
          <h2 className="mt-5 font-display text-4xl font-black leading-[1.02] tracking-tight text-ivory sm:text-6xl">{t('home.cta.title')}</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-ivory-2/90 sm:text-base">{t('home.cta.text')}</p>
          <button
            onClick={() => navigate('/buchen')}
            className="mt-8 inline-flex h-13 items-center gap-2.5 rounded-xl bg-copper px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink shadow-[0_18px_50px_-12px] shadow-copper/70 transition-all hover:scale-[1.04] hover:bg-copper-2 active:scale-95"
          >
            <CalendarCheck size={18} aria-hidden /> {t('home.cta.btn')}
          </button>
        </div>
      </section>
    </>
  );
}
