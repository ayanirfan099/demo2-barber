import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Scissors, Star } from 'lucide-react';
import { useApp } from '../lib/app-context';
import { BARBERS } from '../lib/data';
import { Kicker, DemoNote } from '../components/Shared';

export default function Team() {
  const { t, lang } = useApp();
  const navigate = useNavigate();

  return (
    <div className="bg-ink-2 pt-24 sm:pt-28">
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="max-w-2xl">
          <Kicker>{t('team.kicker')}</Kicker>
          <h1 className="font-display text-5xl font-black tracking-tight text-ivory sm:text-6xl">{t('team.title')}</h1>
          <p className="mt-4 text-base leading-relaxed text-ivory-3">{t('team.sub')}</p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {BARBERS.map((b) => (
            <article key={b.id} className="lift group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-ink-3 shadow-soft transition-colors hover:border-copper/45">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={b.img}
                  alt={`${b.name} — ${b.role[lang]}, Vienna Cuts Studio (${lang === 'de' ? 'fiktive Person' : 'fictional person'})`}
                  loading="lazy"
                  className="img-zoom h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-3 via-ink-3/25 to-transparent" aria-hidden />
                <div className="absolute bottom-3 left-4 right-4">
                  <h2 className="font-display text-2xl font-black text-ivory">{b.name}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper-2">{b.role[lang]}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ivory-3"><Scissors size={12} className="text-copper" aria-hidden />{b.spec[lang]}</p>
                  <p className="flex items-center gap-1 whitespace-nowrap text-[11px] font-bold text-copper-2"><Star size={12} className="fill-copper-2" aria-hidden />{b.years} <span className="hidden font-medium text-taupe-2 min-[420px]:inline">{t('team.years')}</span></p>
                </div>
                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-ivory-3/90">{b.bio[lang]}</p>
                <button
                  onClick={() => navigate('/buchen', { state: { barberId: b.id } })}
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-copper text-xs font-bold uppercase tracking-[0.16em] text-ink transition-all hover:bg-copper-2 active:scale-[0.98]"
                >
                  <CalendarCheck size={15} aria-hidden /> {t('team.book', { name: b.name.split(' ')[0] })}
                </button>
              </div>
            </article>
          ))}
        </div>

        <DemoNote text={t('team.note')} className="mt-8" />
      </div>
    </div>
  );
}
